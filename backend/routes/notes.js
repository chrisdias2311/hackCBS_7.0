const express = require('express');
const router = express.Router();
const axios = require('axios');

const marked = require('marked');

const path = require('path');

const htmlToPdf = require('html-to-pdf');
const { JSDOM } = require('jsdom');

const fs = require('fs');
const markdownIt = require('markdown-it');
const puppeteer = require('puppeteer');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const bucket = require('../firebase'); // Import the Firebase bucket

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Notes = require('../schemas/NotesSchema');
const MeetingReports = require('../schemas/MeetingReportsSchema');
const { NotFoundError, ValidationError, InternalServerError } = require('./errors');

// const { processVideo } = require('../utils/videoModel');
// const { image } = require('@tensorflow/tfjs-node');


// imports for video 
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const https = require('https')


const genAI = new GoogleGenerativeAI("AIzaSyAGbRvDFK9HwhytwYY9613KTZTfh94GWWo");

router.post('/simplify_notes', async (req, res) => {
    try {
        const notes = req.body.notes;
        console.log("Notes", req.body);

        const simplifiedNotes = await generateSimplifiedNotes(notes);
        return res.json({ simplifiedNotes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

async function generateSimplifiedNotes(notes) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Reached here", notes);
    const prompt = `Hey, can you please explain these notes to me like a 15 year old? ${notes}`;

    const result = await model.generateContent(prompt);

    console.log("Result", result);
    const response = await result.response;
    const simplifies_notes = response.text();
    console.log("Simplified Notes", simplifies_notes.bgMagenta.black);
    return simplifies_notes;
}


router.post('/save_context', async (req, res) => {
    try {
        const { meet_id, slideUrl, text } = req.body;

        // Validate input
        if (!meet_id || !slideUrl || !text) {
            return res.status(400).json({ message: 'Missing required fields: meet_id, slideUrl, and text are required.' });
        }

        let note = await Notes.findOne({ meet_id });

        if (!note) {
            note = new Notes({
                meet_id,
                context: [{ slideUrl, text }]
            });
        } else {
            note.context.push({ slideUrl, text });
        }

        await note.save();
        res.status(200).json({ message: 'Slide added successfully', note });
    } catch (err) {
        console.error('Error saving context:', err);

        // Handle specific known errors
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(422).json({ message: 'Validation error', details: err.errors });
        }

        // Handle other types of errors
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Helper function to convert image data to a format suitable for the generative model
function imageDataToGenerativePart(data, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(data).toString("base64"),
            mimeType
        },
    };
}

// Helper function to generate AI-based notes
async function generateAINotes(slideUrl, text, model) {
    try {
        const imageResponse = await axios.get(slideUrl, { responseType: 'arraybuffer' });
        const imageData = imageResponse.data;
        const imagePart = await imageDataToGenerativePart(imageData, "image/jpeg");

        const prompt = `You are given a transcript of a virtual lecture, a screenshot of the screen, or both. Your task is to create clear, concise, and well-structured notes for the student based on the provided input. Please follow these guidelines:
        1) Organize the content into a logical flow, grouping similar ideas and concepts together.
        2) Ensure the notes are crisp, avoiding unnecessary details, but still covering key concepts thoroughly.
        3) Use clear headings and bullet points where applicable to make the notes easy to understand and scan.
        4) Highlight any key points or information that the teacher explicitly mentions as important or likely to come in exams.
        5) If a screenshot is provided, incorporate any relevant diagrams, tables, or images from the screenshot into the notes.
        6) Ensure that any technical terms or complex concepts are explained in a simplified manner where necessary.
        Make sure the final notes are student-friendly and focused on providing maximum clarity and understanding. 
        7) If there are any diagrams or images, please mention (Search google for the Diagram/Image {Topic name})
        Transcript: ${text}.`;

        const result = await model.generateContent([prompt, imagePart]);
        const modelResponse = await result.response;
        return modelResponse.text().trim();
    } catch (error) {
        console.error('Error generating AI-based notes:', error);
        throw new InternalServerError('Failed to generate AI-based notes');
    }
}

async function generatePdfFromMarkdown(markdownContent, outputPath, heading) {
    // Initialize markdown-it
    const md = new markdownIt();
    console.log("Heading", heading);

    // Convert markdown content to HTML
    const htmlContent = md.render(markdownContent);


    // Wrap the HTML content with basic styling for headings, padding, and watermark
    const completeHtml = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              position: relative;
            }
            h1, h2, h3 { font-weight: bold; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
            p { margin: 10px 0; }

            /* Centered title styling */
            .title {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 40px;
            }

            /* Watermark container */
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(255, 0, 0, 0.2);
              z-index: -1; /* Behind the content */
              pointer-events: none; /* So that it doesn't interfere with text */
            }
          </style>
        </head>
        <body>
          <!-- Watermark applied to each page -->
          <div class="watermark">Moodlens</div>
          <!-- Centered title -->
          <div class="title">${heading}</div>
          ${htmlContent}
        </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF with custom margins and watermark
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_BIN || null
    });
    const page = await browser.newPage();
    await page.setContent(completeHtml);

    // Generate the PDF with defined page margins
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '20mm',
            bottom: '20mm',
            left: '15mm',
            right: '15mm',
        },
        printBackground: true, // Ensures the watermark is printed
    });

    await browser.close();
}


async function uploadPdfToFirebase(filePath, fileName) {
    const file = bucket.file(fileName);
    await file.save(fs.readFileSync(filePath), {
        metadata: { contentType: 'application/pdf' },
        public: true
    });
    return file.publicUrl();
}

// Main function to process notes and generate AI-based notes
async function processNotes(meet_id, model, file_name, title) {
    try {
        const note = await Notes.findOne({ meet_id });
        if (!note) {
            throw new NotFoundError('Context not found');
        }

        let aiNotes = '';

        if (note.context.length > 0) {
            for (const contextItem of note.context) {
                const { slideUrl, text } = contextItem;
                const aiNote = await generateAINotes(slideUrl, text, model);
                aiNotes += `\n${aiNote}`;
            }
        } else {
            throw new NotFoundError('No context items found');
        }

        // generatePdfFromMarkdown(aiNotes, 'notes.pdf').then(() => {
        //     console.log('PDF generated successfully!');
        // });    


        const pdfFilePath = path.join(__dirname, 'test/' + file_name + 'notes.pdf');
        await generatePdfFromMarkdown(aiNotes, pdfFilePath, title);

        // Upload PDF to Firebase
        const pdfUrl = await uploadPdfToFirebase(pdfFilePath, file_name + 'notes.pdf');
        console.log('PDF uploaded to Firebase:', pdfUrl);

        // Save AI notes and PDF URL to the database
        note.aiNotes = aiNotes;
        note.pdfUrl = pdfUrl;
        await note.save();

        // Clean up the local PDF file
        fs.unlinkSync(pdfFilePath);

        return { aiNotes, pdfUrl };

    } catch (error) {
        console.error('Error processing notes:', error);
        throw error;
    }
}

// Endpoint to generate AI-based notes
// Endpoint to generate AI-based notes
router.post('/generate_ai_notes', async (req, res) => {
    try {
        const { meet_id } = req.body;

        if (!meet_id) {
            throw new ValidationError('meet_id is required');
        }

        // Check if the note exists
        const note = await Notes.findOne({ meet_id });
        if (!note) {
            throw new NotFoundError('Note not found');
        }

        // Call processNotes function only if the note exists
        const meeting = await MeetingReports.findOne({ meet_id });
        let note_name = 'AIDS Lecture 5';
        if (meeting) {
            note_name = meeting.title;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const { aiNotes, pdfUrl } = await processNotes(meet_id, model, note_name + meet_id, note_name);

        // Update the note with the AI notes and PDF URL
        note.aiNotes = aiNotes;
        note.pdfUrl = pdfUrl;
        await note.save();

        res.status(200).json({ message: 'AI-based notes generated successfully', aiNotes, pdfUrl });
    } catch (err) {
        console.error('Error generating AI-based notes:', err);

        if (err instanceof NotFoundError || err instanceof ValidationError) {
            return res.status(err.statusCode).json({ message: err.message });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
});





const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const downloadVideo = (url, path) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve); // close() is async, call resolve after close completes.
            });
        }).on('error', (err) => {
            fs.unlink(path); // Delete the file async if there's an error
            reject(err.message);
        });
    });
};


const deleteVideoFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                console.error('Failed to delete the local video file:', err.message);
                reject(err);
            } else {
                console.log(`Deleted local video file: ${path}`);
                resolve();
            }
        });
    });
};

const processVideo = async (videoUrl) => {
    const localVideoFile = "video_480.webm"; // Path to save the downloaded video

    try {
        // Download the video
        console.log("Downloading video from URL...");
        await downloadVideo(videoUrl, localVideoFile);
        console.log(`Video downloaded and saved as ${localVideoFile}`);


        // Upload the video to the model
        console.log("Uploading video...");
        const uploadResponse = await fileManager.uploadFile(localVideoFile, {
            mimeType: "video/webm",
            displayName: "Lecture Video",
        });
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);


        // Verify the file upload state
        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === "PROCESSING") {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
            file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === "FAILED") {
            throw new Error("Video processing failed.");
        }

        console.log(`File ${file.displayName} is ready for inference as ${file.uri}`);

        let prompt = "This is a video of a live lecture. Please create detailed notes for the students to study this lecture. Make sure to include all the formulas and everything.";
        // if (notes && notes.trim() !== "") {
        //     prompt = `This is a video of a live lecture. These are the existing notes: ${notes}. Please create new notes which will include the existing notes as well as the new notes.`;
        // } else {
        //     console.log("Notes string is empty.");

        // }

        // Initialize GoogleGenerativeAI with your API_KEY
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
        });

        // Make the LLM request
        console.log("Making LLM inference request...");
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                },
            },
            { text: prompt },
        ]);

        // Print the response
        console.log(result.response.text());

        //Return the response
        return result.response.text();
    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Delete the local video file
        await deleteVideoFile(localVideoFile);
    }
};


router.post('/process_video', async (req, res) => {
    const { videoUrl, meet_id } = req.body;

    // Validate input
    if (!videoUrl || !meet_id) {
        return res.status(400).send({ error: 'Video URL and meet_id are required' });
    }

    try {
        // Process the video and get the notes
        // const finalNotes = await processVideo(videoUrl);
        let prompt = "This is a video of a live lecture. Please create detailed notes for the students to study this lecture. Make sure to include all the formulas and everything.";
        const finalNotes = await processVideo(videoUrl, prompt);

        // Create a new entry in the database
        const notes = new Notes({
            meet_id,
            aiNotes: finalNotes,
            pdfUrl: ''
        });

        // Save the notes to the database
        await notes.save();

        res.status(200).send({ message: 'Video processing completed and notes updated', CurrentNotes: finalNotes });
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).send({ error: 'Failed to process video' });
    }
});


// POST request to get notes by meet_id
router.post('/get_note', async (req, res) => {
    try {
        const { meet_id } = req.body;

        // Validate meet_id
        if (!meet_id) {
            return res.status(400).send({ error: 'meet_id is required' });
        }

        if (typeof meet_id !== 'number') {
            return res.status(400).send({ error: 'meet_id must be a number' });
        }

        // Find the note entry with the specified meet_id
        const notes = await Notes.findOne({ meet_id });
        if (!notes) {
            return res.status(404).send({ error: 'Notes not found' });
        }

        res.status(200).send({ message: 'Notes retrieved successfully', notes });
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).send({ error: 'Failed to retrieve notes' });
    }
});



module.exports = router;

const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Test = require('../schemas/TestSchema');
const Notes = require('../schemas/NotesSchema');
const TestScore = require('../schemas/TestScoreSchema');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const { processVideo } = require('../utils/videoModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Store chat sessions and history for each user
const userChats = new Map();
const userHistory = new Map();

const handleStartTest = (socket) => {
    console.log('a user connected');

    // Handle start_test event
    socket.on('start_test', async (data) => {
        const { test_id } = data;
        console.log('start_test event received:', test_id);
        try {
            // Fetch the test based on its ObjectId
            const test = await Test.findById(test_id).populate('context.lectureNotes');

            if (!test) {
                socket.emit('error', 'Test not found');
                console.log('Test not found');
                return;
            }

            let context = '';

            // Traverse the lectureNotes array and get the aiNotes
            for (const noteId of test.context.lectureNotes) {
                const note = await Notes.findById(noteId);
                if (note && note.aiNotes) {
                    context += note.aiNotes + ' ';
                }
            }

            // Traverse the externalDocuments array and extract text from PDFs
            for (const pdfUrl of test.context.externalDocuments) {
                const pdfBuffer = await fetchPdfFromFirebase(pdfUrl);
                const pdfText = await extractTextFromPdf(pdfBuffer);
                context += pdfText + ' ';
            }

            context += "\n This is the context. Please ask a single question based on this context. Choose the question randomly from anywhere in the notes. Once you receive a satisfactory answer, you can ask another question. Please note that your response should be a single line, for example: 'What is the capital of India?'";

            // Create a new chat session for the user based on the context
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "You will be provided with a set of notes on a particular topic. Imagine you are a subject matter expert conducting a viva examination with a student." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Got it! Please share the notes or the topic, and I’ll frame viva questions based on them." }],
                    },
                    {
                        role: "user",
                        parts: [{ text: context }],
                    }
                ],
            });

            // Store the chat session and history for the user
            userChats.set(socket.id, chat);
            userHistory.set(socket.id, []);

            // Ask questions based on the context
            const result = await chat.sendMessage(context);
            const response = result.response.text();
            console.log("this is the response", response);

            // Send the response back to the client
            socket.emit('questions', response);

        } catch (error) {
            console.error('Error starting test:', error);
            socket.emit('error', 'Failed to start test');
        }
    });

    // Handle incoming messages from the user for continuous chat
    socket.on('message', async (data) => {
        const { message } = data;

        console.log('message received:', message);

        const prompt = `If the answer is satisfactory:
        Cross-question: Ask follow-up questions to delve deeper into the student's understanding and explore potential nuances or alternative perspectives. For example:
        "Can you elaborate on why you think [point from their answer]?"
        "Are there any exceptions or counterexamples to your argument?"
        Ask a new question: Introduce a related topic or a different aspect of the same concept to broaden the discussion. For example:
        "How does this concept relate to [another relevant topic]?"
        "Can you think of real-world examples where this principle is applied?"
        Provide additional context: Offer more information or background knowledge to enrich the student's understanding and encourage further exploration. For example:
        "Did you know that [interesting fact related to the topic]?"
        "Here's a more detailed explanation of [complex concept]..."
        Cross-question only twice: Limit the number of follow-up questions to two to maintain a balance between depth and breadth of discussion.
        
        
        If the answer is good or excellent:
        Challenge the student: Pose a more complex question or present a counterargument to stimulate critical thinking and encourage the student to defend their position. For example:
        "What if we consider [alternative perspective]?"
        "Can you address the potential drawbacks or limitations of your approach?"
        Ask a higher-order question: Prompt the student to analyze, evaluate, or synthesize information, rather than simply recall facts. For example:
        "How would you apply this knowledge to solve a real-world problem?"
        "Compare and contrast the advantages and disadvantages of different methods for [task]."
        Offer opportunities for extension: Suggest additional resources or activities that the student can explore to further their learning. For example:
        "Have you read [relevant book or article]?"
        "You might find this online course or workshop interesting: [link]`

        const newMessage = prompt + "\n" + message + "Please note that your response should be a single line for eg: 'What is the capital of India?'";

        // Retrieve the chat session and history for the user
        const chat = userChats.get(socket.id);
        const history = userHistory.get(socket.id);

        if (!chat) {
            console.error('Chat session not found for socket id:', socket.id);
            socket.emit('error', 'Chat session not found. Please start the test first.');
            return;
        }

        try {
            // Send the message to the chat session and get the response
            const result = await chat.sendMessage(newMessage);
            const response = result.response.text();
            console.log("this is the response", response);

            // Store the question and answer in the history
            history.push({ question: message, answer: response });
            userHistory.set(socket.id, history);

            // Send the response back to the client
            socket.emit('response', response);
        } catch (error) {
            console.error('Error during chat session:', error);
            socket.emit('error', 'Failed to process message');
        }
    });

    // Handle end_test event
    socket.on('end_test', async (data) => {
        const { test_id, student_id, videoUrl } = data;
        // find the maximum marks for the test
        const test = await Test.findById(test_id);
        if (!test) {
            socket.emit('error', 'Test not found');
            console.log('Test not found');
            return;
        }
        
        console.log('end_test event received');

        try {
            // Retrieve the chat session and history for the user
            const chat = userChats.get(socket.id);
            const history = userHistory.get(socket.id);

            if (!chat || !history) {
                socket.emit('error', 'No active test session found');
                console.log('No active test session found');
                return;
            }

            // Prepare the evaluation prompt with the history
            let evaluationPrompt = `Please evaluate the student's performance and calculate the marks out of 100, taking into account the difficulty of the questions asked and the quality of the answers provided during the test. Ensure that the student has answered at least 4 questions.
            
            Your response should include a single number representing the marks (between 0 and 100), along with the feedback for the student's performance and a summary of the oral exam.
            
            The response must be in JSON format, and the output should be structured as follows:

            {
                "feedback": "Feedback here",
                "summary": "Summary here",
                "marks": Test score in Number format here
            }`;

            evaluationPrompt += "Questions and Answers:\n";

            history.forEach((item, index) => {
                evaluationPrompt += `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}\n\n`;
            });

            const result = await chat.sendMessage(evaluationPrompt);
            let responseText = result.response.text();
            console.log("Evaluation response:", responseText);

            // Clean the response text
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            // Parse the response as JSON
            let evaluationResponse;
            try {
                evaluationResponse = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing evaluation response:', error);
                socket.emit('error', 'Failed to parse evaluation response');
                return;
            }

            //Call the processVideo function to process the video
            const proctoringPrompt = `This is a video of a student who is attempting for a test. Please check if the student is cheating or using any unfair means during the test. You can also check if the student is copying from any external sources. Please provide a summary of the proctoring activity. The response must be in JSON format, and the output should be structured as follows:

            {
                "copied": true/false,
                "proctoringSummary": "Short summary of the proctoring activity here. Provide the reason for marking as copied or not copied."
            }`;
            let proctoringResponse = await processVideo(videoUrl, proctoringPrompt);

            //clean the protoring response text 
            proctoringResponse = proctoringResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                proctoringResponse = JSON.parse(proctoringResponse)
            } catch (error) {
                console.error('Error parsing proctoring response:', error);
                socket.emit('error', 'Failed to parse proctoring response');
                return;
            }

            // Save the evaluation result to the database
            const testScore = new TestScore({
                test_id: test_id,
                student_id: student_id,
                score: evaluationResponse.marks,
                summary: evaluationResponse.summary,
                feedback: evaluationResponse.feedback,
                copied: proctoringResponse.copied,
                proctoringSummary: proctoringResponse.proctoringSummary
            });
            await testScore.save();

            // Send the evaluation response back to the client
            socket.emit('evaluation', evaluationResponse);

        } catch (error) {
            console.error('Error ending test:', error);
            socket.emit('error', 'Failed to end test');
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {

        console.log('user disconnected');
        userChats.delete(socket.id);
        userHistory.delete(socket.id);
    });
};

const fetchPdfFromFirebase = async (pdfUrl) => {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    return response.data;
};

const extractTextFromPdf = async (pdfBuffer) => {
    const data = await pdfParse(pdfBuffer);
    return data.text;
};

module.exports = { handleStartTest };
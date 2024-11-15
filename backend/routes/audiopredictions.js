const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const axios = require("axios");
const fs = require("fs");
const sharp = require("sharp");
const https = require("https");

const MeetingReport = require("../schemas/MeetingReportsSchema");
const MeetingTimestamp = require("../schemas/MeetingTimestampsSchema");
const StudentReport = require("../schemas/StudentReportSchema");
const e = require('express');
const { timeStamp } = require('console');

const { GoogleAIFileManager } = require('@google/generative-ai/server');


const genAI = new GoogleGenerativeAI("AIzaSyAGbRvDFK9HwhytwYY9613KTZTfh94GWWo");


const FileState = {
    PROCESSING: 'PROCESSING',
    FAILED: 'FAILED',
    COMPLETED: 'COMPLETED', // Add other states if necessary
};
// Function to fetch and upload audio file from cloud URL
async function audioToEmotion(audioUrl) {


    // Fetch the audio file from the URL
    const response = await axios({
        url: audioUrl,
        method: 'GET',
        responseType: 'stream',
    });

    // Save the audio file to a temporary location
    const tempFilePath = './temp.wav';
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    // Upload the fetched audio file to the file manager
    const uploadResult = await fileManager.uploadFile(
        tempFilePath,
        {
            mimeType: "audio/wav",
            displayName: "Audio sample",
        },
    );

    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
        process.stdout.write(".");
        // Sleep for 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        // Fetch the file from the API again
        file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed.");
    }

    // View the response.
    console.log(
        `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
        `Analyze the following audio and identify the student's most likely emotion
      (Choose from: surprised, confused, happy, bored).
      
      If any of these scenarios occur with student {Answer correct,
          Enjoy lesson,
          Understand concept,
          Work with peers,
          Feel supported,
          Control learning,
          Celebrate success,
          Connect with friends,
          Learn at own pace,
          Tech works well,
          Prefer online learning} the student is happy.
      
      If any of these scenarios happen {Unexpected announcement
          Guest speaker joins
          Technical glitch occurs
          Teacher makes a joke
          Learn something new
          See classmate online
          Win a game or contest
          Break from routine
          Teacher gives praise
          Unexpected question} the student is surprised.
  
      If any of these scenarios occur {Miss key instruction
          Technical issues arise
          Unclear explanation
          Fast lecture pace
          New vocabulary used
          Complex concept introduced
          Forget key information
          Hear unclear audio
          Lack practice opportunity
          Miss classmate explanation} the student is confused.
      
      If any of these scenarios occur {Repetitive material
          Unengaging activity
          Passive learning style
          Lack of interaction
          Technical difficulties
          Distracting environment
          Unclear learning goals
          Predictable routine
          Slow lecture pace
          Irrelevant content} the student is bored.
      
         Give the Answer in one word which is the most likely emotion & keep it in lowercase.`,

        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
            },
        },
    ]);;

    const emotion = result.response.text();
    console.log("the emotion is: ", emotion);
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    return emotion;
}

async function textToEmotion(studentPID, message) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the following message and identify the student's most likely emotion: ${message} (Choose from: Surprised, Confused, Happy, Bored).
    
    If any of these scenarios occur with student {Answer correct,
        Enjoy lesson,
        Understand concept,
        Work with peers,
        Feel supported,
        Control learning,
        Celebrate success,
        Connect with friends,
        Learn at own pace,
        Tech works well,
        Prefer online learning} the student is happy.
    
    If any of these scenarios happen {Unexpected announcement
        Guest speaker joins
        Technical glitch occurs
        Teacher makes a joke
        Learn something new
        See classmate online
        Win a game or contest
        Break from routine
        Teacher gives praise
        Unexpected question} the student is surprised.

    If any of these scenarios occur {Miss key instruction
        Technical issues arise
        Unclear explanation
        Fast lecture pace
        New vocabulary used
        Complex concept introduced
        Forget key information
        Hear unclear audio
        Lack practice opportunity
        Miss classmate explanation} the student is confused.
    
    If any of these scenarios occur {Repetitive material
        Unengaging activity
        Passive learning style
        Lack of interaction
        Technical difficulties
        Distracting environment
        Unclear learning goals
        Predictable routine
        Slow lecture pace
        Irrelevant content} the student is bored.
    
    Give the Answer in one word which is the most likely emotion.`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emotion = response.text();
    console.log("the emotion is: ", emotion);
    // return { studentPID, message, emotion };
    return emotion;
}


// POST request to analyze emotion from the provided message
router.post('/audio_to_emotion', async (req, res) => {
    try {
        const { meet_id, host_id, studentPID, audio_url, time_stamp } = req.body; // Extract studentPID and message from request body
        if (!meet_id || !host_id || !studentPID || !audio_url) throw new Error("Student PID and message are required.");

        // var emotion = await textToEmotion(studentPID, audio_message);
        var emotion = await audioToEmotion(audio_url);

        //Process the emotion (remove extra stuff from the string)
        const emotionArr = ["happy", "confused", "surprised", "bored"];
        const regex = new RegExp(emotionArr.join("|"), "i");
        emotion = emotion.trim().toLowerCase();
        const match = emotion.match(regex);

        if (match) emotion = match[0];




      






        // Save the emotion to the database
        const meetReport = await updateMeetingReport(meet_id, host_id, emotion);    //done
        updateStudentReport(meet_id, studentPID, emotion);                          //done    
        await createMeetingTimestamp(meet_id, host_id, time_stamp, emotion);


        console.log(meetReport);
        res.json(meetReport); // Send response as JSON

    } catch (error) {
        res.status(400).json({ error: error.message }); // Send error as JSON
        console.log(error);
    }
});

async function updateStudentReport(meet_id, studentPID, emotion) {
    // Check if the student report exists
    const existingStudentReport = await StudentReport.findOne({ meet_id: meet_id, student_id: studentPID });

    if (!existingStudentReport) {
        await createStudentReport(meet_id, studentPID);
    }

    console.log(`audio_emotions.0.${emotion}`);
    // Increment the existing emotion class value
    await StudentReport.updateOne(
        { meet_id: meet_id, student_id: studentPID },
        { $inc: { [`audio_emotions.0.${emotion}`]: 1 } }
    );
}
async function createStudentReport(meet_id, studentPID) {
    // Create a new student report with video_emotions initialized to an array containing the first emotion class
    const newStudentReport = new StudentReport({
        meet_id: meet_id,
        student_id: studentPID
    });

    // Save the new student report
    await newStudentReport.save();
}

async function updateMeetingReport(meet_id, host_id, emotion) {
    let existingMeetingReport = await MeetingReport.findOne({ meet_id: meet_id });

    if (!existingMeetingReport) {
        await insertMeetingReport(meet_id, host_id);
        existingMeetingReport = await MeetingReport.findOne({ meet_id: meet_id });
    }

    // Increment the existing emotion class value and return the updated document
    const updatedMeetingReport = await MeetingReport.findOneAndUpdate(
        { meet_id: meet_id },
        { $inc: { [`audio_emotions.0.${emotion}`]: 1 } },
        { new: true }  // This option asks Mongoose to return the updated version of the document
    );

    return updatedMeetingReport;
}

async function insertMeetingReport(meet_id, host_id) {
    const newMeetingReport = new MeetingReport({
        meet_id: meet_id,
        host_id: host_id
    });

    // Save the new meeting report
    await newMeetingReport.save();
}



async function createMeetingTimestamp(meet_id, host_id, timeStamp, emotion) {
    // Find the meeting timestamp document for the current meeting id and modeType
    console.log("Reached here")
    let meetingTimestamp = await MeetingTimestamp.findOne({ meet_id: meet_id, modeType: "audio" });

    // If the document doesn't exist, create a new one
    if (!meetingTimestamp) {
        meetingTimestamp = new MeetingTimestamp({
            meet_id: meet_id,
            modeType: "audio",
            timestamps: []
        });
        console.log("Timestamp created: ", meetingTimestamp)
    }

    // Find the timestamp with the same value
    let timestamp = meetingTimestamp.timestamps.find(t => t.timeStamp === timeStamp);

    if (timestamp) {
        // If the timestamp exists, check if the emotion is present
        if (timestamp.emotions[0][emotion] !== undefined) {
            // If the emotion is present, increment its count
            timestamp.emotions[0][emotion]++;
        } else {
            // If the emotion is not present, add it with a count of 1
            timestamp.emotions[0][emotion] = 1;
        }
    } else {
        // If the timestamp doesn't exist, create a new one
        const report_no = meetingTimestamp.timestamps.length;
        const newTimestamp = {
            report_no: report_no,
            timeStamp: timeStamp,
            emotions: [{ [emotion]: 1 }] // Set the count of the specified emotion to 1
        };

        // Append the new timestamp to the timestamps array
        meetingTimestamp.timestamps.push(newTimestamp);
    }

    // Save the updated MeetingTimestamp
    await meetingTimestamp.save();
}

module.exports = router;
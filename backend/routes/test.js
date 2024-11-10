const express = require('express');
const Test = require('../schemas/TestSchema');
const Notes = require('../schemas/NotesSchema');
const TestScore = require('../schemas/TestScoreSchema');
const User = require('../schemas/UserSchema');
const MeetingReports = require('../schemas/MeetingReportsSchema');
const router = express.Router();
const mongoose = require('mongoose');

// Assuming you have a Test model

// POST request to create a new Test
// router.post('/create_test', async (req, res) => {
//     try {
//         const newTest = new Test(req.body);
//         const savedTest = await newTest.save();
//         res.status(201).json(savedTest);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });


// Helper function to calculate duration in minutes
const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
        return { hours: 1, minutes: 0 }; // Default to 1 hour if times are not provided
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        throw new Error('Invalid time format');
    }

    const startDate = new Date(0, 0, 0, startHours, startMinutes);
    const endDate = new Date(0, 0, 0, endHours, endMinutes);
    const durationInMinutes = (endDate - startDate) / 60000; // Convert milliseconds to minutes

    if(durationInMinutes < 0) return { hours: 1, minutes: 0 };

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    return { hours, minutes };
};

// Fetch lectures with notes API endpoint
router.post('/fetch_lecture_with_notes', async (req, res) => {
    try {
        const { host_id } = req.body;

        // Validate host_id
        if (!host_id) {
            return res.status(400).json({ message: 'host_id is required' });
        }

        // Search for all MeetingReports that have host_id and endTime present or not empty
        const meetings = await MeetingReports.find({
            host_id,
            endTime: { $ne: null, $ne: '' }
        });

        // Prepare the response
        const response = [];

        for (const meeting of meetings) {
            console.log(meeting);
            // Check if a test has been created for this meeting using lectureId
            const testExists = await Test.exists({ lectureId: meeting.meet_id });

            if (!testExists) {
                // Search for all notes in the NotesSchema based on the meet_id
                const notes = await Notes.find({ meet_id: meeting.meet_id });

                for (const note of notes) {
                    const lectureDuration = calculateDuration(meeting.startTime, meeting.endTime);
                    response.push({
                        note_id: note._id,
                        lectureTitle: meeting.title,
                        lectureDuration,
                        lectureId: meeting.meet_id // Include the _id of the Meeting report as lectureId
                    });
                }
            }
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching lectures with notes:', error);
        res.status(500).json({ message: 'Failed to fetch lectures with notes' });
    }
});

// router.post('/fetch_lecture_with_notes', async (req, res) => {
//     try {
//         const { host_id } = req.body;

//         // Validate host_id
//         if (!host_id) {
//             return res.status(400).json({ message: 'host_id is required' });
//         }

//         // Search for all MeetingReports that have host_id and endTime present or not empty
//         const meetings = await MeetingReports.find({
//             host_id,
//             endTime: { $ne: null, $ne: '' }
//         });

//         // Prepare the response
//         const response = [];

//         for (const meeting of meetings) {
//             // Check if a test has been created for this meeting using lectureId
//             const testExists = await Test.exists({ lectureId: meeting.lectureId });

//             if (!testExists) {
//                 // Search for all notes in the NotesSchema based on the meet_id
//                 const notes = await Notes.find({ meet_id: meeting.meet_id });

//                 for (const note of notes) {
//                     const lectureDuration = calculateDuration(meeting.startTime, meeting.endTime);
//                     response.push({
//                         note_id: note._id,
//                         lectureTitle: meeting.title,
//                         lectureDuration: `${lectureDuration.hours} hours and ${lectureDuration.minutes} minutes`
//                     });
//                 }
//             }
//         }

//         res.status(200).json(response);
//     } catch (error) {
//         console.error('Error fetching lectures with notes:', error);
//         res.status(500).json({ message: 'Failed to fetch lectures with notes' });
//     }
// });


router.post('/create_test', async (req, res) => {
    const { lectureId, createdBy, testName, context, startDateAndTime, endDateAndTime, maxDuration, maxMarks } = req.body;

    // Validate input
    if (!lectureId || !createdBy || !testName || !context || !context.lectureNotes || !context.externalDocuments || !startDateAndTime || !endDateAndTime || !maxDuration || !maxMarks) {
        return res.status(400).json({ message: 'Missing required fields in request body' });
    }

    try {
        // Create a new test
        const newTest = new Test({
            lectureId,
            createdBy,
            testName,
            context: {
                lectureNotes: context.lectureNotes,
                externalDocuments: context.externalDocuments
            },
            startDateAndTime,
            endDateAndTime,
            maxDuration,
            maxMarks
        });

        // Save the test to the database
        const savedTest = await newTest.save();
        res.status(201).json(savedTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// View live tests api endpoint
// router.post('/view_live_tests', async (req, res) => {
//     try {
//         const { createdBy } = req.body;

//         // Validate createdBy
//         if (!createdBy) {
//             return res.status(400).json({ message: 'createdBy is required' });
//         }

//         const currentDateTime = new Date();

//         // Find all tests with the specified createdBy and check if they are currently active
//         const liveTests = await Test.find({
//             createdBy,
//             startDateAndTime: { $lte: currentDateTime },  // Start date and time should be less than or equal to the current date and time
//             endDateAndTime: { $gte: currentDateTime }     // End date and time should be greater than or equal to the current date and time
//         });

//         res.status(200).json(liveTests);
//     } catch (error) {
//         console.error('Error retrieving live tests:', error);
//         res.status(500).json({ message: 'Failed to retrieve live tests' });
//     }
// });

// View live tests API endpoint
router.post('/view_live_tests', async (req, res) => {
    try {
        const { createdBy } = req.body;

        // Validate createdBy
        if (!createdBy) {
            return res.status(400).json({ message: 'createdBy is required' });
        }

        const currentDateTime = new Date();

        // Find all tests with the specified createdBy and check if they are currently active
        const liveTests = await Test.find({
            createdBy,
            startDateAndTime: { $lte: currentDateTime },  // Start date and time should be less than or equal to the current date and time
            endDateAndTime: { $gte: currentDateTime }     // End date and time should be greater than or equal to the current date and time
        });

        // Prepare the response
        const response = [];

        for (const test of liveTests) {
            // Count the number of completed tests
            const completedCount = await TestScore.countDocuments({ test_id: test._id });

            // Count the total number of students
            const totalStudents = await User.countDocuments();

            // Calculate the pending count
            const pendingCount = totalStudents - completedCount;

            response.push({
                test,
                completedCount,
                pendingCount,
                startDateAndTime: test.startDateAndTime,
                endDateAndTime: test.endDateAndTime,
                maxDuration: test.maxDuration,
                maxMarks: test.maxMarks
            });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving live tests:', error);
        res.status(500).json({ message: 'Failed to retrieve live tests' });
    }
});


//View past tests api endpoint
// router.post('/view_past_tests', async (req, res) => {
//     try {
//         const { createdBy } = req.body;

//         // Validate createdBy
//         if (!createdBy) {
//             return res.status(400).json({ message: 'createdBy is required' });
//         }

//         const currentDateTime = new Date();
//         console.log(currentDateTime);

//         // Find all tests with the specified createdBy and check if they are currently active
//         const pastTests = await Test.find({
//             createdBy,
//             endDateAndTime: { $lt: currentDateTime }    // End date and time should be less than the current date and time
//         });

//         res.status(200).json(pastTests);
//     } catch (error) {
//         console.error('Error retrieving past tests:', error);
//         res.status(500).json({ message: 'Failed to retrieve past tests' });
//     }
// });

router.post('/view_past_tests', async (req, res) => {
    try {
        const { createdBy } = req.body;

        // Validate createdBy
        if (!createdBy) {
            return res.status(400).json({ message: 'createdBy is required' });
        }

        const currentDateTime = new Date();
        console.log(currentDateTime);

        // Find all tests with the specified createdBy and check if they are past tests
        const pastTests = await Test.find({
            createdBy,
            endDateAndTime: { $lt: currentDateTime }    // End date and time should be less than the current date and time
        });

        // Prepare the response
        const response = [];

        for (const test of pastTests) {
            // Count the number of completed tests
            const completedCount = await TestScore.countDocuments({ test_id: test._id });

            // Count the total number of students
            const totalStudents = await User.countDocuments();

            // Calculate the pending count
            const pendingCount = totalStudents - completedCount;

            // Find the highest score for the test
            const highestScore = await TestScore.findOne({ test_id: test._id }).sort({ score: -1 }).limit(1);

            response.push({
                test,
                completedCount,
                pendingCount,
                highestScore: highestScore ? highestScore.score : 0,
                startDateAndTime: test.startDateAndTime,
                endDateAndTime: test.endDateAndTime,
                maxDuration: test.maxDuration,
                maxMarks: test.maxMarks
            });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving past tests:', error);
        res.status(500).json({ message: 'Failed to retrieve past tests' });
    }
});


module.exports = router;
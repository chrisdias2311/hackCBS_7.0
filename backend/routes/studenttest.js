const express = require('express');
const Test = require('../schemas/TestSchema');
const Notes = require('../schemas/NotesSchema');
const TestScore = require('../schemas/TestScoreSchema');
const User = require('../schemas/UserSchema');
const MeetingReports = require('../schemas/MeetingReportsSchema');
const router = express.Router();
const mongoose = require('mongoose');


// View live tests API endpoint
router.get('/view_live_tests', async (req, res) => {
    try {

        const currentDateTime = new Date();

        // Find all tests with the specified createdBy and check if they are currently active
        const liveTests = await Test.find({
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

router.get('/view_past_tests', async (req, res) => {
    try {

        const currentDateTime = new Date();
        console.log(currentDateTime);

        // Find all tests with the specified createdBy and check if they are past tests
        const pastTests = await Test.find({
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
const express = require('express');
const Teacher = require('../schemas/TeacherSchema');
const router = express.Router();
const bcrypt = require('bcrypt');
const Meet_Report = require('../schemas/MeetingReportsSchema')
const Notes = require('../schemas/NotesSchema')

router.post("/signup", async (req, res) => {
    const saltRounds = 10;
    try {
        const teacher = await Teacher.findOne({ hostId: req.body.hostId });
        if (teacher) return res.status(400).json({ message: "Account already exists", teacher: null });

        // bcrypt encryption
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Error generating hash', teacher: null });
            } else {
                const newTeacher = new Teacher({
                    hostId: req.body.hostId,
                    email: req.body.email,
                    userName: req.body.userName.toLowerCase(),
                    phone: req.body.phone,
                    password: hash
                });

                // save teacher here
                newTeacher.save()
                    .then(() => {
                        console.log('Teacher created');
                        res.status(200).json({ message: 'Account created successfully', teacher: newTeacher });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ message: 'Failed to create account', teacher: null });
                    });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', teacher: null });
    }
});


router.post("/login", async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        // Convert username to lowercase
        const lowerCaseUsername = req.body.userName.toLowerCase();

        // Find the teacher with the given username
        const teacher = await Teacher.findOne({ userName: lowerCaseUsername });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found", teacher: null });
        }

        // If password is provided, use password for authentication
        if (password) {
            bcrypt.compare(password, teacher.password, function(err, result) {
                if (result == true) {
                    return res.status(200).json({ message: "Logged in successfully", teacher });
                } else {
                    return res.status(200).json({ message: "Incorrect password", teacher: null });
                }
            });
        }

        // If password is not provided, return an error
        if (!password) {
            return res.status(400).send("Missing password in request body");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', teacher: null });
    }
});

//Fetches the notes of a particular teacher 
router.post('/fetch_notes', async (req, res) => {
    const { teacher_id } = req.body;

    // Validate input
    if (!teacher_id) {
        return res.status(400).send({ error: 'Missing teacher_id in request body' });
    }

    try {
        // Find all meeting reports where host_id equals teacher_id
        const meetingReports = await Meet_Report.find({ host_id: teacher_id });

        // Check for notes corresponding to each meeting's meet_id
        const meetingsWithNotes = await Promise.all(meetingReports.map(async (meeting) => {
            const notes = await Notes.findOne({ meet_id: meeting.meet_id });
            if (notes) {
                return {
                    noteId: notes._id,
                    meetingTitle: meeting.title
                };
            }
            return null;
        }));

        // Filter out null values
        const filteredMeetingsWithNotes = meetingsWithNotes.filter(meeting => meeting !== null);

        res.status(200).json({ meetingsWithNotes: filteredMeetingsWithNotes });
    } catch (error) {
        console.error('Error checking meetings and notes:', error);
        res.status(500).json({ error: 'Failed to check meetings and notes' });
    }
});

module.exports = router;


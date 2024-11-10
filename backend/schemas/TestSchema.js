const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const TestSchema = new Schema({
//     lectureId: {
//         type: Number,
//     },
//     testName: {
//         type: String,
//         required: true
//     },
//     context: {
//         type: String,
//         required: true
//     },
//     startDateAndTime: {
//         type: Date,
//         required: true
//     },
//     endDateAndTime: {
//         type: Date,
//         required: true
//     },
//     maxDuration: {
//         type: Number, // Duration in minutes
//         required: true
//     },
//     maxMarks: {
//         type: Number,
//         required: true
//     }
// });

const TestSchema = new Schema({
    lectureId: {
        type: Number,
    },
    createdBy: {    
        type: Number, 
        required: true
    },
    testName: {
        type: String,
        required: true
    },
    context: {
        lectureNotes: {
            type: [mongoose.Schema.Types.ObjectId], // Array of note IDs
            ref: 'Notes', // Reference to the Notes model
            required: true
        },
        externalDocuments: {
            type: [String], // Array of links to external documents
            required: true
        }
    },
    startDateAndTime: {
        type: Date,
        required: true
    },
    endDateAndTime: {
        type: Date,
        required: true
    },
    maxDuration: {
        type: Number, // Duration in minutes
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Test', TestSchema);

// Method to check if the current date and time falls within the test's date and time range
// TestSchema.methods.isCurrentDateTimeWithinRange = function() {
//     const now = new Date();
//     const startDateTime = new Date(this.startDate);
//     const endDateTime = new Date(this.endDate);

//     // Combine startDate with startTime and endDate with endTime
//     startDateTime.setHours(this.startTime.getHours(), this.startTime.getMinutes(), this.startTime.getSeconds());
//     endDateTime.setHours(this.endTime.getHours(), this.endTime.getMinutes(), this.endTime.getSeconds());

//     return now >= startDateTime && now <= endDateTime;
// };

module.exports = mongoose.model('Test', TestSchema);
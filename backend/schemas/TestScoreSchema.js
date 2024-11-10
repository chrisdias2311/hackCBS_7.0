const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestScoreSchema = new Schema({
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    student_id: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    feedback: {
        type: String,
    },
    summary: {
        type: String,
    },
    copied:{
        type: Boolean,
        default: false
    },
    proctoringSummary: {
        type: String,
    },  
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TestScore', TestScoreSchema);
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const NotesSchema = new Schema({
//     meet_id: {
//         type: String,
//         required: true
//     },
//     context: [
//         {
//             slideUrl: {
//                 type: String,
//                 required: true
//             },
//             text: {
//                 type: String,
//                 required: true
//             }
//         }
//     ],
//     aiNotes: {
//         type: String
//     },
//     pdfUrl: {
//         type: String
//     }
// });

// module.exports = mongoose.model('Notes', NotesSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
    meet_id: {
        type: Number,
        required: true
    },
    aiNotes: {
        type: String
    },
    pdfUrl: {
        type: String
    }
});

module.exports = mongoose.model('Notes', NotesSchema);
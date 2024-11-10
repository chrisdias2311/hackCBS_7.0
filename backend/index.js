const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
var bodyParser = require('body-parser');
// const userRoutes = require('./routes/user');
// const User = require('./schemas/Userschema')
const cors = require('cors')
const ConnectionDB = require("./database");
// const passport = require("passport");
// const { initializingPassport } = require('./middlewares/passportConfig');
// const expressSession = require('express-session')
// const jwt = require("jsonwebtoken")
const colors = require('colors');
const morgan = require('morgan');
const statusOfExpress = require('express-status-monitor');

const { Server } = require('socket.io');


ConnectionDB();

// app.use(express.json());
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(morgan('dev'));
app.use(statusOfExpress());



//API routes here 
app.use('/api/predict', require('./routes/predict'))
app.use('/api/predict_gemini', require('./routes/gemini'))

app.use('/api/v1/user', require('./routes/user'))
app.use('/api/v1/teacher', require('./routes/teacher'))
app.use('/api/v1/meeting', require('./routes/meetings'))
app.use('/api/v1/video', require('./routes/videopredictions'))
app.use('/api/v1/text', require('./routes/textpredictions'))
app.use('/api/v1/audio', require('./routes/audiopredictions'))

app.use('/api/v1/teacher_reports', require('./routes/teacher_reports'))
app.use('/api/v1/student_reports', require('./routes/parentreports'))
app.use('/api/v1/notes', require('./routes/notes'))

//Routes for Assessment
app.use('/api/v1/test', require('./routes/test'))
app.use('/api/v1/student_test', require('./routes/studenttest'))



// const API_KEY = "AIzaSyAGbRvDFK9HwhytwYY9613KTZTfh94GWWo"
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Attach socket.io to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
const { handleConnection } = require('./routes/orals');
const { handleStartTest } = require('./sockets/orals')

io.on('connection', handleStartTest);


const PORT = 5000
// app.listen(PORT, () => {
//     console.log(`server is running on port ${PORT}`.bgYellow.green);
// })

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`.bgYellow.green);
});
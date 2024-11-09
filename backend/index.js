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


app.use('/api/v1/user', require('./routes/user'))
app.use('/api/v1/teacher', require('./routes/teacher'))


server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`.bgYellow.green);
});
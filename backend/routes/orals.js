const { GoogleGenerativeAI } = require('@google/generative-ai');
const API_KEY = "AIzaSyAGbRvDFK9HwhytwYY9613KTZTfh94GWWo";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Store chat sessions for each user
const userChats = new Map();

const handleConnection = (socket) => {
    console.log('a user connected');

    // Create a new chat session for the user
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Hello" }],
            },
            {
                role: "model",
                parts: [{ text: "Great to meet you. What would you like to know?" }],
            },
        ],
    });

    // Store the chat session for the user
    userChats.set(socket.id, chat);

    // Handle incoming messages from the user
    socket.on('start_test', async (message) => {
        console.log('message received:', message);

        // Add the user's message to the chat history
        const chat = userChats.get(socket.id);

        // Send the message to the chat session and get the response
        const result = await chat.sendMessage(message);
        const response = result.response.text();
        console.log("this is the response", response); // This line is added to log the response

        // Send the response back to the client
        socket.emit('response', response);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        userChats.delete(socket.id);
    });
};

module.exports = { handleConnection };
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'https://socketio-chat-frontend.vercel.app',

        ]
    })
);

const server = createServer(app);

const io = new Server(server, {
    origin: [
        'http://localhost:5173',
        'https://socketio-chat-frontend.vercel.app',
    ],
    methods: ['GET', 'POST'],
});
const ROOM = 'group'
io.on("connection", (socket) => {
    console.log('a user connected', socket.id);
    //event listeners of join room 
    socket.on('join room', async (name) => {
        await socket.join(ROOM);
        console.log(`${name} joined the room`);
        // notificaiton 
        // io.to(ROOM).emit("notification", name);
        // broadcast to all except sender
        socket.to(ROOM).emit("notification", name);
    });
    // envent for sending message in room 
    socket.on(`send message`, (msg) => {
        // broadcast to all in the room including sender
        console.log('====================================');
        console.log('client send message');
        console.log('====================================');
        io.to(ROOM).emit("new message", msg);
    })
    // now typing event
    socket.on("typing", (username) => {
        console.log(username, 'is typing');

        socket.to(ROOM).emit("typing", username);
    })
    socket.on("stop typing", (username) => {
        console.log(username, 'stopped typing');

        socket.to(ROOM).emit("stop typing", username);
    })
    // event listeners of leave room
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

})


/** Serve static files from the React app dist folder */
app.use(express.static(path.join(__dirname, 'public')));
/** 
 * The "catchall" handler: for any request that doesn't 
 * match one above, send back React's index.html file.
 */
app.get('*any', (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
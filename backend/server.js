import { createServer } from 'node:http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:5173',
    })
);

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});
const ROOM = 'group'
io.on("connection", (socket) => {
    console.log('a user connected', socket.id);
    //event listeners of join room 
    socket.on('join room',async (name) => {
        await socket.join(ROOM);
        console.log(`${name} joined the room`);
        // notificaiton 
        // io.to(ROOM).emit("notification", name);
        // broadcast to all except sender
        socket.to(ROOM).emit("notification", name);
    });
    // envent for sending message in room 
    socket.on(`send message`,(msg)=>{
        // broadcast to all in the room including sender
         console.log('====================================');
        console.log('client send message');
        console.log('====================================');
        io.to(ROOM).emit("new message", msg);
    })
    // event listeners of leave room
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

})

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
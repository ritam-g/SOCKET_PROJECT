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
    socket.on('join room',async (name) => {
        await socket.join(ROOM);
        console.log(`${name} joined the room`);
    });

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
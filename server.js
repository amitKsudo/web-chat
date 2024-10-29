const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('userJoined', username); // Emit the join message
    });

    socket.on('message', (data) => {
        const username = users[socket.id] || 'Unknown';
        io.emit('message', `${username}: ${data}`);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('message', `${username} has left the chat.`);
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

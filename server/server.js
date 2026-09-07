const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

// Connect Database
connectDB();

// Load Models
require('./models/user');
require('./models/Polytechnic');
require('./models/Community');
require('./models/Notice');
require('./models/Message');
require('./models/PrivateMessage');
require('./models/Event');
require('./models/Article');
require('./models/Job');
require('./models/StudyMaterial');
require('./models/Poll');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/polytechnics', require('./routes/polytechnics'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/Users'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/notifications', require('./routes/notifications'));

// Socket.io Logic
const onlineUsers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Global Chat
    socket.on('join_global_room', (userData) => {
        socket.join('global_room');
        onlineUsers.set(socket.id, userData);
        io.to('global_room').emit('online_users', Array.from(onlineUsers.values()));
    });

    socket.on('send_message', async (data) => {
        try {
            const Message = require('./models/Message');
            const message = new Message({
                sender: data.senderId,
                content: data.content
            });
            await message.save();
            const populated = await message.populate('sender', 'name profilePic');
            io.to('global_room').emit('receive_message', populated);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('typing', (userData) => {
        typingUsers.set(socket.id, userData);
        io.to('global_room').emit('typing_users', Array.from(typingUsers.values()));
    });

    socket.on('stop_typing', () => {
        typingUsers.delete(socket.id);
        io.to('global_room').emit('typing_users', Array.from(typingUsers.values()));
    });

    // Private Chat
    socket.on('join_private', (data) => {
        socket.join(`private_${data.userId}`);
    });

    socket.on('send_private', async (data) => {
        try {
            const PrivateMessage = require('./models/PrivateMessage');
            const msg = new PrivateMessage({
                sender: data.senderId,
                receiver: data.receiverId,
                content: data.content
            });
            await msg.save();
            const populated = await msg.populate('sender', 'name profilePic');
            io.to(`private_${data.receiverId}`).emit('receive_private', populated);
            io.to(`private_${data.senderId}`).emit('receive_private', populated);
        } catch (err) {
            console.error(err);
        }
    });

    // Department Chat
    socket.on('join_department_room', (userData) => {
        const room = `${userData.department}_${userData.semester}`;
        socket.join(room);
        io.to(room).emit('department_online_users', Array.from(onlineUsers.values()));
    });

    socket.on('send_department_message', async (data) => {
        const room = `${data.department}_${data.semester}`;
        const User = require('./models/user');
        const sender = await User.findById(data.senderId).select('name profilePic');
        io.to(room).emit('receive_department_message', {
            sender,
            content: data.content,
            createdAt: new Date()
        });
    });

    socket.on('department_typing', (userData) => {
        const room = `${userData.department}_${userData.semester}`;
        socket.to(room).emit('department_typing_users', [userData]);
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        typingUsers.delete(socket.id);
        io.to('global_room').emit('online_users', Array.from(onlineUsers.values()));
        io.to('global_room').emit('typing_users', Array.from(typingUsers.values()));
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('API Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
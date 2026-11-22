require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
  },
});

// Attach io to Express app for access in controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO Connected]: Client ID ${socket.id}`);

  // Join a dedicated room for real-time tracking of a referral
  socket.on('join:referral', (referralId) => {
    if (referralId) {
      const room = `referral:${referralId}`;
      socket.join(room);
      console.log(`[Socket.IO Room]: Client ${socket.id} joined ${room}`);
      socket.emit('joined:referral', { room, message: 'Connected to live tracking stream' });
    }
  });

  // Leave referral room
  socket.on('leave:referral', (referralId) => {
    if (referralId) {
      const room = `referral:${referralId}`;
      socket.leave(room);
      console.log(`[Socket.IO Room]: Client ${socket.id} left ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO Disconnected]: Client ID ${socket.id}`);
  });
});

// Connect to MongoDB and start HTTP + Socket.IO server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` AROGYASANGAM SERVER + SOCKET.IO STARTED ON PORT ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` WebSockets: Enabled on ws://localhost:${PORT}`);
    console.log(`====================================================`);
  });
});

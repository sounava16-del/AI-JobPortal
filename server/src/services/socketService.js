const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

let io = null;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(); // Allow guest/public if needed, or proceed without auth
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      socket.join(`user_${socket.userId}`);
      console.log(`🔌 User connected to socket: ${socket.userId}`);
      io.emit('user_online', { userId: socket.userId });
    }

    // Join conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Real-time typing indicators
    socket.on('typing', ({ conversationId, senderName }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', { conversationId, senderName });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_stop_typing', { conversationId });
    });

    // Send real-time chat message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, recipientId, text, fileUrl, jobId } = data;
        if (!conversationId || !senderId || !recipientId || !text) return;

        const newMsg = await Message.create({
          conversationId,
          sender: senderId,
          recipient: recipientId,
          text,
          fileUrl: fileUrl || '',
          job: jobId || null,
        });

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name avatar role')
          .populate('recipient', 'name avatar role');

        // Broadcast to conversation room
        io.to(`conv_${conversationId}`).emit('new_message', populatedMsg);

        // Also notify recipient directly if not in room
        io.to(`user_${recipientId}`).emit('chat_notification', {
          conversationId,
          message: populatedMsg
        });
      } catch (err) {
        console.error('Error handling send_message in socket:', err);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user_offline', { userId: socket.userId });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

// Dispatch live notification to a specific user
const sendLiveNotification = async (recipientId, notificationData) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      ...notificationData
    });

    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Error sending live notification:', err);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendLiveNotification,
  onlineUsers
};

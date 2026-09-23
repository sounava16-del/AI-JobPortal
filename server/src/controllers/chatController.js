const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../services/socketService');

// Helper to make consistent conversationId between two users
const getConversationId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// @desc    Get all conversations for logged in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .sort('-createdAt')
      .populate('sender', 'name email avatar role company')
      .populate('recipient', 'name email avatar role company')
      .populate('job', 'title company');

    const conversationMap = new Map();

    messages.forEach(msg => {
      const convId = msg.conversationId;
      if (!conversationMap.has(convId)) {
        const partner = msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
        conversationMap.set(convId, {
          conversationId: convId,
          partner,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          job: msg.job,
        });
      }

      // Check unread count
      if (msg.recipient._id.toString() === userId && !msg.isRead) {
        const conv = conversationMap.get(convId);
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .sort('createdAt');

    // Mark as read for this user
    await Message.updateMany(
      { conversationId, recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message via REST (fallback or initial start)
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, text, jobId } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !text) {
      return res.status(400).json({ success: false, message: 'Recipient and text are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    const conversationId = getConversationId(senderId, recipientId);

    const message = await Message.create({
      conversationId,
      sender: senderId,
      recipient: recipientId,
      text,
      job: jobId || null,
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate('job', 'title');

    // Emit live via Socket.io
    try {
      const io = getIO();
      io.to(`conv_${conversationId}`).emit('new_message', populatedMsg);
      io.to(`user_${recipientId}`).emit('chat_notification', {
        conversationId,
        message: populatedMsg
      });
    } catch (e) {
      // Socket not connected or initialized
    }

    res.status(201).json({
      success: true,
      message: populatedMsg,
      conversationId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getConversationId,
};

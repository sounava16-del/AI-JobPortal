import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { X, Send, User, Sparkles } from 'lucide-react';

const ChatModal = () => {
  const { isChatOpen, closeChat, activeChatUser, activeChatJob, socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const conversationId = activeChatUser && user
    ? [user.id || user._id, activeChatUser._id || activeChatUser.id].sort().join('_')
    : null;

  // Fetch message history
  useEffect(() => {
    if (!conversationId || !isChatOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/messages/${conversationId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Join room
    if (socket) {
      socket.emit('join_conversation', { conversationId });
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', { conversationId });
      }
    };
  }, [conversationId, isChatOpen, socket]);

  // Socket listener for new incoming message
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, conversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('stop_typing', { conversationId });
    }

    try {
      const recipientId = activeChatUser._id || activeChatUser.id;
      const res = await api.post('/chat/send', {
        recipientId,
        text: textToSend,
        jobId: activeChatJob?._id || null,
      });

      if (res.data.success) {
        // Appended via socket or locally if offline
        const exists = messages.some((m) => m._id === res.data.message._id);
        if (!exists) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && conversationId) {
      socket.emit('typing', { conversationId, senderName: user?.name });
    }
  };

  if (!isChatOpen || !activeChatUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">
            {activeChatUser.name ? activeChatUser.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{activeChatUser.name}</h4>
            <div className="text-[11px] text-indigo-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="capitalize">{activeChatUser.role}</span>
              {activeChatJob && (
                <span>• Re: {activeChatJob.title}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={closeChat}
          className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
            <p className="font-medium text-slate-700 dark:text-slate-300">Start the conversation</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Discuss interview schedules, technical requirements, or application feedback directly.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = (m.sender?._id || m.sender) === (user?.id || user?._id);
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 italic">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            <span>Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatModal;

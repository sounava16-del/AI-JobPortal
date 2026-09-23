import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Bot, Send, User, Lightbulb } from 'lucide-react';

const SUGGESTIONS = [
  'How can I optimize my resume for ATS screening?',
  'Give me 5 behavioral interview tips using the STAR method',
  'What questions should I ask the recruiter at the end of an interview?',
  'How can I negotiate a higher base salary or remote stipend?'
];

const SeekerCareerChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.name || 'there'}! I'm your AI Career Coach. I can help optimize your resume, prepare you for tough interview questions, navigate career transitions, and coach you on salary negotiations. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setInput('');
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/ai/career-chat', {
        message: text,
        history: newMessages.slice(-6)
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I apologize, but I encountered an issue processing that query. Please try asking again!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            AI Career Coach
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Active Advisor
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalized guidance for interviews, resumes, and career development
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>AI Coach is formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="py-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(s)}
            className="px-3 py-1 rounded-xl text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            {s}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for resume feedback, interview advice, or salary negotiation..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SeekerCareerChat;

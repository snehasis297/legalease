import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, X, MessageSquare, Loader2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import ChatBubble from './ChatBubble';

export const ChatBox = ({ documentId, documentTitle, isOpen, onClose }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'What are the highest risk clauses?',
    'Explain the termination requirements',
    'Is the indemnification mutual or one-sided?',
    'What happens in case of contract breach?',
  ];

  // Initialize or fetch session
  useEffect(() => {
    if (!documentId || !isOpen) return;

    const initSession = async () => {
      try {
        const res = await chatService.createSession(documentId);
        const newSession = res.data;
        setSession(newSession);

        // Load history
        const historyRes = await chatService.getHistory(newSession.id);
        setMessages(historyRes.data || []);
      } catch (err) {
        console.error('Failed to initialize chat session', err);
      }
    };
    initSession();
  }, [documentId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !session || isStreaming) return;

    const userMessage = { id: Date.now(), role: 'USER', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsStreaming(true);
    setStreamingContent('');

    let accumulated = '';

    await chatService.streamMessage(
      session.id,
      text,
      (token) => {
        accumulated += token;
        setStreamingContent(accumulated);
      },
      () => {
        // Complete
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ASSISTANT', content: accumulated },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      (err) => {
        console.error('Chat streaming failed', err);
        setIsStreaming(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[580px] glass-card rounded-2xl border border-primary/50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#12121E] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/30 border border-primary/60 flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate max-w-[240px]">
              {documentTitle || 'Legal Contract Assistant'}
            </h4>
            <span className="text-[10px] text-accent flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>
              Live Document Intelligence
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested chips (shown if history is short) */}
      {messages.length <= 2 && (
        <div className="px-3 pt-3 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-primary/30 border border-white/10 hover:border-primary text-textSecondary hover:text-white transition-colors truncate max-w-[200px]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-textSecondary space-y-2 p-6">
            <Sparkles className="w-8 h-8 text-accent/60 mb-2" />
            <p className="font-semibold text-white">Ask anything about this agreement</p>
            <p>I have ingested the full text and can cite clauses, highlight red flags, or propose redlines.</p>
          </div>
        )}

        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}

        {/* Streaming In-Progress Message */}
        {isStreaming && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/30 border border-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="max-w-[85%] rounded-2xl p-4 bg-[#151522] border border-white/10 text-gray-200 text-xs sm:text-sm">
              <p className="whitespace-pre-wrap">{streamingContent}</p>
              <div className="flex items-center space-x-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-white/10 bg-[#10101C] flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about this contract..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isStreaming}
          className="p-2.5 rounded-xl bg-primary hover:bg-primary-light text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-purple transition-all"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

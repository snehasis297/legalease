import React from 'react';
import { Bot, User } from 'lucide-react';

export const ChatBubble = ({ message }) => {
  const isUser = message.role === 'USER' || message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-accent/20 border border-accent text-accent'
            : 'bg-primary/30 border border-primary text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white shadow-glow-purple'
            : 'bg-[#151522] border border-white/10 text-gray-200'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatBubble;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  RefreshCw, 
  FileText,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import documentService from '../../services/documentService';
import chatService from '../../services/chatService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SUGGESTIONS = [
  'What are the key termination risks and notice periods?',
  'Does this agreement have unilateral indemnification?',
  'What is the governing law and jurisdiction?',
  'Are there any non-compete or non-solicitation restrictions?',
];

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    async function initChat() {
      try {
        setLoading(true);
        const docRes = await documentService.getDocument(id);
        const docData = docRes.data?.data || docRes.data;
        setDocument(docData);

        // Load chat history if available
        const historyRes = await chatService.getChatHistory(id);
        const history = historyRes.data?.data || historyRes.data?.messages || historyRes.data || [];
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history.map(m => ({
            id: m.id ? String(m.id) : Date.now().toString(),
            sender: (m.role || m.sender || '').toUpperCase() === 'USER' ? 'USER' : 'AI',
            content: m.content || '',
            timestamp: m.timestamp || new Date().toISOString(),
          })));
        } else {
          // Welcome message
          setMessages([
            {
              id: 'initial',
              sender: 'AI',
              content: `Hello! I have reviewed **${docData?.title || docData?.originalFilename || 'your contract'}**. Ask me any question regarding specific liabilities, indemnity terms, dispute resolution, or compliance obligations.`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        setError('Failed to initialize AI conversation for this document.');
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputMessage).trim();
    if (!question || isStreaming) return;

    setInputMessage('');
    const userMsg = {
      id: Date.now().toString(),
      sender: 'USER',
      content: question,
      timestamp: new Date().toISOString(),
    };

    const aiMsgPlaceholder = {
      id: (Date.now() + 1).toString(),
      sender: 'AI',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsgPlaceholder]);
    setIsStreaming(true);

    let accumulatedText = '';

    try {
      await chatService.streamMessage(
        id,
        question,
        (chunk) => {
          accumulatedText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgPlaceholder.id ? { ...msg, content: accumulatedText } : msg
            )
          );
        },
        (err) => {
          console.error('Streaming error:', err);
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgPlaceholder.id
                ? {
                    ...msg,
                    content:
                      accumulatedText ||
                      'An error occurred while communicating with the AI service. Please try again.',
                  }
                : msg
            )
          );
        },
        () => {
          setIsStreaming(false);
        }
      );
    } catch (err) {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgPlaceholder.id
            ? {
                ...msg,
                content: 'Failed to obtain AI response. Please ensure backend services are active.',
              }
            : msg
        )
      );
    }
  };

  return (
    <DashboardLayout portalType="client" title="Document Chat">
      <div className="max-w-5xl w-full mx-auto flex flex-col h-[calc(100vh-10rem)] card overflow-hidden p-0 border border-slate-200 shadow-sm">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/client/analysis/${id}`)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm transition"
                  title="Back to Analysis"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 border border-indigo-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Legal AI Assistant
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                        Dual-Mode Active
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm">
                      {document?.title || document?.originalFileName || document?.originalFilename || 'Contract Inquiry'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Zero Retention Session</span>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender !== 'USER' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'USER'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {isStreaming && msg.sender === 'AI' && !msg.content && (
                        <div className="flex items-center gap-1 py-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>

                    {msg.sender === 'USER' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  disabled={isStreaming}
                  onClick={() => handleSendMessage(sug)}
                  className="whitespace-nowrap px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 transition shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask Claude AI any legal question regarding this contract..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isStreaming}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isStreaming || !inputMessage.trim()}
                className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
    </DashboardLayout>
  );
}

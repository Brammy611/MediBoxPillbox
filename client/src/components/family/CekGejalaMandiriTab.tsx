import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface CekGejalaInitData {
  initialMessage: string;
  quickReplies: string[];
}

interface Profiles {
  lansiaProfile: { nama: string };
  caregiverProfile: { nama: string };
}

interface ChatMessage {
  messageId: string;
  sender: 'user' | 'ai';
  text: string;
  quickReplies?: string[];
  timestamp?: string;
}

interface Props {
  initData?: CekGejalaInitData;
  profiles: Profiles;
  patientId: string;
}

const CekGejalaMandiriTab: React.FC<Props> = ({ initData, profiles, patientId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load initial welcome message when tab opens
    if (initData && messages.length === 0) {
      const caregiverName = profiles?.caregiverProfile?.nama || 'Caregiver';
      const patientName = profiles?.lansiaProfile?.nama || 'Pasien';
      const welcomeText = initData.initialMessage
        .replace('{caregiverName}', caregiverName)
        .replace('{patientName}', patientName);

      setMessages([
        {
          messageId: 'msg_000',
          sender: 'ai',
          text: welcomeText,
          quickReplies: initData.quickReplies,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [initData, profiles, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Remove quick replies from all messages after user picks one
    setMessages(prev => prev.map(m => ({ ...m, quickReplies: undefined })));

    // Add user message
    const userMessage: ChatMessage = {
      messageId: `msg_${Date.now()}_user`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsBotTyping(true);

    try {
      // Call Gemini AI endpoint dengan data dari MongoDB
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Sending message to Gemini AI:', messageText);
      
      const response = await axios.post(`${API_BASE}/api/chatbot/ask-gemini`, {
        patientId: patientId,
        message: messageText
      });

      console.log('Gemini AI response:', response.data);

      if (response.data?.success && response.data?.text) {
        // Add AI response message
        const aiMessage: ChatMessage = {
          messageId: `msg_${Date.now()}_ai`,
          sender: 'ai',
          text: response.data.text,
          timestamp: response.data.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('Gemini AI error:', error);
      
      // Show error message to user
      const errorMessage = error.response?.data?.text || 
                          'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi atau hubungi dokter jika situasi mendesak.';
      
      setMessages(prev => [
        ...prev,
        {
          messageId: `err_${Date.now()}`,
          sender: 'ai',
          text: errorMessage,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsBotTyping(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Support for bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-2 last:mb-0 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part || '\u00A0'}</span>;
          })}
        </p>
      );
    });
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <div className="flex flex-col rounded-2xl shadow-lg overflow-hidden" style={{ 
      minHeight: '600px', 
      maxHeight: '700px',
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD4 100%)'
    }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 143, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 143, 55, 0.5);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message-user {
          background: linear-gradient(135deg, #FF8F37 0%, #C73D07 100%);
        }
        .message-ai {
          background: #FFFFFF;
          border: 1px solid #FFEDD4;
        }
      `}</style>

      {/* Professional Header */}
      <div className="px-6 py-4 shadow-md" style={{ background: 'linear-gradient(135deg, #FF8F37 0%, #C73D07 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Asisten Kesehatan AI</h3>
          </div>
        </div>
      </div>

      {/* Chat Messages Area with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.messageId}
            className={`flex gap-3 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar Icon */}
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ 
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #C73D07 0%, #451205 100%)' 
                  : 'linear-gradient(135deg, #FF8F37 0%, #C73D07 100%)'
              }}
            >
              {msg.sender === 'user' ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-2xl px-5 py-3 shadow-sm ${
                  msg.sender === 'user'
                    ? 'message-user text-white rounded-tr-none'
                    : 'message-ai rounded-tl-none'
                }`}
              >
                <div className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {renderMessageText(msg.text)}
                </div>

                {/* Quick Reply Buttons */}
                {msg.sender === 'ai' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        style={{
                          background: 'rgba(255, 143, 55, 0.15)',
                          color: '#C73D07',
                          border: '1px solid #FFEDD4'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 143, 55, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 143, 55, 0.15)';
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs mt-1 px-2" style={{ color: '#C73D07' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator with Spinner */}
        {isBotTyping && (
          <div className="flex gap-3 animate-fadeIn">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF8F37 0%, #C73D07 100%)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="message-ai rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#C73D07' }}>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">AI sedang menganalisis...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Modern Input Area */}
      <div className="p-6 border-t" style={{ 
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
        borderColor: '#FFEDD4'
      }}>
        {/* Helper Text */}
        <div className="mb-3 text-xs flex items-center gap-1" style={{ color: '#C73D07' }}>
          <span>💡</span>
          <span>Tip: Jelaskan gejala dengan detail untuk analisis yang lebih akurat</span>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(newMessage);
                }
              }}
              placeholder="Ketik pesan Anda..."
              className="w-full px-5 py-3 pr-16 bg-white rounded-2xl focus:outline-none transition-all duration-200 text-sm shadow-sm"
              style={{ border: '2px solid #FFEDD4' }}
              disabled={isBotTyping}
              maxLength={500}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF8F37';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 143, 55, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#FFEDD4';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {/* Character Counter */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: '#C73D07' }}>
              {newMessage.length}/500
            </span>
          </div>

          {/* Send Button with Icon */}
          <button
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim() || isBotTyping}
            className="px-6 py-3 text-white rounded-2xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{ 
              background: (!newMessage.trim() || isBotTyping) 
                ? '#D1D5DB' 
                : 'linear-gradient(135deg, #FF8F37 0%, #C73D07 100%)'
            }}
            onMouseEnter={(e) => {
              if (!(!newMessage.trim() || isBotTyping)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #C73D07 0%, #451205 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!newMessage.trim() || isBotTyping)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF8F37 0%, #C73D07 100%)';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Kirim</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CekGejalaMandiriTab;

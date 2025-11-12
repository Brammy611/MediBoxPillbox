import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BotMessage from './BotMessage';

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
  analysis?: Array<{ label: string; score?: number; detail?: string }>;
  warning?: { level: string; text: string };
  recommendations?: string[];
  quickReplies?: string[];
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

  useEffect(() => {
    // Load initial welcome message when tab opens
    if (initData) {
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
          quickReplies: initData.quickReplies
        }
      ]);
    }
  }, [initData, profiles]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Remove quick replies from all messages after user picks one
    setMessages(prev => prev.map(m => ({ ...m, quickReplies: undefined })));

    // Add user message
    const userMessage: ChatMessage = {
      messageId: `msg_${Date.now()}_user`,
      sender: 'user',
      text: messageText
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
          text: response.data.text
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
          text: errorMessage
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4 flex flex-col" style={{ minHeight: '500px', maxHeight: '600px' }}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(msg =>
          msg.sender === 'user' ? (
            // User message (right side)
            <div key={msg.messageId} className="flex justify-end">
              <div className="bg-brand-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ) : (
            // AI message (left side)
            <div key={msg.messageId} className="flex justify-start">
              <div className="max-w-[85%]">
                {/* Render AI response dengan formatting markdown */}
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-800 space-y-2 whitespace-pre-wrap">
                    {msg.text.split('\n').map((line, idx) => {
                      // Handle bold text **text**
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={idx} className="leading-relaxed">
                          {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legacy support for old format with analysis/warning/recommendations */}
                {(msg.analysis || msg.warning || msg.recommendations) && (
                  <div className="mt-2">
                    <BotMessage
                      text=""
                      analysis={msg.analysis}
                      warning={msg.warning}
                      recommendations={msg.recommendations}
                    />
                  </div>
                )}
                
                {/* Quick replies if available */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qr)}
                        className="px-3 py-1 bg-white border border-brand-500 text-brand-500 rounded-md text-sm hover:bg-brand-50 transition-colors"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {isBotTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <p className="text-sm text-gray-500">AI sedang menganalisis...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ketik keluhan atau pertanyaan..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage(newMessage)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={isBotTyping}
        />
        <button
          onClick={() => handleSendMessage(newMessage)}
          disabled={isBotTyping || !newMessage.trim()}
          className="px-5 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

export default CekGejalaMandiriTab;

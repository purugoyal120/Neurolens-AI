import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const { activeReport, activeProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', content: 'Hello! I am Neurolens AI. I can help explain your vision test results or answer any accessibility questions. How can I assist you today?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      let botResponse = "";
      
      const contextStr = activeReport 
        ? `The user's vision profile is ${activeProfile}. Their latest test showed severity: ${activeReport.severity}, accuracy: ${activeReport.accuracy}%. Diagnosis: ${activeReport.description}.`
        : `The user has not taken a vision test yet.`;

      if (apiKey) {
        // Real OpenAI API Call
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are Neurolens AI, a highly empathetic and expert AI assistant for a color vision deficiency platform. ${contextStr} Keep your answers concise, empathetic, encouraging, and under 3 sentences.`
              },
              ...messages.map(m => ({ role: m.type === 'bot' ? 'assistant' : 'user', content: m.content })),
              { role: "user", content: userMessage.content }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          botResponse = data.choices[0].message.content;
        } else {
          throw new Error("Invalid response from OpenAI");
        }
      } else {
        // Smart Mock Fallback for Demo
        await new Promise(resolve => setTimeout(resolve, 1500)); // simulate network latency
        
        const msg = userMessage.content.toLowerCase();
        if (msg.includes('color blind') || msg.includes('result') || msg.includes('test')) {
          botResponse = activeReport 
            ? `Based on your test, you have a ${activeReport.severity.toLowerCase()} case of ${activeProfile}. Don't worry! Our extension will automatically shift problematic colors on websites so you can see perfectly.`
            : `I see you're asking about color blindness. I recommend taking our 2-minute diagnostic test first so I can give you personalized advice!`;
        } else if (msg.includes('design') || msg.includes('work') || msg.includes('job')) {
          botResponse = `Being color blind shouldn't stop you from doing great work! Neurolens acts as your digital glasses, adjusting charts and designs in real-time so you never miss critical information.`;
        } else if (msg.includes('hello') || msg.includes('hi')) {
          botResponse = `Hello there! I'm here to help you understand your vision profile and make the web more accessible for you. What's on your mind?`;
        } else {
          botResponse = `That's a great question! As Neurolens AI, my goal is to ensure the web adapts to your eyes, not the other way around. Is there anything specific about your vision profile you'd like me to explain?`;
        }
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "I'm having a little trouble connecting right now, but I'm still here to help! Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform z-40 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Neurolens AI</h3>
                <p className="text-xs text-emerald-100">Your Accessibility Copilot</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 min-h-[300px] max-h-[400px] flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                  msg.type === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="p-3 rounded-2xl text-sm bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-slate-400 italic">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ask Neurolens AI to adapt this page..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

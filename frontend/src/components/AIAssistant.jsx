import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, AlertCircle, HeartHandshake, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';
import { AuthContext } from '../context/AuthContext';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const UserAvatar = ({ user, className = "" }) => {
  const borderClasses = "border border-[#FF2E63]/20 dark:border-[#FF2E63]/30";
  if (user?.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={user.name}
        className={`rounded-full object-cover shrink-0 ${borderClasses} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full bg-slate-800 text-slate-350 font-bold flex items-center justify-center select-none shrink-0 ${borderClasses} ${className}`}>
      {getInitials(user?.name)}
    </div>
  );
};

export const AIAssistant = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your LifeSave AI Voice Assistant. You can text or click the mic button to speak with me in English or Tamil. How can I help you save lives today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice integration states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('en-US'); // 'en-US' or 'ta-IN'

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isSpeaking]);

  // Speech Recognition API Configuration
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        // Stop any current speaking
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Handle TTS Speaking
  const speakResponse = (text) => {
    if (!voiceEnabled) return;

    // Stop current speech
    window.speechSynthesis.cancel();

    // Check if the text contains Tamil characters
    const isTamilText = /[\u0B80-\u0BFF]/.test(text);
    const langCode = isTamilText ? 'ta-IN' : 'en-US';

    // Strip markdown formatting symbols
    const cleanText = text.replace(/\*\*/g, '').replace(/•/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const quickActions = [
    { label: "Am I eligible to donate?", icon: <HeartHandshake size={12} /> },
    { label: "Check blood compatibility", icon: <Sparkles size={12} /> },
    { label: "How to register a donor?", icon: <User size={12} /> },
    { label: "Emergency request workflow", icon: <AlertCircle size={12} /> },
    { label: "System usage FAQs", icon: <HelpCircle size={12} /> }
  ];

  // Simulated AI response processor
  const getAIResponse = (input) => {
    const text = input.toLowerCase().trim();

    // Check if user is asking in Tamil
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || 
                    text.includes('vanakkam') || 
                    text.includes('thahuthi') || 
                    text.includes('raththam') ||
                    text.includes('thevai') ||
                    text.includes('tamil');

    if (isTamil) {
      // Greetings
      if (text.includes('வணக்கம்') || text.includes('vanakkam') || text.includes('ஹலோ') || text.includes('hi') || text.includes('hello')) {
        return "வணக்கம்! நான் உங்கள் லைஃப்சேவ் (LifeSave) குரல் உதவி முகவர். இரத்த தான தகுதிகள், இணக்கத்தன்மை மற்றும் அவசர இரத்த தேவைகள் பற்றி நான் உங்களுக்கு உதவ முடியும். இன்று உங்களுக்கு நான் எவ்வாறு உதவ வேண்டும்?";
      }
      // Eligibility
      if (text.includes('தகுதி') || text.includes('thahuthi') || text.includes('தானம்') || text.includes('பச்சை') || text.includes('வயது') || text.includes('எடை')) {
        return "இரத்த தானம் செய்வதற்கான தகுதிகள்:\n\n• **வயது**: 16 முதல் 65 வயது வரை.\n• **எடை**: குறைந்தபட்சம் 50 கிலோ (110 பவுண்ட்).\n• **உடல்நலம்**: நல்ல ஆரோக்கியம், தொற்று நோய்கள் இல்லாத நிலை.\n• **பச்சை குத்துதல்/துளைத்தல்**: 3 முதல் 12 மாதங்கள் வரை தற்காலிக விலக்கு அளிக்கப்படலாம்.\n• **பயணம்**: மலேரியா பாதிப்புள்ள பகுதிகளுக்குச் சென்றிருந்தால் தற்காலிக விலக்கு.";
      }
      // Compatibility
      if (text.includes('இணக்கம்') || text.includes('பொருத்தம்') || text.includes('வகை') || text.includes('ப்ளட் க்ரூப்') || text.includes('o-') || text.includes('ab+')) {
        return "இரத்த வகைகளின் இணக்கத்தன்மை:\n\n• **O- (O நெகட்டிவ்)**: **உலகளாவிய கொடையாளி** (Universal Donor). அனைத்து இரத்த வகையினருக்கும் வழங்கலாம். ஆனால் O- வகையினரிடமிருந்து மட்டுமே பெற முடியும்.\n• **AB+ (AB பாசிட்டிவ்)**: **உலகளாவிய பெறுநர்** (Universal Recipient). அனைத்து வகையினரிடமிருந்தும் பெறலாம். ஆனால் AB+ வகையினருக்கு மட்டுமே வழங்க முடியும்.\n• **Rh காரணி**: பாசிட்டிவ் வகையினர் பாசிட்டிவ்/நெகட்டிவ் பெறலாம். நெகட்டிவ் வகையினர் நெகட்டிவ் மட்டுமே பெற முடியும்.";
      }
      // Registration
      if (text.includes('பதிவு') || text.includes('pathivu') || text.includes('கொடையாளி')) {
        return "கொடையாளரைப் பதிவு செய்ய:\n\n1. பக்கவாட்டுப் பட்டியில் (Sidebar) உள்ள **Become Donor** பக்கத்திற்குச் செல்லவும்.\n2. அல்லது முகப்புப் பலகையில் (Dashboard) உள்ள **Add Donation** பொத்தானை அழுத்திப் பதிவு செய்யலாம்.";
      }
      // Emergency
      if (text.includes('அவசரம்') || text.includes('avasaram') || text.includes('ஆபத்து') || text.includes('உயிர்காப்பாளர்')) {
        return "🚨 **அவசர இரத்த உதவி நெறிமுறை**:\n\nஉடனடி தேவைக்கு:\n1. முகப்புப் பலகையில் உள்ள அவசர அறிவிப்புகளைக் கண்காணிக்கவும்.\n2. **Dispatch Clearance** பொத்தானை அழுத்தி அனுமதியை விரைவுபடுத்தவும்.\n3. மேலதிக விபரங்களுக்கு இரத்த இருப்பை (Blood Inventory) சரிபார்க்கவும்.";
      }
      // Default Tamil response
      return "உங்கள் கேள்விக்கு நன்றி. இரத்த தானத் தகுதிகள், இரத்த வகை இணக்கத்தன்மை (compatibility) அல்லது அவசரத் தேவைகளை எவ்வாறு கையாள்வது என்பது பற்றி என்னிடம் கேளுங்கள். உங்களுக்கு உதவ நான் தயாராக உள்ளேன்.";
    }

    // ENGLISH RESPONSES
    if (text.includes('elig') || text.includes('donate') || text.includes('qualif') || text.includes('tattoo') || text.includes('age') || text.includes('weight')) {
      return "To donate blood, you generally must meet these clinical standards:\n\n• **Age**: Between 16 and 65 years old.\n• **Weight**: At least 50 kg (110 lbs).\n• **Health**: Good general health, no active infections.\n• **Tattoos/Piercings**: A deferral period (typically 3–12 months) may apply depending on localized regulations.\n• **Travel**: Recent travel to malaria-endemic areas may result in temporary deferral.";
    }

    if (text.includes('compat') || text.includes('group') || text.includes('type') || text.includes('o-') || text.includes('ab+') || text.includes('universal')) {
      return "Here is a quick overview of blood group compatibility:\n\n• **O- (O Negative)**: The **Universal Donor**. Can donate to all blood types but can only receive O-.\n• **AB+ (AB Positive)**: The **Universal Recipient**. Can receive from all blood types but can only donate to AB+.\n• **Red Blood Cell Rules**: Rh-positive individuals can receive Rh-positive or Rh-negative blood, whereas Rh-negative individuals must only receive Rh-negative blood.";
    }

    if (text.includes('register') || text.includes('signup') || text.includes('add donor') || text.includes('become donor')) {
      return "You can register a volunteer donor in two ways:\n\n1. **Become Donor Page**: Access the `/register-donor` route via the sidebar. Complete the medical questionnaire and contact fields.\n2. **Staff Quick Action**: Shift administrators can record donors directly from the Dashboard utility panel by clicking **Add Donation**.";
    }

    if (text.includes('emerg') || text.includes('urgent') || text.includes('critic') || text.includes('dispatch') || text.includes('clearance')) {
      return "🚨 **Emergency Outbound Logistics Clearance**:\n\nIf a critical request is received on the Dashboard, shift officers must:\n1. Verify inventory stocks in the vault.\n2. Click the **Dispatch Clearance** button beside the emergency list item.\n3. This clears the order for immediate logistics courier packaging and updates audited counts. Super admins have full override controls.";
    }

    if (text.includes('system') || text.includes('dashboard') || text.includes('vault') || text.includes('inventory') || text.includes('report') || text.includes('how to')) {
      return "Here is a quick overview of system controls:\n\n• **Dashboard**: View active metrics, emergency dispatch logs, and live vault stock levels.\n• **Vault Inventory**: Navigate to Blood Inventory to audit specific bags, filter by group, or check low-stock flags.\n• **Audit Reports**: Compilation utility to download verified logs as PDF or Excel under standard safety guidelines.";
    }

    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('greeting')) {
      return "Hello! How can I assist you today with the LifeSave platform? Feel free to ask about blood compatibilities, eligibility criteria, or system operation controls.";
    }

    return "I appreciate your query. I am trained specifically on the LifeSave platform. You can ask me about:\n\n1. Blood group compatibility (e.g. O-, AB+ rules).\n2. Donor eligibility criteria.\n3. Enlisting new donors or managing inventory.\n4. Processing emergency dispatch approvals.";
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Stop current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    // Simulate thinking delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const replyText = getAIResponse(text);
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
      speakResponse(replyText);
    }, delay);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes floatChat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .ai-pulse-glow {
          position: relative;
        }
        .ai-pulse-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #FF2E63;
          z-index: -1;
          animation: ripple 2s infinite ease-out;
        }
        .assistant-glass {
          background: rgba(13, 13, 13, 0.75);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(193, 18, 31, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .light .assistant-glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(193, 18, 31, 0.15);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
        }
        .assistant-msg-ai {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .light .assistant-msg-ai {
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .assistant-msg-user {
          background: linear-gradient(135deg, #C1121F 0%, #8B0000 100%);
        }
        .ai-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF2E63;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .ai-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .ai-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .speaking-bar {
          width: 3px;
          height: 8px;
          background-color: #FF2E63;
          border-radius: 9999px;
          animation: soundWave 0.8s ease-in-out infinite;
        }
        .speaking-bar:nth-child(2) { animation-delay: 0.15s; }
        .speaking-bar:nth-child(3) { animation-delay: 0.3s; }
        
        @keyframes listenPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 46, 99, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 46, 99, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 46, 99, 0); }
        }
        .listening-glow {
          animation: listenPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#C1121F] to-[#FF2E63] text-white shadow-lg shadow-[#FF2E63]/30 hover:shadow-[#FF2E63]/50 hover:scale-105 active:scale-95 transition-all duration-300 ai-pulse-glow float-chat-btn"
          aria-label="Open AI Assistant"
          type="button"
          style={{ animation: 'floatChat 4s ease-in-out infinite' }}
        >
          <MessageSquare size={22} className="relative z-10" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] rounded-3xl assistant-glass flex flex-col overflow-hidden animate-fade-in z-50">
          
          {/* Header Panel */}
          <div className="px-5 py-4 border-b border-white/[0.06] dark:border-white/[0.06] border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C1121F]/20 to-[#FF2E63]/30 border border-[#FF2E63]/40 text-[#FF2E63] p-1.5 relative">
                <Logo mode="icon" fillColor="#FF2E63" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-black" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1">
                  LifeSave AI <Sparkles size={11} className="text-[#FF2E63]" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-450 uppercase tracking-widest mt-0.5">Online Support Node</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                type="button"
                onClick={() => setLanguage(lang => lang === 'en-US' ? 'ta-IN' : 'en-US')}
                className="px-2 py-1 rounded bg-[#FF2E63]/10 hover:bg-[#FF2E63]/20 border border-[#FF2E63]/20 text-[9px] font-bold text-[#FF2E63] transition-colors"
                title="Toggle Speech Recognition Language"
              >
                {language === 'en-US' ? 'EN' : 'தமிழ்'}
              </button>

              {/* Voice Enable/Disable Button */}
              <button
                type="button"
                onClick={() => {
                  if (voiceEnabled) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  voiceEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' 
                    : 'bg-slate-500/10 border-slate-500/30 text-slate-500 hover:bg-slate-500/20'
                }`}
                title={voiceEnabled ? "Mute Voice Assistant" : "Unmute Voice Assistant"}
              >
                {voiceEnabled ? (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 1.77L6.43 9H3v6h3.43L11 19V5z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleCloseChat}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {msg.sender === 'ai' ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#C1121F]/20 to-[#FF2E63]/20 border border-[#FF2E63]/30 text-[#FF2E63] p-1.5 text-xs">
                    <Bot size={14} />
                  </div>
                ) : (
                  <UserAvatar user={user} className="h-8 w-8 text-[10px]" />
                )}

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'ai'
                      ? 'assistant-msg-ai text-slate-800 dark:text-slate-200'
                      : 'assistant-msg-user text-white shadow-sm shadow-[#C1121F]/10'
                  }`}>
                    {/* Render newlines correctly */}
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                        {/* Bold markdown parsing helper */}
                        {line.split('**').map((part, k) => (
                          k % 2 === 1 ? <strong key={k} className="text-[#FF2E63] dark:text-[#FF2E63] font-bold">{part}</strong> : part
                        ))}
                      </p>
                    ))}
                    
                    {/* Speaking Soundwave Visualizer */}
                    {msg.sender === 'ai' && isSpeaking && msg.id === messages[messages.length - 1].id && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200 dark:border-white/5 w-fit">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Speaking:</span>
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`text-[8px] font-semibold text-slate-400 block px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] animate-fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C1121F]/15 border border-[#FF2E63]/20 text-[#FF2E63] p-1.5">
                  <Bot size={14} />
                </div>
                <div className="assistant-msg-ai rounded-2xl px-4 py-3.5 flex items-center gap-1 w-16 justify-center">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="px-4 py-2 bg-slate-100/70 dark:bg-black/20 border-t border-slate-200 dark:border-white/[0.04] flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            {quickActions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(act.label)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#FF2E63]/25 hover:border-[#FF2E63] text-[10px] font-bold tracking-wide text-slate-800 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-[#FF2E63]/5 dark:hover:bg-[#FF2E63]/10 transition-all cursor-pointer whitespace-nowrap"
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 border-t border-white/[0.06] dark:border-white/[0.06] border-slate-100 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Ask eligibility, stock, compatibility..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`luxury-input flex-1 px-4 py-2.5 text-xs rounded-xl outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-white/[0.03] border ${
                isListening ? 'border-[#FF2E63]/50 focus:border-[#FF2E63]' : 'border-slate-250 dark:border-white/[0.08]'
              }`}
              disabled={isListening}
              required={!isListening}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  if (recognitionRef.current) recognitionRef.current.stop();
                } else {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (err) {
                      console.error('Failed to start speech recognition:', err);
                    }
                  } else {
                    alert('Speech recognition is not supported in this browser. Try Chrome or Safari.');
                  }
                }
              }}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white listening-glow' 
                  : 'bg-[#FF2E63]/10 hover:bg-[#FF2E63]/25 text-[#FF2E63] border border-[#FF2E63]/20'
              }`}
              title={isListening ? "Stop listening" : "Speak with AI (Tamil / English)"}
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </button>

            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#C1121F] to-[#FF2E63] text-white shadow-md shadow-[#C1121F]/10 hover:scale-105 active:scale-95 transition-all"
              disabled={isListening}
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

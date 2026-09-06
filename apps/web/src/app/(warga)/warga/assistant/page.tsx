"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { 
  Bell, 
  User, 
  X, 
  Menu, 
  Home, 
  History, 
  UserPlus, 
  LogOut,
  SendHorizontal,
  Bot,
  Trash2
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Berapa sisa saldo saya sekarang?",
  "Berapa botol yang sudah saya setor?",
  "Boleh setor botol kaca?",
  "Bagaimana cara tarik saldo ke Warung?"
];

export default function PantraAssistantPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // User State dari Session Login
  const [userName, setUserName] = useState("Warga PANTRA");
  const [qrId, setQrId] = useState("");

  // State Chatbot
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Helper Simpan Pesan ke LocalStorage
  const updateMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    if (typeof window !== "undefined") {
      localStorage.setItem("pantra_chat_history", JSON.stringify(newMessages));
    }
  };

  // Bersihkan Riwayat Chat
  const handleClearChat = () => {
    if (confirm("Hapus semua riwayat percakapan?")) {
      const defaultMsg: ChatMessage[] = [
        {
          id: "msg-init",
          sender: "ai",
          text: `Halo ${userName}! Riwayat chat telah dibersihkan. Ada yang bisa PANTRA bantu?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      updateMessages(defaultMsg);
    }
  };

  // Muat User & Riwayat Chat saat Halaman Dibuka
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Ambil data user yang aktif login
    const savedQr = localStorage.getItem("pantra_user_qr");
    const savedUserStr = localStorage.getItem("pantra_user");
    let activeName = "Warga PANTRA";
    let activeQr = savedQr || "";

    if (savedUserStr) {
      try {
        const userObj = JSON.parse(savedUserStr);
        if (userObj.name) activeName = userObj.name;
        if (userObj.qrId) activeQr = userObj.qrId;
      } catch (e) {
        console.error("Gagal parse pantra_user", e);
      }
    }

    setUserName(activeName);
    setQrId(activeQr);

    // 2. Ambil riwayat chat tersimpan dari LocalStorage
    const savedChats = localStorage.getItem("pantra_chat_history");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error("Gagal parse pantra_chat_history", e);
      }
    }

    // Default chat pembuka jika belum ada histori
    const initialMsg: ChatMessage[] = [
      {
        id: "msg-init",
        sender: "ai",
        text: `Halo ${activeName}! Saya PANTRA AI. Ada yang bisa saya bantu seputar setoran botol atau saldo kamu hari ini?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMsg);
    localStorage.setItem("pantra_chat_history", JSON.stringify(initialMsg));
  }, []);

  // Handler Kirim Pesan ke Backend Gemini AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Baca QR ID terkini langsung dari browser saat request dikirim
    const currentQr = (typeof window !== "undefined" && localStorage.getItem("pantra_user_qr")) || qrId;

    const userText = text.trim();
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedWithUser = [...messages, newUserMsg];
    updateMessages(updatedWithUser);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:4000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: currentQr,
          message: userText
        })
      });

      const json = await res.json();
      const replyText = json.success && json.data?.reply 
        ? json.data.reply 
        : (json.message || "Maaf, sistem AI sedang memproses permintaan lain. Coba beberapa saat lagi.");

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateMessages([...updatedWithUser, newAiMsg]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Koneksi ke backend terputus. Pastikan server API di port 4000 tetap menyala ya!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateMessages([...updatedWithUser, errorAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
        </div>

        {/* HEADER & DRAWER MOBILE */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-4 px-4 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-5 py-3.5 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[20px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-8 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-sm rounded-xl shadow-lg border border-slate-100 font-['Poppins']">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-3 bg-[#0B424F] text-white p-6 rounded-[24px] flex flex-col gap-6 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <span className="text-sm font-medium font-['Mona_Sans']">{userName}</span>
              </div>
              <nav className="flex flex-col gap-3">
                <Link href="/warga/dashboard" className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins']">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/warga/riwayat" className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins']">
                  <History className="w-5 h-5" />
                  <span>Riwayat Aktivitas</span>
                </Link>
                <Link href="/warga/assistant" className="flex items-center gap-3.5 px-5 py-3.5 bg-[#52C3BF] text-white rounded-[16px] text-sm font-semibold font-['Poppins'] shadow-sm">
                  <UserPlus className="w-5 h-5" />
                  <span>PANTRA Assistant</span>
                </Link>
                <Link href="/warga/login" className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-red-950/40 text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins'] mt-2">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* MAIN CHAT CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 max-h-screen">
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200 shrink-0">
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-[#0B424F] text-xl font-semibold font-['Mona_Sans']">
                PANTRA Assistant
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Didukung oleh Gemini 3.6 Flash — terhubung langsung ke saldo & riwayat setoranmu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleClearChat}
                title="Bersihkan riwayat percakapan"
                className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-[10px] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Hapus Chat</span>
              </button>

              <button onClick={() => setNotificationOpen((prev) => !prev)} className="p-3.5 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold font-['Mona_Sans']">{userName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{qrId || "No QR"}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col items-center justify-center overflow-hidden h-full">
            <div className="w-full h-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
              
              <div className="md:hidden w-full px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                <h2 className="text-[#0B424F] text-base font-semibold font-['Mona_Sans'] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#52C3BF]" />
                  PANTRA Assistant
                </h2>
                <button onClick={handleClearChat} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 bg-white">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "ai" && (
                      <div className="flex gap-4 max-w-[90%] md:max-w-[75%] items-end">
                        <div className="w-9 h-9 rounded-full bg-[#D2F0EE] border border-[#52C3BF] flex items-center justify-center shrink-0 mb-5">
                          <Bot className="w-5 h-5 text-[#0B424F]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs text-[#36959B] font-['Poppins'] font-medium ml-1">PANTRA AI</span>
                          <div className="px-5 py-3.5 bg-[#0B424F] text-white text-sm md:text-base font-['Poppins'] rounded-[20px] rounded-tl-none shadow-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.sender === "user" && (
                      <div className="flex flex-col gap-1.5 items-end max-w-[90%] md:max-w-[75%]">
                        <span className="text-xs text-[#36959B] font-['Poppins'] font-medium mr-1">Anda</span>
                        <div className="px-5 py-3.5 bg-white border border-[#52C3BF] text-[#0B424F] text-sm md:text-base font-['Poppins'] rounded-[20px] rounded-tr-none shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex w-full justify-start animate-fadeIn mt-2">
                    <div className="flex gap-4 max-w-[85%] md:max-w-[70%] items-end">
                      <div className="w-9 h-9 rounded-full bg-[#D2F0EE] border border-[#52C3BF] flex items-center justify-center shrink-0 mb-1">
                        <Bot className="w-5 h-5 text-[#0B424F]" />
                      </div>
                      <div className="px-5 py-4 bg-[#0B424F] rounded-[20px] rounded-tl-none shadow-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts & Chat Input */}
              <div className="w-full bg-white flex flex-col p-4 md:p-6 shrink-0 border-t border-slate-100 z-10">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-4 py-2 bg-white hover:bg-[#E6F5F4] text-[#0B424F] text-xs md:text-sm font-medium font-['Poppins'] rounded-full whitespace-nowrap transition-colors border border-[#52C3BF] shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 relative flex items-center">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(inputValue);
                        }
                      }}
                      placeholder="Tanyakan status saldo, setoran botol, atau aturan daur ulang..."
                      className="w-full max-h-[120px] min-h-[50px] bg-white border border-[#52C3BF] rounded-[14px] pl-4 pr-12 py-3.5 text-sm md:text-base text-[#0B424F] focus:outline-none focus:ring-1 focus:ring-[#36959B] resize-none font-['Poppins'] shadow-sm"
                      rows={1}
                    />
                    
                    <button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isTyping}
                      className="absolute right-2 bottom-1.5 w-9 h-9 flex items-center justify-center bg-[#0B424F] hover:bg-[#1F6A76] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
                      title="Kirim pesan"
                    >
                      <SendHorizontal className="w-4 h-4 md:w-5 md:h-5 ml-[-2px]" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full text-center mt-3">
                   <span className="text-[10px] md:text-xs text-slate-400 font-['Poppins']">
                     PANTRA Assistant membaca data saldo & histori setoranmu secara realtime.
                   </span>
                </div>
              </div>

            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
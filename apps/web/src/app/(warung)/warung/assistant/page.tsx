"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar, { MenuItem } from "@/components/Sidebar";
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
  QrCode,
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
  "Berapa total saldo kas warung saya saat ini?",
  "Berapa komisi yang didapat per botol plastik?",
  "Bagaimana cara memindai QR setoran warga?",
  "Bagaimana prosedur pencairan saldo kas warung?"
];

const warungMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

export default function WarungAssistantPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Identitas Mitra Warung Dinamis dari Session
  const [warungName, setWarungName] = useState<string>("Mitra Warung PANTRA");
  const [warungId, setWarungId] = useState<string>("WRG-0001");

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

  // Helper Simpan Riwayat Chat Warung ke LocalStorage
  const updateMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    if (typeof window !== "undefined") {
      localStorage.setItem("pantra_warung_chat_history", JSON.stringify(newMessages));
    }
  };

  // Bersihkan Riwayat Chat
  const handleClearChat = () => {
    if (confirm("Hapus semua riwayat percakapan asisten warung?")) {
      const initialMsg: ChatMessage[] = [
        {
          id: "msg-init",
          sender: "ai",
          text: `Halo pengelola ${warungName}! Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu seputar operasional warung hari ini?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      updateMessages(initialMsg);
    }
  };

  // 1. Muat Identitas Warung & Riwayat Chat dari Browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ambil identitas warung yang sedang login
    const savedWarungName = localStorage.getItem("pantra_warung_name");
    const savedWarungId = localStorage.getItem("pantra_warung_id");
    const savedWarungUser = localStorage.getItem("pantra_warung_user");

    let currentName = savedWarungName || "Mitra Warung";
    let currentId = savedWarungId || "WRG-0001";

    if (savedWarungUser) {
      try {
        const u = JSON.parse(savedWarungUser);
        if (u.name) currentName = u.name;
        if (u.warungId) currentId = u.warungId;
        else if (u.qrId) currentId = u.qrId;
      } catch (e) {}
    }

    setWarungName(currentName);
    setWarungId(currentId);

    // Ambil riwayat chat warung tersimpan
    const savedChat = localStorage.getItem("pantra_warung_chat_history");
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {}
    }

    // Default chat pembuka jika belum ada histori
    const defaultInitMsg: ChatMessage[] = [
      {
        id: "msg-init",
        sender: "ai",
        text: `Halo pengelola ${currentName}! Saya PANTRA AI siap mendampingi operasional kas, validasi setoran botol, dan rekap kemitraan Anda. Ada yang ingin ditanyakan?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(defaultInitMsg);
    localStorage.setItem("pantra_warung_chat_history", JSON.stringify(defaultInitMsg));
  }, []);

  // 2. Kirim Pesan Langsung ke Endpoint Gemini AI Backend
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userText = text.trim();
    const currentId = (typeof window !== "undefined" && localStorage.getItem("pantra_warung_id")) || warungId;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMsg];
    updateMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:4000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: currentId,
          message: userText
        })
      });

      const json = await res.json();
      const replyText = json.success && json.data?.reply 
        ? json.data.reply 
        : (json.message || "Maaf, sistem asisten AI sedang sibuk. Silakan coba sesaat lagi.");

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateMessages([...updatedMessages, newAiMsg]);
    } catch (error) {
      console.error("AI Warung Assistant Error:", error);
      const errorAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Koneksi ke backend terputus. Pastikan server API di port 4000 tetap berjalan ya!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateMessages([...updatedMessages, errorAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER & NAVBAR DRAWER (Mobile Only) ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors relative"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-xs rounded-xl shadow-lg border border-slate-100 font-['Poppins']">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 rounded-[22px] flex flex-col gap-3 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold font-['Mona_Sans']">{warungName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{warungId}</span>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/assistant";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-[#52C3BF] text-white font-bold shadow-sm" 
                          : "bg-[#235D6B] hover:bg-[#1F6A76] text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link 
                  href="/warung/login" 
                  onClick={() => {
                    localStorage.clear();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-red-950/40 text-red-300 border border-[#52C3BF]/30 rounded-[12px] text-sm mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* ================= 3. MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0 max-h-screen">
          
          {/* Topbar Header Desktop */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200 shrink-0">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans']">
                PANTRA Assistant (Mitra Warung)
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                Didukung oleh Gemini 3.6 Flash — terhubung langsung ke kas dan rekap operasional {warungName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleClearChat}
                title="Hapus riwayat percakapan"
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-[10px] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Hapus Chat</span>
              </button>

              <button onClick={() => setNotificationOpen((prev) => !prev)} className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold leading-tight font-['Mona_Sans']">{warungName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{warungId}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Assistant Chat Body */}
          <main className="p-3 sm:p-5 md:p-6 lg:p-8 flex-1 flex flex-col items-center justify-center overflow-hidden h-full">
            <div className="w-full h-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
              
              {/* Mobile Chat Header */}
              <div className="md:hidden w-full px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                <h2 className="text-[#0B424F] text-sm font-bold font-['Mona_Sans'] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#52C3BF]" />
                  Asisten Warung ({warungId})
                </h2>
                <button onClick={handleClearChat} className="text-red-500 text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-white">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    
                    {/* Pesan AI Warung */}
                    {msg.sender === "ai" && (
                      <div className="flex gap-3 max-w-[90%] md:max-w-[75%] items-end">
                        <div className="w-8 h-8 rounded-full bg-[#D2F0EE] border border-[#52C3BF] flex items-center justify-center shrink-0 mb-4">
                          <Bot className="w-4 h-4 text-[#0B424F]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#36959B] font-medium ml-1">PANTRA AI (Warung)</span>
                          <div className="px-4 py-3 bg-[#0B424F] text-white text-xs md:text-sm rounded-[18px] rounded-tl-none shadow-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pesan Pemilik Warung */}
                    {msg.sender === "user" && (
                      <div className="flex flex-col gap-1 items-end max-w-[90%] md:max-w-[75%]">
                        <span className="text-[11px] text-[#36959B] font-medium mr-1">{warungName}</span>
                        <div className="px-4 py-3 bg-white border border-[#52C3BF] text-[#0B424F] text-xs md:text-sm rounded-[18px] rounded-tr-none shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex w-full justify-start animate-fadeIn mt-1">
                    <div className="flex gap-3 max-w-[85%] md:max-w-[70%] items-end">
                      <div className="w-8 h-8 rounded-full bg-[#D2F0EE] border border-[#52C3BF] flex items-center justify-center shrink-0 mb-1">
                        <Bot className="w-4 h-4 text-[#0B424F]" />
                      </div>
                      <div className="px-4 py-3 bg-[#0B424F] rounded-[18px] rounded-tl-none shadow-sm flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-[#52C3BF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts & Chat Input Area */}
              <div className="w-full bg-white flex flex-col p-3 sm:p-5 shrink-0 border-t border-slate-100 z-10">
                
                {/* Quick Prompts */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#E6F5F4] text-[#0B424F] text-xs font-semibold rounded-full whitespace-nowrap transition-colors border border-[#52C3BF] shadow-xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Box */}
                <div className="flex items-center gap-2">
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
                      placeholder={`Tanyakan saldo kas, setoran botol, atau operasional ${warungName}...`}
                      className="w-full max-h-[100px] min-h-[46px] bg-white border border-[#52C3BF] rounded-xl pl-4 pr-12 py-3 text-xs md:text-sm text-[#0B424F] focus:outline-none focus:ring-1 focus:ring-[#36959B] resize-none shadow-xs"
                      rows={1}
                    />
                    
                    <button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isTyping}
                      className="absolute right-2 bottom-1.5 w-8 h-8 flex items-center justify-center bg-[#0B424F] hover:bg-[#1F6A76] disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-xs"
                      title="Kirim pesan"
                    >
                      <SendHorizontal className="w-4 h-4 ml-[-1px]" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full text-center mt-2">
                   <span className="text-[10px] text-slate-400">
                     PANTRA Assistant membaca status kas &amp; transaksi {warungName} ({warungId}) secara realtime.
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
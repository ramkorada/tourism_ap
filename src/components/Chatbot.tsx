import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, RotateCcw, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Best beaches in AP 🏖️",
  "Tell me about Araku Valley",
  "Plan a 5-day trip 🗺️",
  "Budget for Tirupati 💰",
  "AP emergency numbers 🚨",
  "Best food in Andhra 🍛",
  "Cultural destinations 🛕",
  "Gandikota గురించి చెప్పు 🏔️",
];

/* ── Call the local Flask backend (proxied by Vite on /api/chat) ── */
async function callBackend(messages: Msg[]): Promise<string> {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!resp.ok) throw new Error(`Backend error ${resp.status}`);
  const data = await resp.json();
  if (!data.reply) throw new Error("No reply from backend");
  return data.reply;
}

/* ── Fallback: call Pollinations directly if backend is unavailable ── */
const SYSTEM_PROMPT = `You are "AP Trail Guide" — a friendly, knowledgeable AI tourism assistant for Andhra Pradesh, India.

You have complete knowledge of these destinations in Andhra Pradesh:
Araku Valley, Papikondalu, Borra Caves, Srisailam, Tirupati, Lepakshi, Amaravati, Gandikota, Konaseema, Horsley Hills, Rishikonda Beach, Yarada Beach, Nagarjuna Sagar, Ahobilam, Mantralayam, Talakona Waterfalls, Ethipothala Falls, Pulicat Lake, Lambasingi.

EMERGENCY NUMBERS: Police: 100 | Ambulance: 108 | Fire: 101 | Women Helpline: 181 | AP Tourism: 1800-425-4567

MULTILINGUAL: Detect the language the user is writing in and ALWAYS respond in that same language. If they write in Telugu, respond in Telugu. If Hindi, respond in Hindi. If English, respond in English. Support all Indian languages.

Be warm, friendly, give specific budget info (Budget/Mid/Luxury tiers), suggest itineraries and circuits. Use emojis occasionally.`;

async function callPollinationsFallback(messages: Msg[]): Promise<string> {
  const resp = await fetch("https://text.pollinations.ai/openai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });
  if (!resp.ok) throw new Error(`Pollinations error ${resp.status}`);
  const json = await resp.json();
  const reply = json?.choices?.[0]?.message?.content?.trim();
  if (!reply || reply.toLowerCase().includes("deprecated") || reply.includes("IMPORTANT NOTICE")) {
    throw new Error("Bad response from Pollinations");
  }
  return reply;
}

import { destinations } from "@/data/destinations";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"backend" | "fallback" | null>(null);
  const [isSelectingDest, setIsSelectingDest] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    // Handle special trigger for destination buttons
    if (text === "Best time to visit 📅") {
      setMessages(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "Please select a destination to check the best time to visit:" }
      ]);
      setIsSelectingDest(true);
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsSelectingDest(false);

    let reply = "";
    try {
      // 1st try: Flask backend (full system prompt + AP knowledge base)
      reply = await callBackend(newMessages);
      setSource("backend");
    } catch {
      try {
        // 2nd try: Direct Pollinations call
        reply = await callPollinationsFallback(newMessages);
        setSource("fallback");
      } catch {
        reply = "🌐 I'm having trouble connecting right now. Please check your internet and try again.";
        setSource(null);
      }
    }

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const handleSend = () => {
    if (input.trim()) sendMessage(input.trim());
  };

  const resetChat = () => {
    setMessages([]);
    setSource(null);
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)" }}
        aria-label="Open chatbot"
        id="chatbot-toggle-btn"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          id="chatbot-window"
          className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[580px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">AP Trail Guide</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-white/70">
                    AI-powered • Multilingual
                    {source === "backend" && " • Local AI"}
                    {source === "fallback" && " • Cloud AI"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-white/50" title="Supports all languages" />
              <button
                onClick={resetChat}
                className="text-white/70 hover:text-white transition-colors p-1"
                title="Reset chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f120, #a855f720)" }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Hi! I'm your AP Travel Guide 🌟</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI-powered • Ask in English, Telugu, Hindi or any language!
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }
                      : undefined
                  }
                >
                  {msg.role === "assistant" ? (
                   <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_p]:mb-1.5 [&_ul]:mt-1 [&_ol]:mt-1 [&_h2]:text-base [&_h2]:mt-0 [&_h2]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_th]:border [&_th]:border-white/20 [&_th]:p-2 [&_th]:bg-white/5 [&_td]:border [&_td]:border-white/10 [&_td]:p-2 overflow-x-auto no-scrollbar">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content.replace(/<br\s*\/?>/gi, "\n")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Destination Selection Buttons */}
            {isSelectingDest && (
              <div className="flex flex-wrap gap-2 py-2">
                {destinations.slice(0, 12).map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => sendMessage(`Best time to visit ${dest.name}`)}
                    className="px-3 py-1.5 rounded-xl border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 text-xs transition-all font-medium"
                  >
                    {dest.name}
                  </button>
                ))}
                <button
                  onClick={() => setIsSelectingDest(false)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-white/40 bg-white/5 hover:bg-white/10 text-xs transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">AI is thinking…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions after messages */}
          {messages.length > 0 && messages.length < 6 && !loading && (
            <div className="px-3 pb-1 flex gap-1 overflow-x-auto shrink-0 no-scrollbar">
              {["Best time to visit 📅", "Budget tips 💰", "Emergency numbers 🚨", "Telugu లో చెప్పు"].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors whitespace-nowrap shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl text-white transition-all disabled:opacity-40 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                id="chatbot-send-btn"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

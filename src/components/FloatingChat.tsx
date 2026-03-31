import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Olá! Sou o concierge GT Flow. Como posso ajudar? 🤝" },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, text: input },
      { role: "ai" as const, text: "Entendi! Estou processando sua solicitação... ✨" },
    ]);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 w-80 bg-card rounded-squircle shadow-hover overflow-hidden border border-border"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">🤝 Concierge GT Flow</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                    m.role === "user" ? "gradient-peach text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Digite..."
                className="flex-1 bg-muted rounded-full px-3 py-2 text-xs text-foreground focus:outline-none"
              />
              <button onClick={send} className="w-8 h-8 gradient-peach rounded-full flex items-center justify-center">
                <Send size={12} className="text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-card gradient-peach text-2xl"
        title="Fale com nosso concierge"
      >
        {open ? <X size={22} className="text-primary-foreground" /> : "🤝"}
      </motion.button>
    </>
  );
};

export default FloatingChat;

import { createContext, useContext, useState, type ReactNode } from "react";
import type { UIMessage } from "ai";
export interface TrafficThread { id: string; title: string; messages: UIMessage[] }
const Context = createContext<{ threads: TrafficThread[]; createThread: () => string; saveMessages: (id: string, messages: UIMessage[]) => void } | null>(null);
export function TrafficChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<TrafficThread[]>([]);
  const createThread = () => { const id = crypto.randomUUID(); setThreads(prev => [...prev, { id, title: "Nova conversa", messages: [] }]); return id; };
  const saveMessages = (id: string, messages: UIMessage[]) => setThreads(prev => prev.map(t => t.id === id ? { ...t, messages, title: messages.find(m => m.role === "user")?.parts.filter(p => p.type === "text").map(p => p.text).join("").slice(0, 42) || t.title } : t));
  return <Context.Provider value={{ threads, createThread, saveMessages }}>{children}</Context.Provider>;
}
export function useTrafficChat() { const ctx = useContext(Context); if (!ctx) throw new Error("Missing TrafficChatProvider"); return ctx; }
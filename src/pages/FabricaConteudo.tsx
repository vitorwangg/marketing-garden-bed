import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Sparkles, Send, Clock, CheckCircle, Flame, Search, TrendingUp,
  Instagram, Globe, Twitter, ChevronDown, Image, FileText, Trash2,
  Eye, X, CalendarIcon, Loader2, Mail, CheckCheck, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const trendingTopics = [
  { category: "Marketing", items: ["🔥 Dia das Mães", "Copy Persuasiva", "Funil AIDA", "Email Marketing 2026", "Growth Hacking"] },
  { category: "Tendências", items: ["SEO 2026", "Trends Reels", "IA Generativa", "Vídeos Curtos", "Social Commerce"] },
];

const logoVersions = ["Principal", "Monocromática", "Ícone"] as const;

const channels = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Globe },
  { id: "tiktok", label: "TikTok", icon: Twitter },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "email", label: "E-mail Marketing", icon: Globe },
];

const searchSuggestions = [
  "Marketing digital para e-commerce",
  "Tendências de redes sociais 2026",
  "Como aumentar engajamento no Instagram",
  "Estratégias de email marketing",
  "Copy para anúncios Meta Ads",
  "Conteúdo viral TikTok",
  "SEO para blogs corporativos",
  "Funil de vendas automatizado",
  "Growth hacking para startups",
  "Branding pessoal nas redes",
];

interface GeneratedContent {
  id: string;
  canal: string;
  channelId: string;
  title: string;
  summary: string;
  fullText: string;
  imageUrl?: string;
  createdAt: Date;
  status: "pending" | "scheduled";
  scheduledDate?: Date;
}

interface HistoryItem {
  id: string;
  title: string;
  status: string;
  date: string;
  channel: string;
  image: string;
  caption: string;
  usedBrand: string;
  usedVoice: string;
}

function extractImagePrompt(text: string): string | undefined {
  const match = text.match(/\[IMAGE_PROMPT:\s*(.*?)\]/is);
  return match ? match[1].trim() : undefined;
}

function removeImagePromptTag(text: string): string {
  return text.replace(/\[IMAGE_PROMPT:\s*.*?\]/gis, "").trim();
}

function pollinationsUrl(prompt: string): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
}

function extractTitle(text: string): string {
  const h1 = text.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]*>/g, "");
  const boldTitle = text.match(/\*\*(?:Título:?\s*)(.*?)\*\*/i);
  if (boldTitle) return boldTitle[1];
  const firstLine = text.split("\n").find(l => l.trim().length > 0) || "";
  return firstLine.replace(/[#*]/g, "").trim().slice(0, 80) || "Conteúdo Gerado";
}

function extractSummary(text: string): string {
  const clean = text.replace(/<[^>]*>/g, "").replace(/[#*]/g, "").replace(/\n+/g, " ").trim();
  return clean.slice(0, 150) + (clean.length > 150 ? "..." : "");
}

function getChannelId(label: string): string {
  const ch = channels.find(c => c.label.toLowerCase() === label.toLowerCase());
  return ch?.id || "instagram";
}

function getChannelIcon(channelId: string) {
  return channels.find(c => c.id === channelId)?.icon || Globe;
}

function getChannelLabel(channelId: string) {
  return channels.find(c => c.id === channelId)?.label || channelId;
}

type Marca = Tables<"marcas">;

const FabricaConteudo = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"criacao" | "aprovacao" | "historico">("criacao");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<string>(logoVersions[0]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingContent, setViewingContent] = useState<GeneratedContent | null>(null);
  const [brands, setBrands] = useState<Marca[]>([]);

  // Fetch brands from Supabase
  useEffect(() => {
    if (!user) return;
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("marcas")
        .select("*")
        .eq("user_id", user.email);
      if (error) {
        console.error("Erro ao buscar marcas:", error);
        return;
      }
      setBrands(data || []);
    };
    fetchBrands();
  }, [user]);

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || null;

  // Resolve logo URL based on selected logo version
  const getSelectedLogoUrl = (): string | null => {
    if (!selectedBrand) return null;
    switch (selectedLogo) {
      case "Principal": return selectedBrand.logo_principal_url;
      case "Monocromática": return selectedBrand.logo_branca_url;
      case "Ícone": return selectedBrand.logo_preta_url;
      default: return selectedBrand.logo_principal_url;
    }
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!selectedBrand) return;

    // 1. Limpa estado anterior e ativa loading
    setContents([]);
    setViewingContent(null);
    setIsGenerating(true);

    const channelLabels = selectedChannels.length > 0
      ? selectedChannels.map(id => channels.find(c => c.id === id)?.label || "Instagram")
      : ["Instagram"];

    // 2. Timeout de 30s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("https://vwg.app.n8n.cloud/webhook-test/gerar-conteudo", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim() || `Crie conteúdo para ${selectedBrand}`,
          canais: channelLabels,
          marca: selectedBrand,
          logo: selectedLogo,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rawData = await res.json();
      console.log("Resposta n8n:", rawData);

      // Parse string responses
      let parsed = rawData;
      if (typeof rawData === "string") {
        try { parsed = JSON.parse(rawData); } catch { parsed = rawData; }
      }

      // Support `data` wrapper
      let payload = parsed?.data || parsed;
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch { /* keep */ }
      }

      const resolveImageUrl = (item: any, text: string): string | undefined => {
        const explicit = item?.image || item?.imageUrl || item?.image_url;
        if (explicit) return explicit;
        const imgPrompt = extractImagePrompt(text);
        if (imgPrompt) return pollinationsUrl(imgPrompt);
        return undefined;
      };

      const newContents: GeneratedContent[] = [];

      if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
        Object.keys(payload).forEach((channelKey, i) => {
          const value = payload[channelKey];
          const item = typeof value === "string" ? { text: value } : value;
          const rawText = item?.texto || item?.text || item?.content || item?.caption || JSON.stringify(item);
          const imageUrl = item?.imagem || item?.image || item?.imageUrl || item?.image_url || resolveImageUrl(item, rawText);
          const cleanText = removeImagePromptTag(rawText);
          const matchedChannel = channels.find(
            c => c.label.toLowerCase() === channelKey.toLowerCase() || c.id.toLowerCase() === channelKey.toLowerCase()
          );
          newContents.push({
            id: `${Date.now()}-${i}`,
            canal: matchedChannel?.label || channelKey,
            channelId: matchedChannel?.id || channelKey.toLowerCase(),
            title: extractTitle(cleanText),
            summary: extractSummary(cleanText),
            fullText: cleanText,
            imageUrl,
            createdAt: new Date(),
            status: "pending" as const,
          });
        });
      } else {
        const items = Array.isArray(payload) ? payload : [payload];
        items.forEach((item: any, i: number) => {
          const raw = typeof item === "string" ? { text: item } : item;
          const rawText = raw.text || raw.content || JSON.stringify(raw);
          const imageUrl = resolveImageUrl(raw, rawText);
          const cleanText = removeImagePromptTag(rawText);
          const itemChannel = raw.canal || raw.channel || channelLabels[i] || channelLabels[0];
          newContents.push({
            id: `${Date.now()}-${i}`,
            canal: itemChannel,
            channelId: getChannelId(itemChannel),
            title: extractTitle(cleanText),
            summary: extractSummary(cleanText),
            fullText: cleanText,
            imageUrl,
            createdAt: new Date(),
            status: "pending" as const,
          });
        });
      }

      if (newContents.length === 0) {
        toast.error("O webhook não retornou nenhum conteúdo.");
        return;
      }

      setContents(newContents);
      toast.success(`${newContents.length} conteúdo${newContents.length > 1 ? "s" : ""} gerado${newContents.length > 1 ? "s" : ""} com sucesso! 🎉`);
      setActiveTab("aprovacao");
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      setContents([]);
      if (err.name === "AbortError") {
        toast.error("Erro de Conexão: O servidor não respondeu em 30 segundos.");
      } else {
        toast.error(`Erro ao gerar conteúdo: ${err.message || "Tente novamente."}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendPrompt = () => {
    if (!prompt.trim() || !selectedBrand) return;
    handleGenerate();
    setPrompt("");
    setShowSuggestions(false);
  };

  const handleDelete = (id: string) => {
    setContents(prev => prev.filter(c => c.id !== id));
    toast("Conteúdo removido");
  };

  const handleDeleteAll = () => {
    setContents([]);
    setViewingContent(null);
    toast("Todos os conteúdos foram removidos");
  };

  const handlePost = (content: GeneratedContent) => {
    // Move to history
    const historyItem: HistoryItem = {
      id: content.id,
      title: content.title,
      status: "publicado",
      date: format(new Date(), "dd/MM/yyyy HH:mm"),
      channel: content.canal,
      image: content.imageUrl || "",
      caption: content.summary,
      usedBrand: selectedBrand,
      usedVoice: "Padrão",
    };
    setHistory(prev => [historyItem, ...prev]);
    setContents(prev => prev.filter(c => c.id !== content.id));
    toast.success(`Publicado em ${content.canal}! (simulado)`);
  };

  const handlePostAll = () => {
    const newHistory: HistoryItem[] = contents.map(content => ({
      id: content.id,
      title: content.title,
      status: "publicado",
      date: format(new Date(), "dd/MM/yyyy HH:mm"),
      channel: content.canal,
      image: content.imageUrl || "",
      caption: content.summary,
      usedBrand: selectedBrand,
      usedVoice: "Padrão",
    }));
    setHistory(prev => [...newHistory, ...prev]);
    setContents([]);
    setViewingContent(null);
    toast.success(`${newHistory.length} conteúdo(s) publicado(s) com sucesso! 🎉`);
  };

  const handleSchedule = (id: string, date: Date) => {
    setContents(prev => prev.map(c =>
      c.id === id ? { ...c, status: "scheduled" as const, scheduledDate: date } : c
    ));
    setViewingContent(prev => prev && prev.id === id ? { ...prev, status: "scheduled" as const, scheduledDate: date } : prev);
    toast.success(`Agendado para ${format(date, "dd/MM/yyyy 'às' HH:mm")}`);
  };

  const filteredSuggestions = useMemo(() => {
    if (!prompt.trim()) return [];
    return searchSuggestions.filter(s => s.toLowerCase().includes(prompt.toLowerCase())).slice(0, 5);
  }, [prompt]);

  const filteredHistory = channelFilter ? history.filter(h => h.channel === channelFilter) : history;
  const filteredContents = channelFilter ? contents.filter(c => c.channelId === channelFilter) : contents;

  const tabs = ["criacao", "aprovacao", "historico"] as const;
  const tabLabels = { criacao: "Criação", aprovacao: "Aprovação", historico: "Histórico" };

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-6">
          <Sparkles className="inline mr-2 text-primary" size={28} />
          Fábrica de Conteúdo
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === t ? "gradient-peach text-primary-foreground shadow-card" : "bg-card text-muted-foreground"}`}
            >{tabLabels[t]}{t === "aprovacao" && contents.length > 0 ? ` (${contents.length})` : ""}</button>
          ))}
        </div>

        {activeTab === "criacao" && (
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
              <h2 className="font-bold text-foreground mb-4">O que você quer criar hoje?</h2>

              <div className="flex flex-wrap gap-3 mb-4">
                <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground focus-glow min-w-[200px]">
                  <option value="">Selecionar marca *</option>
                  {user?.brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={selectedLogo} onChange={(e) => setSelectedLogo(e.target.value)}
                  className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground focus-glow">
                  {logoVersions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Canais de destino</label>
                <div className="flex flex-wrap gap-2">
                  {channels.map((ch) => (
                    <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        selectedChannels.includes(ch.id) ? "gradient-peach text-primary-foreground shadow-card" : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}>
                      <ch.icon size={14} /> {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input value={prompt} onChange={(e) => { setPrompt(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => prompt.trim() && setShowSuggestions(true)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendPrompt(); }}
                      placeholder={selectedBrand ? `Descreva o conteúdo para ${selectedBrand}...` : "Selecione uma marca primeiro..."}
                      disabled={!selectedBrand}
                      className="w-full bg-muted rounded-full px-5 py-3.5 text-sm text-foreground focus-glow disabled:opacity-50" />
                    <AnimatePresence>
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-hover overflow-hidden z-30">
                          {filteredSuggestions.map((s, i) => (
                            <button key={i} onClick={() => { setPrompt(`{${s}} `); setShowSuggestions(false); }}
                              className="w-full text-left px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-0">
                              <Search size={14} className="text-muted-foreground flex-shrink-0" />
                              <span>{s}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                    onClick={handleSendPrompt} disabled={!selectedBrand || isGenerating}
                    className="h-12 gradient-peach rounded-full flex items-center justify-center disabled:opacity-50 gap-2 px-4 min-w-[48px]">
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="text-primary-foreground animate-spin" />
                        <span className="text-xs text-primary-foreground font-medium hidden sm:inline">A IA está redigindo seu conteúdo...</span>
                      </>
                    ) : (
                      <Send size={18} className="text-primary-foreground" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trendingTopics.map((topic) => (
                <motion.div key={topic.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="font-bold text-foreground text-sm">{topic.category}</h3>
                  </div>
                  <div className="space-y-0">
                    {topic.items.map((item, i) => (
                      <button key={item} onClick={() => { setPrompt(`{${item}} `); }}
                        className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors rounded-lg px-2">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">{i + 1} · Trending</p>
                          <p className="text-sm font-semibold text-foreground">{item}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{Math.floor(Math.random() * 50 + 10)}K posts</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search size={16} className="text-primary" />
                <h3 className="font-bold text-foreground text-sm">Pesquisar por categorias</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted rounded-full text-sm text-foreground focus-glow" placeholder="Buscar tendências, temas, nichos..." />
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "aprovacao" && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setChannelFilter("")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${!channelFilter ? "gradient-peach text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                Todos
              </button>
              {channels.map((ch) => (
                <button key={ch.id} onClick={() => setChannelFilter(ch.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${channelFilter === ch.id ? "gradient-peach text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                  <ch.icon size={12} /> {ch.label}
                </button>
              ))}
            </div>
            {filteredContents.length > 0 ? (
              <>
                <div className="flex gap-3 mb-4">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handlePostAll}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-peach text-primary-foreground text-xs font-semibold shadow-card">
                    <CheckCheck size={15} /> Publicar Todos ({contents.length})
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleDeleteAll}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                    <Trash2 size={15} /> Excluir Todos
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredContents.map((content) => {
                    const ChannelIcon = getChannelIcon(content.channelId);
                    return (
                      <motion.div
                        key={content.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        className="bento-card p-5"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <ChannelIcon size={14} className="text-primary" />
                          <span className="text-xs font-semibold text-primary">{content.canal}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {format(content.createdAt, "dd/MM HH:mm")}
                          </span>
                        </div>

                        {/* Status badge */}
                        {content.status === "scheduled" && content.scheduledDate && (
                          <div className="mb-2">
                            <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                              📅 Agendado: {format(content.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                          </div>
                        )}

                        {/* Title & Summary */}
                        <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2">{content.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-3">{content.summary}</p>

                        {/* Ver Completo */}
                        <button onClick={() => setViewingContent(content)}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-3">
                          <Eye size={12} /> Ver Completo
                        </button>

                        {/* Action Buttons - prominent */}
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handlePost(content)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full gradient-peach text-primary-foreground text-xs font-semibold shadow-card">
                            <Send size={13} /> Publicar
                          </motion.button>
                          <ScheduleButton contentId={content.id} onSchedule={handleSchedule} />
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleDelete(content.id)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              </>
            ) : (
              <div className="bento-card p-8 text-center">
                <Flame size={40} className="text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum conteúdo pendente de aprovação</p>
                <p className="text-xs text-muted-foreground mt-1">Gere conteúdo na aba Criação para começar</p>
              </div>
            )}
          </>
        )}

        {activeTab === "historico" && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setChannelFilter("")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${!channelFilter ? "gradient-peach text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                Todos
              </button>
              {channels.map((ch) => (
                <button key={ch.id} onClick={() => setChannelFilter(ch.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${channelFilter === ch.id ? "gradient-peach text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                  <ch.icon size={12} /> {ch.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredHistory.length > 0 ? filteredHistory.map((h, idx) => (
                <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card overflow-hidden">
                  <button onClick={() => setExpandedHistory(expandedHistory === idx ? null : idx)}
                    className="w-full p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-accent-foreground" />
                      <div className="text-left">
                        <span className="font-medium text-foreground block">{h.title}</span>
                        <span className="text-xs text-muted-foreground">{h.channel} · {h.date}</span>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expandedHistory === idx ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedHistory === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                        <div className="bg-muted rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Image size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Formato: {h.image}</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Legenda</label>
                            <p className="text-sm text-foreground mt-1">{h.caption}</p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Marca</label>
                              <p className="text-sm text-foreground">{h.usedBrand}</p>
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Tom</label>
                              <p className="text-sm text-foreground">{h.usedVoice}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )) : (
                <div className="bento-card p-8 text-center">
                  <CheckCircle size={40} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum conteúdo no histórico</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ============ MULTI-CHANNEL MODAL ============ */}
      <AnimatePresence>
        {viewingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingContent(null)}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-hover"
            >
              {/* Close button */}
              <button onClick={() => setViewingContent(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <X size={16} className="text-foreground" />
              </button>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 pb-4">
                {/* Channel header */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => { const Icon = getChannelIcon(viewingContent.channelId); return <Icon size={16} className="text-primary" />; })()}
                  <span className="text-sm font-semibold text-primary">{viewingContent.canal}</span>
                  <span className="text-xs text-muted-foreground">· {format(viewingContent.createdAt, "dd/MM/yyyy HH:mm")}</span>
                </div>

                {/* Status badge in modal */}
                {viewingContent.status === "scheduled" && viewingContent.scheduledDate && (
                  <div className="mb-4">
                    <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">
                      📅 Agendado: {format(viewingContent.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                )}

                {/* ======= BLOG LAYOUT ======= */}
                {viewingContent.channelId === "blog" && (
                  <div className="space-y-4">
                    {/* Banner 16:9 shimmer */}
                    <ShimmerImagePlaceholder aspectRatio="16/9" imageUrl={viewingContent.imageUrl} />
                    <div
                      className="prose prose-sm max-w-none text-foreground [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-primary [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: viewingContent.fullText }}
                    />
                  </div>
                )}

                {/* ======= SOCIAL LAYOUT (Instagram / TikTok / Facebook) ======= */}
                {(viewingContent.channelId === "instagram" || viewingContent.channelId === "tiktok" || viewingContent.channelId === "facebook") && (
                  <div className="space-y-4">
                    {/* Square 1:1 image placeholder */}
                    <div className="max-w-sm mx-auto">
                      <ShimmerImagePlaceholder aspectRatio="1/1" imageUrl={viewingContent.imageUrl} />
                    </div>
                    {/* Caption */}
                    <div className="bg-muted rounded-2xl p-4">
                      <div
                        className="text-sm text-foreground leading-relaxed whitespace-pre-wrap [&_h1]:text-primary [&_h1]:font-bold [&_b]:font-bold [&_strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: viewingContent.fullText }}
                      />
                    </div>
                  </div>
                )}

                {/* ======= EMAIL LAYOUT ======= */}
                {viewingContent.channelId === "email" && (
                  <div className="space-y-4">
                    <div className="border border-border rounded-2xl overflow-hidden bg-card">
                      {/* Email header bar */}
                      <div className="bg-muted px-5 py-3 border-b border-border flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Assunto:</span>
                        <span className="text-sm font-bold text-foreground">{viewingContent.title}</span>
                      </div>
                      {/* Email body */}
                      <div className="p-5 space-y-4">
                        <ShimmerImagePlaceholder aspectRatio="16/9" imageUrl={viewingContent.imageUrl} />
                        <div
                          className="text-sm text-foreground leading-relaxed [&_h1]:text-primary [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_p]:mb-3 [&_b]:font-bold [&_strong]:font-bold"
                          dangerouslySetInnerHTML={{ __html: viewingContent.fullText }}
                        />
                        {/* CTA Button */}
                        <div className="text-center pt-2">
                          <button className="gradient-peach text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm shadow-card hover:shadow-hover transition-all">
                            Saiba Mais →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ======= STICKY FOOTER ACTIONS ======= */}
              <div className="border-t border-border px-6 py-4 flex gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { handlePost(viewingContent); setViewingContent(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full gradient-peach text-primary-foreground font-semibold text-sm shadow-card">
                  <Send size={15} /> Publicar
                </motion.button>
                <ScheduleButton contentId={viewingContent.id} onSchedule={(id, date) => { handleSchedule(id, date); }} />
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { handleDelete(viewingContent.id); setViewingContent(null); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-destructive/10 text-destructive font-semibold text-sm">
                  <Trash2 size={15} /> Excluir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============ SHIMMER IMAGE PLACEHOLDER ============ */
function ShimmerImagePlaceholder({ aspectRatio, imageUrl }: { aspectRatio: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio }}>
        <img src={imageUrl} alt="Conteúdo gerado" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-muted"
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-card to-muted animate-pulse" />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.06) 50%, transparent 100%)",
          animation: "shimmer 2s infinite",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Image size={28} className="text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground/60 font-medium">Aguardando conexão com IA de Imagem...</span>
      </div>
    </div>
  );
}

/* ============ SCHEDULE BUTTON WITH DATE + TIME ============ */
function ScheduleButton({ contentId, onSchedule }: { contentId: string; onSchedule: (id: string, date: Date) => void }) {
  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (!date) return;
    const scheduled = new Date(date);
    scheduled.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onSchedule(contentId, scheduled);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-3 rounded-full bg-muted text-foreground text-xs sm:text-sm font-semibold">
          <Clock size={14} /> Agendar
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" side="top">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          {/* Time picker */}
          <div className="flex items-center justify-center gap-2 px-3">
            <Clock size={14} className="text-muted-foreground" />
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="bg-muted border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground focus-glow"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>
              ))}
            </select>
            <span className="text-foreground font-bold">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="bg-muted border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground focus-glow"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>
              ))}
            </select>
          </div>
          {/* Confirm button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={!date}
            className="w-full py-2.5 rounded-full gradient-peach text-primary-foreground font-semibold text-sm disabled:opacity-50 shadow-card"
          >
            Confirmar Agendamento
          </motion.button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FabricaConteudo;

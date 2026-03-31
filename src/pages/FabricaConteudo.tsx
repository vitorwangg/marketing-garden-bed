import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Sparkles, Send, Clock, CheckCircle, Flame, Search, TrendingUp,
  Instagram, Globe, Twitter, ChevronDown, Image, FileText, Trash2,
  Eye, X, CalendarIcon, Loader2, Mail, CheckCheck, AlertTriangle,
  Download, Upload, ToggleLeft, ToggleRight, Video, Coins
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import FabricaCalendario from "@/components/FabricaCalendario";

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
  // Media override
  useGeneratedMedia: boolean;
  customMediaUrl?: string;
  customMediaType?: "imagem" | "video";
}

interface HistoryItem {
  id: string;
  title: string;
  status: string;
  date: string;
  channel: string;
  channelId: string;
  image: string;
  caption: string;
  fullText: string;
  usedBrand: string;
  usedVoice: string;
  scheduledDate?: string;
}

function extractImagePrompt(text: string): string | undefined {
  const match = text.match(/\[IMAGE_PROMPT:\s*(.*?)\]/is);
  return match ? match[1].trim() : undefined;
}

function removeImagePromptTag(text: string): string {
  return text.replace(/\[IMAGE_PROMPT:\s*.*?\]/gis, "").trim();
}

function cleanDisplayText(text: string): string {
  let t = text;
  t = t.replace(/https?:\/\/\S+\.(jpg|jpeg|png|gif|webp|svg)(\?\S*)?\s*/gi, "");
  t = t.replace(/^\s*[{"\s]*[A-Za-zÀ-ÿ_-]+["\s]*:\s*/gm, "");
  t = t.replace(/[{}[\]]+/g, "");
  t = t.replace(/^["']+|["']+$/gm, "");
  return t.trim();
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

function getMediaType(url: string): "imagem" | "video" {
  const lower = url.toLowerCase();
  if (lower.endsWith(".mp4") || lower.includes("video")) return "video";
  return "imagem";
}

type Marca = Tables<"marcas">;

const WEBHOOK_GERAR = "https://gtflow.app.n8n.cloud/webhook/gerar-conteudo";
const WEBHOOK_PUBLICAR = "https://gtflow.app.n8n.cloud/webhook/ac75015e-deda-4440-bb1f-c434c902def1";
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB

const FabricaConteudo = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"criacao" | "aprovacao" | "historico" | "calendario">("criacao");
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
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [temaVisual, setTemaVisual] = useState("");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const TOTAL_TOKENS = 400;
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

  // Fetch history from Supabase
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("conteudos")
        .select("*")
        .eq("user_id", user.email)
        .in("status", ["publicado", "agendado"])
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Erro ao buscar histórico:", error);
        return;
      }
      const items: HistoryItem[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.titulo || "Conteúdo",
        status: row.status,
        date: row.data_publicada ? format(new Date(row.data_publicada), "dd/MM/yyyy HH:mm") : format(new Date(row.created_at), "dd/MM/yyyy HH:mm"),
        channel: row.canal,
        channelId: row.channel_id,
        image: row.imagem_url || "",
        caption: row.resumo || "",
        fullText: row.texto_completo || "",
        usedBrand: row.marca_nome || "",
        usedVoice: row.tom_de_voz || "Padrão",
        scheduledDate: row.data_agendada || undefined,
      }));
      setHistory(items);
    };
    fetchHistory();
  }, [user]);

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || null;

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

  /** Resolve the final media URL and type for a content card */
  const resolveMedia = (content: GeneratedContent): { url: string; tipo: "imagem" | "video" } => {
    if (!content.useGeneratedMedia && content.customMediaUrl) {
      return { url: content.customMediaUrl, tipo: content.customMediaType || "imagem" };
    }
    const url = content.imageUrl || "";
    return { url, tipo: getMediaType(url) };
  };

  /** Upload custom media file to Supabase Storage */
  const handleMediaUpload = async (contentId: string, file: File) => {
    if (file.size > MAX_UPLOAD_SIZE) {
      toast.error("Arquivo excede 50MB. Escolha um arquivo menor.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const isVideo = file.type.startsWith("video/") || ext === "mp4";
    const accepted = ["jpg", "jpeg", "png", "mp4"];
    if (!accepted.includes(ext)) {
      toast.error("Formato não suportado. Use JPG, PNG ou MP4.");
      return;
    }

    setUploadingId(contentId);
    const filePath = `conteudo-media/${contentId}-${Date.now()}.${ext}`;

    try {
      const { error } = await supabase.storage.from("conteudos_midia").upload(filePath, file, { upsert: true });
      if (error) throw error;

      const { data: publicData } = supabase.storage.from("conteudos_midia").getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;
      const tipo: "imagem" | "video" = isVideo ? "video" : "imagem";

      setContents(prev => prev.map(c =>
        c.id === contentId ? { ...c, useGeneratedMedia: false, customMediaUrl: publicUrl, customMediaType: tipo } : c
      ));
      // Also update viewingContent if open
      setViewingContent(prev => prev && prev.id === contentId ? { ...prev, useGeneratedMedia: false, customMediaUrl: publicUrl, customMediaType: tipo } : prev);

      toast.success(`${isVideo ? "Vídeo" : "Imagem"} enviado com sucesso!`);
    } catch (err: any) {
      console.error("Erro no upload:", err);
      toast.error(`Erro ao fazer upload: ${err.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  const toggleUseGeneratedMedia = (contentId: string) => {
    setContents(prev => prev.map(c =>
      c.id === contentId ? { ...c, useGeneratedMedia: !c.useGeneratedMedia } : c
    ));
    setViewingContent(prev => prev && prev.id === contentId ? { ...prev, useGeneratedMedia: !prev.useGeneratedMedia } : prev);
  };

  const handleGenerate = async () => {
    if (!selectedBrand) {
      toast.error("⚠️ Selecione uma marca primeiro! Vá em Brand DNA para cadastrar seu DNA.");
      return;
    }
    if (isGenerating) return;

    setContents([]);
    setViewingContent(null);
    setIsGenerating(true);

    const channelLabels = selectedChannels.length > 0
      ? selectedChannels.map(id => channels.find(c => c.id === id)?.label || "Instagram")
      : ["Instagram"];

    const safe = (val: string | null | undefined): string => val ?? "";
    const safeArr = (val: string[] | null | undefined): string => (val ?? []).join(", ");

    // Insert a preliminary record in Supabase to get the conteudo_id
    const { data: insertedRow, error: insertError } = await supabase
      .from("conteudos")
      .insert({
        canal: channelLabels.join(", "),
        channel_id: selectedChannels.length > 0 ? selectedChannels[0] : "instagram",
        status: "gerando",
        marca_id: selectedBrand.id,
        marca_nome: selectedBrand.nome_da_marca ?? null,
        tom_de_voz: safeArr(selectedBrand.tom_de_voz) || null,
        user_id: user?.email ?? null,
      })
      .select("id")
      .single();

    if (insertError || !insertedRow) {
      console.error("Erro ao criar registro de conteúdo:", insertError);
      toast.error("Erro ao preparar geração de conteúdo.");
      setIsGenerating(false);
      return;
    }

    const conteudoId = insertedRow.id;

    const payload = {
      conteudo_id: conteudoId,
      tema: prompt.trim() || `Crie conteúdo para ${safe(selectedBrand.nome_da_marca)}`,
      canais: channelLabels,
      logo: selectedLogo,
      logo_url: getSelectedLogoUrl() ?? "",
      nome_da_marca: safe(selectedBrand.nome_da_marca),
      pitch_bio: safe(selectedBrand.pitch_bio),
      idioma_padrao: safe(selectedBrand.idioma_padrao) || "PT-BR",
      modelo_venda: safe(selectedBrand.modelo_venda),
      mercado_nicho: safeArr(selectedBrand.mercado_nicho),
      tom_de_voz: safeArr(selectedBrand.tom_de_voz),
      palavras_proibidas: safeArr(selectedBrand.palavras_proibidas),
      publico_alvo: [
        safe(selectedBrand.publico_genero),
        safeArr(selectedBrand.publico_faixa_etaria),
      ].filter(Boolean).join(" — ") || "",
      tema_visual: temaVisual.trim(),
    };

    console.log("Dados enviados ao n8n:", payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(WEBHOOK_GERAR, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rawData = await res.json();
      console.log("Resposta n8n:", rawData);

      let parsed = rawData;
      if (typeof rawData === "string") {
        try { parsed = JSON.parse(rawData); } catch { parsed = rawData; }
      }

      let data = parsed?.data?.data || parsed?.data || parsed;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { /* keep */ }
      }

      const resolveImageUrl = (item: any, text: string): string | undefined => {
        const explicit = item?.image || item?.imageUrl || item?.image_url;
        if (explicit) return explicit;
        const imgPrompt = extractImagePrompt(text);
        if (imgPrompt) return pollinationsUrl(imgPrompt);
        return undefined;
      };

      const extractText = (val: any): string => {
        if (typeof val === "string") return val;
        if (val && typeof val === "object") {
          return val.texto || val.text || val.content || val.caption || val.body || "";
        }
        return "";
      };

      const extractImage = (val: any, text: string): string | undefined => {
        if (val && typeof val === "object") {
          // Check midia.url first (Hugging Face response)
          if (val.midia && val.midia.url) return val.midia.url;
          const img = val.imagem || val.image || val.imageUrl || val.image_url;
          if (img) return img;
        }
        return resolveImageUrl(val, text);
      };

      const globalImageUrl = parsed?.midia?.url || parsed?.midia?.link || undefined;

      const newContents: GeneratedContent[] = [];

      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        Object.keys(data).forEach((channelKey, i) => {
          const value = data[channelKey];
          const rawText = extractText(value);
          const imageUrl = extractImage(value, rawText);
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
            imageUrl: imageUrl || globalImageUrl,
            createdAt: new Date(),
            status: "pending" as const,
            useGeneratedMedia: true,
          });
        });
      } else {
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item: any, i: number) => {
          const rawText = extractText(item);
          const imageUrl = extractImage(item, rawText);
          const cleanText = removeImagePromptTag(rawText);
          const chan = ((typeof item === "object" && item !== null) ? (item.canal || item.channel) : null) || channelLabels[i] || channelLabels[0];
          newContents.push({
            id: `${Date.now()}-${i}`,
            canal: chan,
            channelId: getChannelId(chan),
            title: extractTitle(cleanText),
            summary: extractSummary(cleanText),
            fullText: cleanText,
            imageUrl: imageUrl || globalImageUrl,
            createdAt: new Date(),
            status: "pending" as const,
            useGeneratedMedia: true,
          });
        });
      }

      if (newContents.length === 0) {
        toast.error("O webhook não retornou nenhum conteúdo.");
        return;
      }

      setContents(newContents);
      setTokensUsed(prev => prev + 1);
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
    if (!selectedBrand) {
      toast.error("⚠️ Selecione uma marca primeiro! Vá em Brand DNA para cadastrar seu DNA.");
      return;
    }
    if (tokensUsed >= TOTAL_TOKENS) {
      toast.error("🪙 Seus tokens acabaram! Contrate mais tokens para continuar gerando.");
      setShowTokenDialog(true);
      return;
    }
    if (!prompt.trim()) return;
    handleGenerate();
    setPrompt("");
    setTemaVisual("");
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

  const handlePost = async (content: GeneratedContent) => {
    if (publishingId) return;
    setPublishingId(content.id);

    try {
      const media = resolveMedia(content);
      // Determine plataforma
      const canalLower = (content.canal || "").toLowerCase();
      let plataforma = canalLower;
      // If publishing all and both instagram+facebook are present, use "ambos"
      const allCanals = contents.map(c => c.canal.toLowerCase());
      if (allCanals.includes("instagram") && allCanals.includes("facebook") && (canalLower === "instagram" || canalLower === "facebook")) {
        plataforma = "ambos";
      }

      const payload = {
        midia: {
          url: media.url,
          tipo: media.tipo,
        },
        texto: content.fullText || "",
        canal: content.canal || "",
        plataforma,
        agendar: false,
      };
      console.log("Publicando no n8n:", payload);

      const res = await fetch(WEBHOOK_PUBLICAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await supabase.from("conteudos").insert({
        user_id: user?.email || "",
        marca_id: selectedBrand?.id || null,
        canal: content.canal,
        channel_id: content.channelId,
        titulo: content.title,
        resumo: content.summary,
        texto_completo: content.fullText,
        imagem_url: media.url || null,
        status: "publicado",
        data_publicada: new Date().toISOString(),
        marca_nome: selectedBrand?.nome_da_marca || "",
        tom_de_voz: selectedBrand?.tom_de_voz?.join(", ") || "Padrão",
      });

      const historyItem: HistoryItem = {
        id: content.id,
        title: content.title,
        status: "publicado",
        date: format(new Date(), "dd/MM/yyyy HH:mm"),
        channel: content.canal,
        channelId: content.channelId,
        image: media.url || "",
        caption: content.summary,
        fullText: content.fullText,
        usedBrand: selectedBrand?.nome_da_marca || "",
        usedVoice: selectedBrand?.tom_de_voz?.join(", ") || "Padrão",
      };
      setHistory(prev => [historyItem, ...prev]);
      setContents(prev => prev.filter(c => c.id !== content.id));
      toast.success(`Publicado em ${content.canal}! ✅`);
    } catch (err: any) {
      console.error("Erro ao publicar:", err);
      toast.error(`Erro ao publicar: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handlePostAll = async () => {
    if (publishingId) return;
    for (const content of contents) {
      await handlePost(content);
    }
    setViewingContent(null);
  };

  const handleSchedule = async (id: string, date: Date) => {
    const content = contents.find(c => c.id === id);
    if (!content) return;

    try {
      const media = resolveMedia(content);
      await supabase.from("conteudos").insert({
        user_id: user?.email || "",
        marca_id: selectedBrand?.id || null,
        canal: content.canal,
        channel_id: content.channelId,
        titulo: content.title,
        resumo: content.summary,
        texto_completo: content.fullText,
        imagem_url: media.url || null,
        status: "agendado",
        data_agendada: date.toISOString(),
        marca_nome: selectedBrand?.nome_da_marca || "",
        tom_de_voz: selectedBrand?.tom_de_voz?.join(", ") || "Padrão",
      });

      const historyItem: HistoryItem = {
        id: content.id,
        title: content.title,
        status: "agendado",
        date: format(new Date(), "dd/MM/yyyy HH:mm"),
        channel: content.canal,
        channelId: content.channelId,
        image: media.url || "",
        caption: content.summary,
        fullText: content.fullText,
        usedBrand: selectedBrand?.nome_da_marca || "",
        usedVoice: selectedBrand?.tom_de_voz?.join(", ") || "Padrão",
        scheduledDate: format(date, "dd/MM/yyyy 'às' HH:mm"),
      };
      setHistory(prev => [historyItem, ...prev]);
      setContents(prev => prev.filter(c => c.id !== id));
      setViewingContent(prev => prev && prev.id === id ? null : prev);
      toast.success(`Agendado para ${format(date, "dd/MM/yyyy 'às' HH:mm")} 📅`);
    } catch (err: any) {
      console.error("Erro ao agendar:", err);
      toast.error(`Erro ao agendar: ${err.message}`);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!prompt.trim()) return [];
    return searchSuggestions.filter(s => s.toLowerCase().includes(prompt.toLowerCase())).slice(0, 5);
  }, [prompt]);

  const filteredHistory = channelFilter ? history.filter(h => h.channel === channelFilter || getChannelId(h.channel) === channelFilter) : history;
  const filteredContents = channelFilter ? contents.filter(c => c.channelId === channelFilter) : contents;

  const tabs = ["criacao", "aprovacao", "historico", "calendario"] as const;
  const tabLabels = { criacao: "Criação", aprovacao: "Aprovação", historico: "Histórico", calendario: "Calendário" } as const;

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground">
            <Sparkles className="inline mr-2 text-primary" size={28} />
            Fábrica de Conteúdo
          </motion.h1>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTokenDialog(true)}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-card hover:shadow-hover transition-all"
          >
            <Coins size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">{TOTAL_TOKENS - tokensUsed}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">tokens</span>
          </motion.button>
        </div>

        {/* Token Dialog */}
        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins size={20} className="text-primary" />
                Seus Tokens
              </DialogTitle>
              <DialogDescription>Cada geração de conteúdo consome 1 token</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilizados</span>
                <span className="font-bold text-foreground">{tokensUsed} / {TOTAL_TOKENS}</span>
              </div>
              <Progress value={(tokensUsed / TOTAL_TOKENS) * 100} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Restantes</span>
                <span className="font-bold text-primary">{TOTAL_TOKENS - tokensUsed}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowTokenDialog(false);
                  // Trigger the floating chat
                  const chatBtn = document.querySelector('[title="Fale com nosso concierge"]') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
                className="w-full py-3 gradient-peach text-primary-foreground rounded-2xl font-semibold text-sm mt-2"
              >
                🤝 Contratar Mais Tokens
              </motion.button>
            </div>
          </DialogContent>
        </Dialog>

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
                <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground focus-glow min-w-[200px]">
                  <option value="">Selecionar marca (DNA) *</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.nome_da_marca || "Sem nome"}</option>)}
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

              {/* Tema Visual field */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tema Visual (opcional)</label>
                <input
                  value={temaVisual}
                  onChange={(e) => setTemaVisual(e.target.value)}
                  placeholder="Ex: café, manhã, relaxamento"
                  disabled={!selectedBrandId}
                  className="w-full bg-muted rounded-full px-5 py-2.5 text-sm text-foreground focus-glow disabled:opacity-50"
                />
                <p className="text-[10px] text-muted-foreground mt-1 ml-2">Palavras-chave visuais que guiam a geração da imagem (3-5 palavras)</p>
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input value={prompt} onChange={(e) => { setPrompt(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => prompt.trim() && setShowSuggestions(true)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendPrompt(); }}
                      placeholder={selectedBrand ? `Descreva o conteúdo para ${selectedBrand.nome_da_marca}...` : "Selecione uma marca primeiro..."}
                      disabled={!selectedBrandId}
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
                    onClick={handleSendPrompt} disabled={!selectedBrandId || isGenerating}
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
                    disabled={!!publishingId}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-peach text-primary-foreground text-xs font-semibold shadow-card disabled:opacity-50">
                    {publishingId ? <><Loader2 size={15} className="animate-spin" /> Publicando...</> : <><CheckCheck size={15} /> Publicar Todos ({contents.length})</>}
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
                    const media = resolveMedia(content);
                    const displayMediaUrl = content.useGeneratedMedia ? content.imageUrl : content.customMediaUrl;
                    const isVideoMedia = media.tipo === "video";
                    return (
                      <motion.div
                        key={content.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        className="bento-card p-5"
                      >
                        {/* Media controls — top-left, discrete */}
                        <MediaControls
                          content={content}
                          onToggle={() => toggleUseGeneratedMedia(content.id)}
                          onUpload={(file) => handleMediaUpload(content.id, file)}
                          uploading={uploadingId === content.id}
                        />

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

                        {/* Media preview */}
                        {displayMediaUrl && (
                          <div className="mb-3 rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: content.channelId === "blog" ? "16/9" : "1/1", maxHeight: "200px" }}>
                            {isVideoMedia && !content.useGeneratedMedia ? (
                              <video src={displayMediaUrl} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={displayMediaUrl} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}

                        {/* Channel-specific text preview */}
                        {content.channelId === "blog" || content.channelId === "email" ? (
                          <>
                            <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2">{content.title}</h3>
                            <div
                              className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-4 [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mb-1"
                              dangerouslySetInnerHTML={{ __html: content.fullText }}
                            />
                          </>
                        ) : (
                          <>
                            <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2">{content.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                              {cleanDisplayText(content.fullText)}
                            </p>
                          </>
                        )}

                        {/* Ver Completo */}
                        <button onClick={() => setViewingContent(content)}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-3">
                          <Eye size={12} /> Ver Completo
                        </button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handlePost(content)}
                            disabled={!!publishingId}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full gradient-peach text-primary-foreground text-xs font-semibold shadow-card disabled:opacity-50">
                            {publishingId === content.id ? <><Loader2 size={13} className="animate-spin" /> Publicando...</> : <><Send size={13} /> Publicar</>}
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
                      {h.status === "agendado" ? <CalendarIcon size={20} className="text-primary" /> : <CheckCircle size={20} className="text-accent-foreground" />}
                      <div className="text-left">
                        <span className="font-medium text-foreground block">{h.title}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">{h.channel} · {h.date}</span>
                          {h.status === "agendado" && h.scheduledDate && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                              📅 {h.scheduledDate}
                            </span>
                          )}
                          {h.status === "publicado" && (
                            <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                              ✅ Publicado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expandedHistory === idx ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedHistory === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                        <div className="bg-muted rounded-2xl p-4 space-y-3">
                          {h.image && (
                            <div className="rounded-xl overflow-hidden bg-card" style={{ maxHeight: "200px" }}>
                              {h.image.toLowerCase().endsWith(".mp4") ? (
                                <video src={h.image} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={h.image} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Legenda</label>
                            {h.channelId === "blog" || h.channelId === "email" ? (
                              <div className="text-sm text-foreground mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: h.fullText }} />
                            ) : (
                              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{cleanDisplayText(h.fullText || h.caption)}</p>
                            )}
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

        {activeTab === "calendario" && (
          <FabricaCalendario />
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
              <button onClick={() => setViewingContent(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <X size={16} className="text-foreground" />
              </button>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  {(() => { const Icon = getChannelIcon(viewingContent.channelId); return <Icon size={16} className="text-primary" />; })()}
                  <span className="text-sm font-semibold text-primary">{viewingContent.canal}</span>
                  <span className="text-xs text-muted-foreground">· {format(viewingContent.createdAt, "dd/MM/yyyy HH:mm")}</span>
                </div>

                {viewingContent.status === "scheduled" && viewingContent.scheduledDate && (
                  <div className="mb-4">
                    <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">
                      📅 Agendado: {format(viewingContent.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                )}

                {/* Media controls in modal */}
                <div className="mb-4">
                  <MediaControls
                    content={viewingContent}
                    onToggle={() => toggleUseGeneratedMedia(viewingContent.id)}
                    onUpload={(file) => handleMediaUpload(viewingContent.id, file)}
                    uploading={uploadingId === viewingContent.id}
                  />
                </div>

                {/* ======= BLOG LAYOUT ======= */}
                {viewingContent.channelId === "blog" && (
                  <div className="space-y-4">
                    <ShimmerImagePlaceholder aspectRatio="16/9" imageUrl={viewingContent.useGeneratedMedia ? viewingContent.imageUrl : viewingContent.customMediaUrl} isVideo={!viewingContent.useGeneratedMedia && viewingContent.customMediaType === "video"} />
                    <div
                      className="prose prose-sm max-w-none text-foreground [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-primary [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: viewingContent.fullText }}
                    />
                  </div>
                )}

                {/* ======= SOCIAL LAYOUT ======= */}
                {(viewingContent.channelId === "instagram" || viewingContent.channelId === "tiktok" || viewingContent.channelId === "facebook") && (
                  <div className="space-y-4">
                    <div className="max-w-sm mx-auto">
                      <ShimmerImagePlaceholder aspectRatio="1/1" imageUrl={viewingContent.useGeneratedMedia ? viewingContent.imageUrl : viewingContent.customMediaUrl} isVideo={!viewingContent.useGeneratedMedia && viewingContent.customMediaType === "video"} />
                    </div>
                    <div className="bg-muted rounded-2xl p-4">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {cleanDisplayText(viewingContent.fullText)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ======= EMAIL LAYOUT ======= */}
                {viewingContent.channelId === "email" && (
                  <div className="space-y-4">
                    <div className="border border-border rounded-2xl overflow-hidden bg-card">
                      <div className="bg-muted px-5 py-3 border-b border-border flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Assunto:</span>
                        <span className="text-sm font-bold text-foreground">{viewingContent.title}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <ShimmerImagePlaceholder aspectRatio="16/9" imageUrl={viewingContent.useGeneratedMedia ? viewingContent.imageUrl : viewingContent.customMediaUrl} isVideo={!viewingContent.useGeneratedMedia && viewingContent.customMediaType === "video"} />
                        <div
                          className="text-sm text-foreground leading-relaxed [&_h1]:text-primary [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_p]:mb-3 [&_b]:font-bold [&_strong]:font-bold"
                          dangerouslySetInnerHTML={{ __html: viewingContent.fullText }}
                        />
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
                  onClick={async () => { await handlePost(viewingContent); setViewingContent(null); }}
                  disabled={!!publishingId}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full gradient-peach text-primary-foreground font-semibold text-sm shadow-card disabled:opacity-50">
                  {publishingId === viewingContent.id ? <><Loader2 size={15} className="animate-spin" /> Publicando...</> : <><Send size={15} /> Publicar</>}
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

/* ============ MEDIA CONTROLS (toggle, upload, download) ============ */
function MediaControls({
  content,
  onToggle,
  onUpload,
  uploading,
}: {
  content: GeneratedContent;
  onToggle: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMediaUrl = content.useGeneratedMedia ? content.imageUrl : content.customMediaUrl;

  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        title={content.useGeneratedMedia ? "Usando mídia gerada pela IA" : "Usando mídia personalizada"}
      >
        {content.useGeneratedMedia ? (
          <ToggleRight size={16} className="text-primary" />
        ) : (
          <ToggleLeft size={16} className="text-muted-foreground" />
        )}
        <span>{content.useGeneratedMedia ? "Mídia IA" : "Mídia custom"}</span>
      </button>

      {/* Upload button — visible when toggle is OFF */}
      {!content.useGeneratedMedia && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.mp4"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            <span>{uploading ? "Enviando..." : "Upload"}</span>
          </button>
        </>
      )}

      {/* Download button */}
      {currentMediaUrl && (
        <a
          href={currentMediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={12} />
          <span>Download</span>
        </a>
      )}
    </div>
  );
}

/* ============ SHIMMER IMAGE PLACEHOLDER ============ */
function ShimmerImagePlaceholder({ aspectRatio, imageUrl, isVideo }: { aspectRatio: string; imageUrl?: string; isVideo?: boolean }) {
  if (imageUrl) {
    if (isVideo) {
      return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio }}>
          <video src={imageUrl} controls className="w-full h-full object-cover" />
        </div>
      );
    }
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

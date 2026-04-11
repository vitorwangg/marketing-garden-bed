import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, MessageCircle, Target, Ban, Upload, Pencil, ChevronLeft, Plus, Save, Check, X, Globe, ShoppingCart, FileText, Tag, Key, Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const voiceOptions = ["Criativo", "Luxo", "Amigável", "Técnico", "Inspirador", "Direto", "Descontraído"];

const audienceFields = [
  { id: "age", label: "Faixa Etária", options: ["18-24", "25-34", "35-44", "45-54", "55+"] },
  { id: "gender", label: "Gênero", options: ["Masculino", "Feminino", "Todos"] },
];

const logoSlots = [
  { key: "Principal", dbCol: "logo_principal_url" },
  { key: "Monocromática", dbCol: "logo_branca_url" },
  { key: "Ícone", dbCol: "logo_preta_url" },
] as const;

const modeloVendaOptions = ["B2B", "B2C", "Ambos"];
const idiomaOptions = ["PT-BR", "EN", "DE", "FR"];

interface MarcaRow {
  id: string;
  nome_da_marca: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  cor_terciaria: string | null;
  logo_principal_url: string | null;
  logo_branca_url: string | null;
  logo_preta_url: string | null;
  pitch_bio: string | null;
  modelo_venda: string | null;
  idioma_padrao: string | null;
  mercado_nicho: string[] | null;
  publico_faixa_etaria: string[] | null;
  publico_genero: string | null;
  tom_de_voz: string[] | null;
  palavras_proibidas: string[] | null;
  user_id: string | null;
  blog_url: string | null;
  blog_key: string | null;
}

const BrandDNA = () => {
  const { user } = useAuth();

  // DB brands
  const [brands, setBrands] = useState<MarcaRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string[]>([]);
  const [audienceSelections, setAudienceSelections] = useState<Record<string, string[]>>({});
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#FF8A65");
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const [logoFiles, setLogoFiles] = useState<Record<string, File>>({});
  const [pitchBio, setPitchBio] = useState("");
  const [modeloVenda, setModeloVenda] = useState("");
  const [idiomaPadrao, setIdiomaPadrao] = useState("");
  const [mercadoNicho, setMercadoNicho] = useState<string[]>([]);
  const [newNicho, setNewNicho] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // API Keys state
  const [apiKeys, setApiKeys] = useState<{ platform: string; key: string; status: "connected" | "pending" }[]>([]);
  const [newApiPlatform, setNewApiPlatform] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  const apiPlatformOptions = ["Meta", "TikTok", "Google", "OpenAI", "Hugging Face", "Stability AI", "Anthropic", "Replicate"];

  // Blog state
  const [blogUrl, setBlogUrl] = useState("");
  const [blogKey, setBlogKey] = useState("");
  const [showBlogKey, setShowBlogKey] = useState(false);
  const [testingBlog, setTestingBlog] = useState(false);
  const [blogStatus, setBlogStatus] = useState<"idle" | "connected" | "error">("idle");

  const fetchBrands = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("marcas")
      .select("*")
      .eq("user_id", user.email);
    if (error) {
      console.error("Error fetching brands:", error);
    } else {
      setBrands((data as MarcaRow[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openEditor = (brand: MarcaRow) => {
    setEditingBrandId(brand.id);
    setIsAddingNew(false);
    setNewBrandName(brand.nome_da_marca || "");
    setSelectedVoice(brand.tom_de_voz || []);
    setAudienceSelections({
      age: brand.publico_faixa_etaria || [],
      gender: brand.publico_genero ? [brand.publico_genero] : [],
    });
    setForbiddenWords(brand.palavras_proibidas || []);
    setBrandColors([brand.cor_primaria, brand.cor_secundaria, brand.cor_terciaria].filter(Boolean) as string[]);
    setLogoUrls({
      Principal: brand.logo_principal_url || "",
      Monocromática: brand.logo_branca_url || "",
      Ícone: brand.logo_preta_url || "",
    });
    setLogoFiles({});
    setPitchBio(brand.pitch_bio || "");
    setModeloVenda(brand.modelo_venda || "");
    setIdiomaPadrao(brand.idioma_padrao || "");
    setMercadoNicho(brand.mercado_nicho || []);
    setSaved(false);
    setBlogUrl(brand.blog_url || "");
    setBlogKey(brand.blog_key || "");
    setBlogStatus(brand.blog_url && brand.blog_key ? "connected" : "idle");
    setShowBlogKey(false);
  };

  const openNewBrand = () => {
    setEditingBrandId("__new__");
    setIsAddingNew(true);
    setNewBrandName("");
    setSelectedVoice([]);
    setAudienceSelections({});
    setForbiddenWords([]);
    setBrandColors(["#FF8A65", "#CE93D8", "#80CBC4"]);
    setLogoUrls({});
    setLogoFiles({});
    setPitchBio("");
    setModeloVenda("");
    setIdiomaPadrao("");
    setMercadoNicho([]);
    setNewNicho("");
    setSaved(false);
    setBlogUrl("");
    setBlogKey("");
    setBlogStatus("idle");
    setShowBlogKey(false);
  };

  const closeEditor = () => {
    setEditingBrandId(null);
    setIsAddingNew(false);
  };

  const toggleVoice = (v: string) =>
    setSelectedVoice((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const toggleAudience = (fieldId: string, option: string) => {
    setAudienceSelections((prev) => {
      const current = prev[fieldId] || [];
      return { ...prev, [fieldId]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });
  };

  const addForbiddenWord = () => {
    if (newWord.trim() && !forbiddenWords.includes(newWord.trim())) {
      setForbiddenWords([...forbiddenWords, newWord.trim()]);
      setNewWord("");
    }
  };

  const addNicho = () => {
    if (newNicho.trim() && !mercadoNicho.includes(newNicho.trim())) {
      setMercadoNicho([...mercadoNicho, newNicho.trim()]);
      setNewNicho("");
    }
  };

  const addColor = () => {
    if (!brandColors.includes(newColor)) {
      setBrandColors([...brandColors, newColor]);
    }
    setShowColorPicker(false);
  };

  const handleLogoUpload = (slot: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrls((prev) => ({ ...prev, [slot]: url }));
      setLogoFiles((prev) => ({ ...prev, [slot]: file }));
    }
  };

  const uploadLogo = async (brandId: string, slot: string, file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "png";
    const path = `${brandId}/${slot.toLowerCase().replace(/[^a-z]/g, "_")}.${ext}`;

    const { error } = await supabase.storage
      .from("brand_logos")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("brand_logos")
      .getPublicUrl(path);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const brandName = isAddingNew ? newBrandName : (brands.find((b) => b.id === editingBrandId)?.nome_da_marca || newBrandName);
      const brandId = isAddingNew ? crypto.randomUUID() : editingBrandId!;

      // Upload logos
      const uploadedUrls: Record<string, string> = {};
      for (const slot of logoSlots) {
        if (logoFiles[slot.key]) {
          uploadedUrls[slot.dbCol] = await uploadLogo(brandId, slot.key, logoFiles[slot.key]);
        } else if (logoUrls[slot.key] && !logoUrls[slot.key].startsWith("blob:")) {
          uploadedUrls[slot.dbCol] = logoUrls[slot.key];
        }
      }

      const row: Record<string, unknown> = {
        id: brandId,
        user_id: user.email,
        nome_da_marca: brandName,
        tom_de_voz: selectedVoice,
        publico_faixa_etaria: audienceSelections.age || [],
        publico_genero: (audienceSelections.gender || [])[0] || null,
        palavras_proibidas: forbiddenWords,
        cor_primaria: brandColors[0] || null,
        cor_secundaria: brandColors[1] || null,
        cor_terciaria: brandColors[2] || null,
        logo_principal_url: uploadedUrls.logo_principal_url || null,
        logo_branca_url: uploadedUrls.logo_branca_url || null,
        logo_preta_url: uploadedUrls.logo_preta_url || null,
        pitch_bio: pitchBio || null,
        modelo_venda: modeloVenda || null,
        idioma_padrao: idiomaPadrao || null,
        mercado_nicho: mercadoNicho,
        blog_url: blogUrl.trim() || null,
        blog_key: blogKey.trim() || null,
      };

      const { error } = await supabase.from("marcas").upsert(row as any, { onConflict: "id" });

      if (error) throw error;

      setSaved(true);
      toast.success("Marca salva com sucesso! 🎉");
      await fetchBrands();
      setTimeout(() => {
        closeEditor();
        setSaved(false);
      }, 1200);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar marca", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const displayName = isAddingNew ? (newBrandName || "Nova Marca") : (brands.find((b) => b.id === editingBrandId)?.nome_da_marca || "");
  const currentLogoUrl = logoUrls["Principal"];

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-2">
          Brand DNA
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-8">
          {loading ? "Carregando..." : `${brands.length} marca${brands.length !== 1 ? "s" : ""} cadastrada${brands.length !== 1 ? "s" : ""}`}
        </p>

        <AnimatePresence mode="wait">
          {editingBrandId ? (
            <motion.div key="editor" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <button onClick={closeEditor} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ChevronLeft size={16} /> Voltar para marcas
              </button>

              <div className="flex items-center gap-4 mb-8">
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt="Logo" className="w-14 h-14 rounded-2xl object-contain shadow-card bg-card" />
                ) : (
                  <div className="w-14 h-14 gradient-peach rounded-2xl flex items-center justify-center text-xl font-bold text-primary-foreground shadow-card">
                    {(displayName || "N").charAt(0)}
                  </div>
                )}
                {isAddingNew ? (
                  <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nome da marca..." autoFocus
                    className="text-2xl font-bold text-foreground bg-transparent border-b-2 border-border focus:border-primary outline-none pb-1" />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Identidade Visual */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Identidade Visual</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {logoSlots.map((slot) => (
                      <div key={slot.key} onClick={() => fileInputRefs.current[slot.key]?.click()}
                        className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors overflow-hidden">
                        {logoUrls[slot.key] ? (
                          <img src={logoUrls[slot.key]} alt={slot.key} className="w-12 h-12 object-contain" />
                        ) : (
                          <Upload size={20} className="text-muted-foreground" />
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium text-center">{slot.key}</span>
                        <input ref={(el) => { fileInputRefs.current[slot.key] = el; }} type="file" accept="image/*" className="hidden"
                          onChange={(e) => handleLogoUpload(slot.key, e)} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {brandColors.map((c) => (
                      <div key={c} className="relative group">
                        <div className="w-10 h-10 rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-card" style={{ backgroundColor: c }} />
                        <button onClick={() => setBrandColors(brandColors.filter((x) => x !== c))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={8} className="text-destructive-foreground" />
                        </button>
                      </div>
                    ))}
                    {showColorPicker ? (
                      <div className="flex items-center gap-2 bg-muted rounded-xl p-2">
                        <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addColor}
                          className="px-3 py-1.5 gradient-peach text-primary-foreground rounded-lg text-xs font-semibold">Salvar</motion.button>
                        <button onClick={() => setShowColorPicker(false)} className="text-muted-foreground"><X size={14} /></button>
                      </div>
                    ) : (
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowColorPicker(true)}
                        className="w-10 h-10 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/30 transition-colors">
                        <Plus size={16} className="text-muted-foreground" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Tom de Voz */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Tom de Voz</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {voiceOptions.map((v) => (
                      <button key={v} onClick={() => toggleVoice(v)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedVoice.includes(v) ? "gradient-lilac text-secondary-foreground shadow-card" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >{v}</button>
                    ))}
                  </div>
                </motion.div>

                {/* Público-Alvo */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Público-Alvo</h2>
                  </div>
                  <div className="space-y-4">
                    {audienceFields.map((field) => (
                      <div key={field.id}>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">{field.label}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map((opt) => {
                            const selected = (audienceSelections[field.id] || []).includes(opt);
                            return (
                              <button key={opt} onClick={() => toggleAudience(field.id, opt)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected ? "gradient-peach text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                              >{opt}</button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Pitch/Bio */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Pitch / Bio da Marca</h2>
                  </div>
                  <Textarea
                    value={pitchBio}
                    onChange={(e) => setPitchBio(e.target.value)}
                    placeholder="Descreva seu negócio, proposta de valor, diferenciais..."
                    className="min-h-[120px] bg-muted border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus-glow resize-none"
                  />
                </motion.div>

                {/* Modelo de Venda + Idioma */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bento-card p-6">
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <ShoppingCart size={20} className="text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Modelo de Venda</h2>
                      </div>
                      <Select value={modeloVenda} onValueChange={setModeloVenda}>
                        <SelectTrigger className="bg-muted border-border rounded-xl">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {modeloVendaOptions.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Globe size={20} className="text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Idioma Padrão</h2>
                      </div>
                      <Select value={idiomaPadrao} onValueChange={setIdiomaPadrao}>
                        <SelectTrigger className="bg-muted border-border rounded-xl">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {idiomaOptions.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Mercado/Nicho */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Mercado / Nicho</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mercadoNicho.map((t) => (
                      <span key={t} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                        {t}
                        <button onClick={() => setMercadoNicho(mercadoNicho.filter((x) => x !== t))} className="hover:text-foreground">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newNicho} onChange={(e) => setNewNicho(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNicho()}
                      placeholder="Ex: SaaS, E-commerce..." className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground focus-glow" />
                    <button onClick={addNicho} className="gradient-peach text-primary-foreground px-4 rounded-full font-medium text-sm">+</button>
                  </div>
                </motion.div>

                {/* APIs da Marca */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bento-card p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Key size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">APIs da Marca</h2>
                  </div>
                  <div className="space-y-2 mb-4">
                    {apiKeys.map((api, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-foreground flex-1">{api.platform}</span>
                        <span className="text-xs text-muted-foreground font-mono">{api.key.slice(0, 8)}...{api.key.slice(-4)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${api.status === "connected" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                          {api.status === "connected" ? "Conectado" : "Pendente"}
                        </span>
                        <button onClick={() => setApiKeys(apiKeys.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {apiKeys.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma API configurada. Adicione abaixo.</p>}
                  </div>
                  <div className="flex gap-2">
                    <select value={newApiPlatform} onChange={(e) => setNewApiPlatform(e.target.value)}
                      className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground focus-glow border border-border">
                      <option value="">Plataforma...</option>
                      {apiPlatformOptions.filter(p => !apiKeys.find(a => a.platform === p)).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <input value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="Chave de API..."
                      className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow font-mono" />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (newApiPlatform && newApiKey.trim()) {
                          setApiKeys([...apiKeys, { platform: newApiPlatform, key: newApiKey.trim(), status: newApiKey.length > 20 ? "connected" : "pending" }]);
                          setNewApiPlatform("");
                          setNewApiKey("");
                        }
                      }}
                      className="gradient-peach text-primary-foreground px-4 rounded-xl font-medium text-sm flex items-center gap-1">
                      <Plus size={16} /> Salvar
                    </motion.button>
                  </div>
                </motion.div>

                {/* Blog da Marca */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }} className="bento-card p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Blog da Marca</h2>
                    {blogStatus !== "idle" && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${blogStatus === "connected" ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                        {blogStatus === "connected" ? "✅ Conectado" : "❌ Erro"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Conecte o Supabase do blog desta marca para publicar conteúdos diretamente.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">URL do Supabase do Blog</label>
                      <input
                        value={blogUrl}
                        onChange={(e) => { setBlogUrl(e.target.value); setBlogStatus("idle"); }}
                        placeholder="https://seu-projeto.supabase.co"
                        className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Service Role Key</label>
                      <div className="relative">
                        <input
                          type={showBlogKey ? "text" : "password"}
                          value={blogKey}
                          onChange={(e) => { setBlogKey(e.target.value); setBlogStatus("idle"); }}
                          placeholder="cole a service_role key do Supabase do blog"
                          className="w-full bg-muted rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground focus-glow font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBlogKey(!showBlogKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showBlogKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!blogUrl.trim() || !blogKey.trim() || testingBlog}
                      onClick={async () => {
                        setTestingBlog(true);
                        setBlogStatus("idle");
                        try {
                          const res = await supabase.functions.invoke("blog-proxy", {
                            body: { action: "test", marca_id: isAddingNew ? "__skip__" : editingBrandId },
                          });
                          // If brand not saved yet, test directly
                          if (isAddingNew || !editingBrandId) {
                            // Direct test
                            const testRes = await fetch(`${blogUrl.trim().replace(/\/+$/, "")}/rest/v1/posts?limit=1`, {
                              headers: { apikey: blogKey.trim(), Authorization: `Bearer ${blogKey.trim()}` },
                            });
                            setBlogStatus(testRes.ok ? "connected" : "error");
                            toast[testRes.ok ? "success" : "error"](testRes.ok ? "✅ Conexão com o blog bem-sucedida!" : "❌ Erro de conexão com o blog");
                          } else if (res.data?.status === "connected") {
                            setBlogStatus("connected");
                            toast.success("✅ Conexão com o blog bem-sucedida!");
                          } else {
                            setBlogStatus("error");
                            toast.error("❌ Erro de conexão: " + (res.data?.message || "Verifique as credenciais"));
                          }
                        } catch (err: any) {
                          // Fallback: test directly
                          try {
                            const testRes = await fetch(`${blogUrl.trim().replace(/\/+$/, "")}/rest/v1/posts?limit=1`, {
                              headers: { apikey: blogKey.trim(), Authorization: `Bearer ${blogKey.trim()}` },
                            });
                            setBlogStatus(testRes.ok ? "connected" : "error");
                            toast[testRes.ok ? "success" : "error"](testRes.ok ? "✅ Conexão com o blog bem-sucedida!" : "❌ Erro de conexão com o blog");
                          } catch {
                            setBlogStatus("error");
                            toast.error("❌ Erro de conexão com o blog");
                          }
                        } finally {
                          setTestingBlog(false);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-peach text-primary-foreground text-sm font-semibold disabled:opacity-50"
                    >
                      {testingBlog ? <><Loader2 size={14} className="animate-spin" /> Testando...</> : "🔗 Testar Conexão"}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Palavras Proibidas */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Ban size={20} className="text-destructive" />
                    <h2 className="text-lg font-bold text-foreground">Palavras Proibidas</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {forbiddenWords.map((w) => (
                      <span key={w} className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                        {w}
                        <button onClick={() => setForbiddenWords(forbiddenWords.filter((x) => x !== w))} className="hover:text-destructive/70">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newWord} onChange={(e) => setNewWord(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addForbiddenWord()}
                      placeholder="Adicionar palavra..." className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground focus-glow" />
                    <button onClick={addForbiddenWord} className="gradient-peach text-primary-foreground px-4 rounded-full font-medium text-sm">+</button>
                  </div>
                </motion.div>
              </div>

              {/* Save */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all ${saved ? "bg-accent text-accent-foreground" : "gradient-peach text-primary-foreground shadow-card"} disabled:opacity-50`}
                >
                  {saved ? <><Check size={18} /> Salvo!</> : saving ? "Salvando..." : <><Save size={18} /> Salvar Marca</>}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {brands.map((brand, i) => {
                const colors = [brand.cor_primaria, brand.cor_secundaria, brand.cor_terciaria].filter(Boolean) as string[];
                return (
                  <motion.div key={brand.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                    className="bento-card p-6 relative group cursor-pointer" onClick={() => openEditor(brand)}>
                    <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
                      onClick={(e) => { e.stopPropagation(); openEditor(brand); }}>
                      <Pencil size={14} className="text-muted-foreground" />
                    </button>
                    {brand.logo_principal_url ? (
                      <img src={brand.logo_principal_url} alt={brand.nome_da_marca || ""} className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-card bg-card" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4 shadow-card ${i % 3 === 0 ? "gradient-peach" : i % 3 === 1 ? "gradient-lilac" : "gradient-mint"}`}>
                        {(brand.nome_da_marca || "?").charAt(0)}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-foreground mb-3">{brand.nome_da_marca}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(brand.tom_de_voz || []).map((v) => (
                        <span key={v} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{v}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      {colors.map((c) => <div key={c} className="w-5 h-5 rounded-lg shadow-sm" style={{ backgroundColor: c }} />)}
                    </div>
                  </motion.div>
                );
              })}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: brands.length * 0.08 }} whileHover={{ y: -4 }}
                onClick={openNewBrand}
                className="bento-card p-6 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-border min-h-[220px] hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Plus size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Adicionar marca</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrandDNA;

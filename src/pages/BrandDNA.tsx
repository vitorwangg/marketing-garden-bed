import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, MessageCircle, Target, Ban, Upload, Pencil, ChevronLeft, Plus, Save, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const voiceOptions = ["Criativo", "Luxo", "Amigável", "Técnico", "Inspirador", "Direto", "Descontraído"];

const audienceFields = [
  { id: "age", label: "Faixa Etária", options: ["18-24", "25-34", "35-44", "45-54", "55+"] },
  { id: "gender", label: "Gênero", options: ["Masculino", "Feminino", "Todos"] },
  { id: "location", label: "Localização", options: ["Capital", "Interior", "Nacional", "Internacional"] },
  { id: "income", label: "Renda", options: ["Classe A", "Classe B", "Classe C", "Todas"] },
  { id: "interest", label: "Interesse Principal", options: ["Tecnologia", "Moda", "Saúde", "Educação", "Finanças", "Marketing"] },
];

const brandDataMock: Record<string, {
  voices: string[];
  audience: Record<string, string[]>;
  forbiddenWords: string[];
  colors: string[];
  logos: Record<string, string>;
}> = {
  "GT Flow": { voices: ["Criativo", "Amigável"], audience: { age: ["25-34", "35-44"], gender: ["Todos"], location: ["Nacional"], income: ["Classe A", "Classe B"], interest: ["Marketing", "Tecnologia"] }, forbiddenWords: ["barato", "grátis", "promoção"], colors: ["#FF8A65", "#CE93D8", "#80CBC4"], logos: {} },
  "NovaBrand": { voices: ["Luxo", "Inspirador"], audience: { age: ["30-44"], gender: ["Feminino"], location: ["Capital"], income: ["Classe A"], interest: ["Moda"] }, forbiddenWords: ["desconto", "popular"], colors: ["#FFD54F", "#90CAF9"], logos: {} },
  "Stellar Co": { voices: ["Técnico", "Direto"], audience: { age: ["25-34"], gender: ["Masculino"], location: ["Internacional"], income: ["Classe A"], interest: ["Tecnologia"] }, forbiddenWords: ["fácil", "simples"], colors: ["#80CBC4", "#90CAF9", "#CE93D8"], logos: {} },
  "Zenith Labs": { voices: ["Descontraído", "Criativo"], audience: { age: ["22-35"], gender: ["Todos"], location: ["Nacional"], income: ["Classe B"], interest: ["Tecnologia"] }, forbiddenWords: ["tradicional", "convencional"], colors: ["#FF8A65", "#FFD54F"], logos: {} },
  "Vitor Studio": { voices: ["Criativo", "Direto"], audience: { age: ["20-35"], gender: ["Todos"], location: ["Capital"], income: ["Classe C"], interest: ["Marketing"] }, forbiddenWords: ["caro"], colors: ["#FF8A65", "#80CBC4"], logos: {} },
};

const logoSlots = ["Principal", "Monocromática", "Ícone"] as const;

const BrandDNA = () => {
  const { user } = useAuth();
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string[]>([]);
  const [audienceSelections, setAudienceSelections] = useState<Record<string, string[]>>({});
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#FF8A65");
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // Persist uploaded logos across brand navigation (session only)
  const [brandLogos, setBrandLogos] = useState<Record<string, string>>({});

  const hasBrands = user?.brands && user.brands.length > 0;

  const openEditor = (brand: string) => {
    const data = brandDataMock[brand] || { voices: [], audience: {}, forbiddenWords: [], colors: [], logos: {} };
    setSelectedVoice(data.voices);
    setAudienceSelections(data.audience);
    setForbiddenWords(data.forbiddenWords);
    setBrandColors(data.colors);
    setLogos(data.logos || {});
    setIsAddingNew(false);
    setEditingBrand(brand);
    setSaved(false);
  };

  const openNewBrand = () => {
    setSelectedVoice([]);
    setAudienceSelections({});
    setForbiddenWords([]);
    setBrandColors(["#FF8A65", "#CE93D8", "#80CBC4"]);
    setLogos({});
    setNewBrandName("");
    setIsAddingNew(true);
    setEditingBrand("__new__");
    setSaved(false);
  };

  const toggleVoice = (v: string) =>
    setSelectedVoice((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const toggleAudience = (fieldId: string, option: string) => {
    setAudienceSelections(prev => {
      const current = prev[fieldId] || [];
      return { ...prev, [fieldId]: current.includes(option) ? current.filter(o => o !== option) : [...current, option] };
    });
  };

  const addForbiddenWord = () => {
    if (newWord.trim() && !forbiddenWords.includes(newWord.trim())) {
      setForbiddenWords([...forbiddenWords, newWord.trim()]);
      setNewWord("");
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
      setLogos(prev => ({ ...prev, [slot]: url }));
    }
  };

  const handleSave = () => {
    setSaved(true);
    const brandName = isAddingNew ? newBrandName : editingBrand;
    // Store the "Principal" logo for brand card display
    if (brandName && logos["Principal"]) {
      setBrandLogos(prev => ({ ...prev, [brandName]: logos["Principal"] }));
    }
    toast.success("Marca salva com sucesso! 🎉", {
      description: "Suas configurações de marca foram atualizadas.",
    });
    setTimeout(() => {
      setEditingBrand(null);
      setIsAddingNew(false);
      setSaved(false);
    }, 1500);
  };

  const getBrandData = (brand: string) => brandDataMock[brand] || { voices: [], audience: {}, forbiddenWords: [], colors: [], logos: {} };
  const displayName = isAddingNew ? (newBrandName || "Nova Marca") : editingBrand;

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-2">
          Brand DNA
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-8">
          {hasBrands ? `${user.brands.length} marca${user.brands.length !== 1 ? "s" : ""} cadastrada${user.brands.length !== 1 ? "s" : ""}` : "Nenhuma marca cadastrada ainda"}
        </p>

        <AnimatePresence mode="wait">
          {editingBrand ? (
            <motion.div key="editor" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <button onClick={() => { setEditingBrand(null); setIsAddingNew(false); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ChevronLeft size={16} /> Voltar para marcas
              </button>

              <div className="flex items-center gap-4 mb-8">
                {logos["Principal"] ? (
                  <img src={logos["Principal"]} alt="Logo" className="w-14 h-14 rounded-2xl object-contain shadow-card bg-card" />
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
                {/* Identity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Identidade Visual</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {logoSlots.map((slot) => (
                      <div key={slot} onClick={() => fileInputRefs.current[slot]?.click()}
                        className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors overflow-hidden">
                        {logos[slot] ? (
                          <img src={logos[slot]} alt={slot} className="w-12 h-12 object-contain" />
                        ) : (
                          <Upload size={20} className="text-muted-foreground" />
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium text-center">{slot}</span>
                        <input ref={el => { fileInputRefs.current[slot] = el; }} type="file" accept="image/*" className="hidden"
                          onChange={(e) => handleLogoUpload(slot, e)} />
                      </div>
                    ))}
                  </div>
                  {/* Colors with picker */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {brandColors.map((c) => (
                      <div key={c} className="relative group">
                        <div className="w-10 h-10 rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-card" style={{ backgroundColor: c }} />
                        <button onClick={() => setBrandColors(brandColors.filter(x => x !== c))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={8} className="text-destructive-foreground" />
                        </button>
                      </div>
                    ))}
                    {showColorPicker ? (
                      <div className="flex items-center gap-2 bg-muted rounded-xl p-2">
                        <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
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

                {/* Voice */}
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

                {/* Audience - Structured */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Público-Alvo</h2>
                  </div>
                  <div className="space-y-4">
                    {audienceFields.map(field => (
                      <div key={field.id}>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">{field.label}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map(opt => {
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

                {/* Forbidden Words */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bento-card p-6">
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

              {/* Save Button */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className={`px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all ${saved ? "bg-accent text-accent-foreground" : "gradient-peach text-primary-foreground shadow-card"}`}
                >
                  {saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Marca</>}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hasBrands && user.brands.map((brand, i) => {
                const data = getBrandData(brand);
                const logoUrl = brandLogos[brand];
                return (
                  <motion.div key={brand} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                    className="bento-card p-6 relative group cursor-pointer" onClick={() => openEditor(brand)}>
                    <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
                      onClick={(e) => { e.stopPropagation(); openEditor(brand); }}>
                      <Pencil size={14} className="text-muted-foreground" />
                    </button>
                    {logoUrl ? (
                      <img src={logoUrl} alt={brand} className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-card bg-card" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4 shadow-card ${i % 3 === 0 ? 'gradient-peach' : i % 3 === 1 ? 'gradient-lilac' : 'gradient-mint'}`}>
                        {brand.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-foreground mb-3">{brand}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {data.voices.map((v) => (
                        <span key={v} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{v}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      {data.colors.map((c) => <div key={c} className="w-5 h-5 rounded-lg shadow-sm" style={{ backgroundColor: c }} />)}
                    </div>
                  </motion.div>
                );
              })}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (user?.brands.length || 0) * 0.08 }} whileHover={{ y: -4 }}
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

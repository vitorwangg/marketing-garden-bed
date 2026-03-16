import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Phone, MapPin, UserCheck, X, Search, LayoutGrid, List, ExternalLink, Bot, Construction, MessageSquare, Hash, Globe, Instagram, Shield, Calendar, Mail } from "lucide-react";

type LeadStatus = "no_robo" | "venda" | "humano";
type CaptureChannel = "whatsapp_bot" | "instagram_dm" | "site" | "indicacao" | "google_ads";
type MainTab = "contatos" | "fluxo_bot";

interface Lead {
  id: number;
  name: string;
  company: string;
  whatsapp: string;
  city: string;
  status: LeadStatus;
  date: string;
  captureChannel: CaptureChannel;
  email: string;
  fiel?: string;
  interest: string;
  leadScore: number;
  lastContact: string;
  transcript: { sender: string; text: string }[];
}

const captureLabels: Record<CaptureChannel, { label: string; icon: any }> = {
  whatsapp_bot: { label: "WhatsApp Bot", icon: MessageSquare },
  instagram_dm: { label: "Instagram DM", icon: Instagram },
  site: { label: "Site", icon: Globe },
  indicacao: { label: "Indicação", icon: Users },
  google_ads: { label: "Google Ads", icon: BarChart3 },
};

import { BarChart3 } from "lucide-react";

const leads: Lead[] = [
  { id: 1, name: "Carlos Mendes", company: "TechSolutions", whatsapp: "+55 11 99999-1234", city: "São Paulo", status: "no_robo", date: "09/03 14:32", captureChannel: "whatsapp_bot", email: "carlos@techsolutions.com", fiel: "23.456.789/0001-00", interest: "Plano Enterprise", leadScore: 85, lastContact: "09/03 14:32",
    transcript: [
      { sender: "AI", text: "Olá Carlos! Vi que você se interessou pelo nosso serviço. Posso ajudar?" },
      { sender: "Lead", text: "Sim! Quanto custa o plano Enterprise?" },
      { sender: "AI", text: "Ótima escolha! O Enterprise oferece acesso total por R$ 15.000/mês. Quer agendar uma demo?" },
    ]},
  { id: 2, name: "Ana Beatriz", company: "Moda Plus", whatsapp: "+55 21 98888-5678", city: "Rio de Janeiro", status: "venda", date: "09/03 13:15", captureChannel: "instagram_dm", email: "ana@modaplus.com.br", interest: "Fábrica de Conteúdo", leadScore: 92, lastContact: "09/03 13:15",
    transcript: [
      { sender: "AI", text: "Oi Ana! Como posso ajudar hoje?" },
      { sender: "Lead", text: "Quero fechar o plano Pro!" },
    ]},
  { id: 3, name: "Roberto Lima", company: "DevHouse", whatsapp: "+55 31 97777-9012", city: "Belo Horizonte", status: "humano", date: "09/03 12:40", captureChannel: "site", email: "roberto@devhouse.io", fiel: "12.345.678/0001-90", interest: "Integração API", leadScore: 78, lastContact: "09/03 12:40",
    transcript: [
      { sender: "AI", text: "Bom dia Roberto! Em que posso ajudar?" },
      { sender: "Lead", text: "Preciso falar com um humano sobre integração personalizada." },
      { sender: "Humano", text: "Olá Roberto, aqui é o João. Vou te ajudar!" },
    ]},
  { id: 4, name: "Juliana Costa", company: "Greenfoods", whatsapp: "+55 41 96666-3456", city: "Curitiba", status: "no_robo", date: "09/03 11:50", captureChannel: "google_ads", email: "juliana@greenfoods.com", interest: "Ads Cockpit", leadScore: 70, lastContact: "09/03 11:50",
    transcript: [
      { sender: "AI", text: "Olá Juliana! Bem-vinda ao GT Flow." },
      { sender: "Lead", text: "Me explique melhor o Concierge SDR." },
    ]},
  { id: 5, name: "Fernando Silva", company: "AutoMax", whatsapp: "+55 51 95555-7890", city: "Porto Alegre", status: "venda", date: "09/03 10:30", captureChannel: "whatsapp_bot", email: "fernando@automax.com", fiel: "34.567.890/0001-12", interest: "Plano Pro", leadScore: 95, lastContact: "09/03 10:30",
    transcript: [
      { sender: "AI", text: "Oi Fernando! Parabéns pela decisão." },
      { sender: "Lead", text: "Fechado! Vamos começar." },
    ]},
  { id: 6, name: "Marina Souza", company: "DigitalPro", whatsapp: "+55 11 94444-1234", city: "São Paulo", status: "no_robo", date: "09/03 09:20", captureChannel: "instagram_dm", email: "marina@digitalpro.com", interest: "Brand DNA", leadScore: 68, lastContact: "09/03 09:20",
    transcript: [
      { sender: "AI", text: "Olá Marina! Como posso ajudar?" },
      { sender: "Lead", text: "Gostaria de saber sobre automações." },
    ]},
  { id: 7, name: "Thiago Ramos", company: "InnoTech", whatsapp: "+55 21 93333-5678", city: "Rio de Janeiro", status: "humano", date: "08/03 18:45", captureChannel: "site", email: "thiago@innotech.io", interest: "Suporte técnico", leadScore: 60, lastContact: "08/03 18:45",
    transcript: [
      { sender: "AI", text: "Oi Thiago! Em que posso ajudar?" },
      { sender: "Lead", text: "Preciso de suporte técnico." },
    ]},
  { id: 8, name: "Bianca Martins", company: "FashionUp", whatsapp: "+55 41 92222-9012", city: "Curitiba", status: "venda", date: "08/03 16:30", captureChannel: "indicacao", email: "bianca@fashionup.com", interest: "Plano Enterprise", leadScore: 88, lastContact: "08/03 16:30",
    transcript: [
      { sender: "AI", text: "Oi Bianca!" },
      { sender: "Lead", text: "Quero começar agora!" },
    ]},
  { id: 9, name: "Lucas Almeida", company: "TechVision", whatsapp: "+55 31 91111-3456", city: "Belo Horizonte", status: "no_robo", date: "08/03 14:10", captureChannel: "google_ads", email: "lucas@techvision.com", interest: "Fábrica de Conteúdo", leadScore: 72, lastContact: "08/03 14:10",
    transcript: [
      { sender: "AI", text: "Olá Lucas!" },
      { sender: "Lead", text: "Vi o anúncio de vocês." },
    ]},
  { id: 10, name: "Gabriela Lima", company: "CreativeHub", whatsapp: "+55 11 90000-7890", city: "São Paulo", status: "venda", date: "08/03 12:00", captureChannel: "whatsapp_bot", email: "gabriela@creativehub.com", fiel: "45.678.901/0001-23", interest: "Plano Pro", leadScore: 90, lastContact: "08/03 12:00",
    transcript: [
      { sender: "AI", text: "Oi Gabriela!" },
      { sender: "Lead", text: "Fechado no Pro!" },
    ]},
  { id: 11, name: "Rafael Nunes", company: "DataWave", whatsapp: "+55 21 98877-6543", city: "Rio de Janeiro", status: "no_robo", date: "08/03 10:15", captureChannel: "site", email: "rafael@datawave.io", interest: "Jimmy Neutron", leadScore: 75, lastContact: "08/03 10:15",
    transcript: [
      { sender: "AI", text: "Olá Rafael!" },
      { sender: "Lead", text: "Quero saber sobre higienização de dados." },
    ]},
];

const statusMap: Record<LeadStatus, { label: string; classes: string }> = {
  no_robo: { label: "No Robô", classes: "bg-secondary text-secondary-foreground" },
  venda: { label: "Venda", classes: "bg-accent text-accent-foreground" },
  humano: { label: "Humano", classes: "bg-primary/10 text-primary" },
};

const ConciergeSDR = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"cards" | "tabela">("cards");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("contatos");

  const filtered = useMemo(() =>
    leads.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const displayedCards = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-4">
          <Users className="inline mr-2 text-primary" size={28} />
          Concierge SDR
        </motion.h1>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMainTab("contatos")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${mainTab === "contatos" ? "gradient-peach text-primary-foreground shadow-card" : "bg-card text-muted-foreground border border-border"}`}>
            <Users size={16} /> Contatos
          </button>
          <button onClick={() => setMainTab("fluxo_bot")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${mainTab === "fluxo_bot" ? "gradient-peach text-primary-foreground shadow-card" : "bg-card text-muted-foreground border border-border"}`}>
            <Bot size={16} /> Fluxo Bot
          </button>
        </div>

        {mainTab === "fluxo_bot" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bento-card p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <Construction size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Fluxo Bot</h2>
            <p className="text-muted-foreground mb-1">Em construção</p>
            <p className="text-sm text-muted-foreground">Este módulo estará disponível em breve.</p>
          </motion.div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar leads..."
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-2xl text-sm text-foreground focus-glow" />
              </div>
              <div className="flex bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setView("cards")} className={`px-4 py-2.5 text-sm font-medium transition-colors ${view === "cards" ? "gradient-peach text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <LayoutGrid size={16} className="inline mr-1" /> Cards
                </button>
                <button onClick={() => setView("tabela")} className={`px-4 py-2.5 text-sm font-medium transition-colors ${view === "tabela" ? "gradient-peach text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <List size={16} className="inline mr-1" /> Tabela
                </button>
              </div>
            </div>

            {view === "cards" ? (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Últimos leads capturados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedCards.map((lead, i) => (
                    <motion.div key={lead.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }} onClick={() => setSelectedLead(lead)} className="bento-card p-5 cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground ${i % 3 === 0 ? 'gradient-peach' : i % 3 === 1 ? 'gradient-lilac' : 'gradient-mint'}`}>
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-sm">{lead.name}</p>
                          <p className="text-[11px] text-muted-foreground">{lead.company}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusMap[lead.status].classes}`}>
                          {statusMap[lead.status].label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={12} />{lead.city}</span>
                        <span>{lead.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {!showAll && filtered.length > 6 && (
                  <div className="text-center mt-6">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAll(true)}
                      className="px-8 py-3 bg-card border border-border rounded-full text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                      Ver todos ({filtered.length} leads)
                    </motion.button>
                  </div>
                )}
                {showAll && filtered.length > 6 && (
                  <div className="text-center mt-6">
                    <button onClick={() => setShowAll(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Mostrar menos
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bento-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Lead</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Empresa</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">WhatsApp</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Cidade</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Data</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((lead) => (
                        <motion.tr key={lead.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                          onClick={() => setSelectedLead(lead)} className="border-b border-border last:border-0 cursor-pointer transition-colors">
                          <td className="p-4 font-medium text-foreground">{lead.name}</td>
                          <td className="p-4 text-muted-foreground">{lead.company}</td>
                          <td className="p-4 text-muted-foreground flex items-center gap-2"><Phone size={14} />{lead.whatsapp}</td>
                          <td className="p-4 text-muted-foreground"><MapPin size={14} className="inline mr-1" />{lead.city}</td>
                          <td className="p-4 text-muted-foreground">{lead.date}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMap[lead.status].classes}`}>
                              {statusMap[lead.status].label}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Enhanced Drawer */}
        <AnimatePresence>
          {selectedLead && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="fixed inset-0 bg-foreground/20 z-40" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-hover p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">{selectedLead.name}</h2>
                  <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMap[selectedLead.status].classes}`}>
                    {statusMap[selectedLead.status].label}
                  </span>
                  <span className="text-sm text-muted-foreground">{selectedLead.company} · {selectedLead.city}</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2.5">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2.5">
                    <Phone size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedLead.whatsapp}</span>
                  </div>
                </div>

                {/* Key Info Cards */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Canal de Captura</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {(() => { const ch = captureLabels[selectedLead.captureChannel]; const Icon = ch.icon; return <><Icon size={12} className="text-primary" /><span className="text-xs font-medium text-foreground">{ch.label}</span></>; })()}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lead Score</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{selectedLead.leadScore}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Interesse</p>
                    <p className="text-xs font-medium text-foreground mt-1">{selectedLead.interest}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Último Contato</p>
                    <p className="text-xs font-medium text-foreground mt-1">{selectedLead.lastContact}</p>
                  </div>
                </div>

                {/* FIEL */}
                {selectedLead.fiel && (
                  <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2.5 mb-4">
                    <Shield size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">CNPJ / FIEL</p>
                      <p className="text-sm font-medium text-foreground">{selectedLead.fiel}</p>
                    </div>
                  </div>
                )}

                <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 mb-4 px-4 py-3 bg-accent rounded-2xl text-sm font-medium text-accent-foreground hover:shadow-card transition-all">
                  <ExternalLink size={16} /> Abrir WhatsApp
                </a>

                <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-2xl">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Assumir Controle</span>
                  </div>
                  <button className="w-12 h-6 bg-primary/20 rounded-full relative">
                    <div className="w-5 h-5 bg-primary rounded-full absolute left-0.5 top-0.5 transition-all" />
                  </button>
                </div>

                <h3 className="font-semibold text-foreground mb-3">Live Transcript</h3>
                <div className="space-y-3">
                  {selectedLead.transcript.map((t, i) => (
                    <div key={i} className={`flex ${t.sender === "Lead" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                        t.sender === "Lead" ? "bg-muted text-foreground" : t.sender === "AI" ? "gradient-lilac text-secondary-foreground" : "gradient-peach text-primary-foreground"
                      }`}>
                        <span className="text-[10px] font-semibold block mb-1 opacity-70">
                          {t.sender === "AI" ? "🤖 AI" : t.sender === "Humano" ? "👤 Humano" : ""}
                        </span>
                        {t.text}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConciergeSDR;

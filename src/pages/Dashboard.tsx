import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Users, TrendingUp, Sparkles, BarChart3, Dna,
  Zap, ArrowUpRight, Calendar, ChevronRight, UserPlus, Palette
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCountUp } from "@/hooks/useCountUp";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const sparklinePoints = "2,18 6,15 10,16 14,12 18,14 22,10 26,11 30,7 34,9 38,5 42,6 46,3";

const topAds = [
  { name: "Meta - Carrossel Verão", roi: "5.8x", spend: "R$ 2.400" },
  { name: "Google - Search Brand", roi: "4.2x", spend: "R$ 1.800" },
  { name: "TikTok - UGC Produto", roi: "3.9x", spend: "R$ 950" },
];

const recentLeads = [
  { name: "Carlos Mendes", company: "TechSolutions", time: "2min" },
  { name: "Ana Beatriz", company: "Moda Plus", time: "8min" },
  { name: "Roberto Lima", company: "DevHouse", time: "15min" },
  { name: "Juliana Costa", company: "Greenfoods", time: "22min" },
];

const recentPosts = [
  { title: "Carrossel: 5 dicas de produtividade", platform: "Instagram", status: "Publicado" },
  { title: "Blog: Como escalar seu negócio", platform: "Blog", status: "Publicado" },
  { title: "Story: Behind the scenes", platform: "Instagram", status: "Agendado" },
];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
const eventDays = [3, 7, 12, 15, 18, 22, 25, 28];

// DNA Timeline activity feed
const timelineEvents = [
  { icon: Sparkles, label: "Carrossel publicado no Instagram", time: "Há 12min", color: "gradient-peach" },
  { icon: UserPlus, label: "3 novos leads capturados via WhatsApp", time: "Há 45min", color: "gradient-lilac" },
  { icon: BarChart3, label: "Campanha Google Ads otimizada", time: "Há 1h", color: "gradient-mint" },
  { icon: Users, label: "Lead Carlos Mendes convertido", time: "Há 2h", color: "gradient-peach" },
  { icon: Sparkles, label: "Newsletter programada para amanhã", time: "Há 3h", color: "gradient-lilac" },
  { icon: Zap, label: "8 leads higienizados no Neutron", time: "Há 4h", color: "gradient-mint" },
  { icon: BarChart3, label: "Meta Ads: R$ 1.200 investidos hoje", time: "Há 5h", color: "gradient-peach" },
];

const accentColors = [
  { name: "Peach", hsl: "18 100% 72%", hslDark: "350 80% 68%", preview: "#FF8A65" },
  { name: "Lilac", hsl: "270 40% 72%", hslDark: "270 30% 55%", preview: "#B388D9" },
  { name: "Mint", hsl: "155 40% 55%", hslDark: "155 35% 40%", preview: "#5CB89A" },
  { name: "Sky", hsl: "210 80% 65%", hslDark: "210 70% 50%", preview: "#5B9FE8" },
  { name: "Coral", hsl: "350 80% 68%", hslDark: "350 70% 55%", preview: "#E8637A" },
];

const applyAccent = (color: typeof accentColors[0]) => {
  const root = document.documentElement.style;
  root.setProperty("--primary", color.hsl);
  root.setProperty("--ring", color.hsl);
  root.setProperty("--peach", color.hsl);
  root.setProperty("--peach-dark", color.hslDark);
  sessionStorage.setItem("gt-accent-hsl", color.hsl);
  sessionStorage.setItem("gt-accent-hsl-dark", color.hslDark);
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const investido = useCountUp(15430, 1200, "R$ ");
  const leads = useCountUp(342, 1000);
  const roi = useCountUp(42, 800, "", "");
  const [showColors, setShowColors] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(() => {
    const stored = sessionStorage.getItem("gt-accent-hsl");
    const idx = accentColors.findIndex(c => c.hsl === stored);
    return idx >= 0 ? idx : 0;
  });

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 ml-12">
          <div className="w-9 h-9 gradient-peach rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">GT Flow Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Color Picker */}
          <div className="relative">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowColors(!showColors)}
              className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Palette size={16} className="text-primary" />
            </motion.button>
            {showColors && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-11 bg-card border border-border rounded-2xl p-3 shadow-hover z-50 flex gap-2">
                {accentColors.map((color, i) => (
                  <motion.button key={color.name} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setSelectedAccent(i); applyAccent(color); setShowColors(false); }}
                    className={`w-7 h-7 rounded-full shadow-sm transition-all ${selectedAccent === i ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ backgroundColor: color.preview }} title={color.name} />
                ))}
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-card rounded-full pl-1 pr-3 py-1 shadow-card">
            <div className="w-7 h-7 gradient-peach rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* 70/30 Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* LEFT 70% */}
        <motion.div variants={container} initial="hidden" animate="show" className="flex-1 lg:w-[70%] space-y-5">
          {/* DNA Timeline */}
          <motion.div variants={item} className="bento-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Linha do Tempo</h2>
                <p className="text-xs text-muted-foreground">Últimas atualizações do sistema</p>
              </div>
              <div className="w-10 h-10 gradient-peach rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-primary-foreground" />
              </div>
            </div>
            <div className="relative">
              {/* DNA Line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-0">
                {timelineEvents.map((ev, i) => {
                  const Icon = ev.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 py-2.5 relative">
                      <div className={`w-10 h-10 rounded-xl ${ev.color} flex items-center justify-center flex-shrink-0 z-10`}>
                        <Icon size={16} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-foreground">{ev.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ev.time}</p>
                      </div>
                      {/* DNA double helix dot */}
                      {i % 2 === 0 && (
                        <div className="absolute left-[15px] top-[22px] w-3 h-3 rounded-full bg-primary/20 border-2 border-primary z-20" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={item} className="bento-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Total Investido</span>
                <div className="w-8 h-8 gradient-peach rounded-lg flex items-center justify-center">
                  <DollarSign size={16} className="text-primary-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{investido}</p>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground">+8.13%</span>
              </div>
              <svg className="mt-3 w-full h-8" viewBox="0 0 48 20" preserveAspectRatio="none">
                <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={sparklinePoints} />
              </svg>
            </motion.div>

            <motion.div variants={item} className="bento-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Leads Capturados</span>
                <div className="w-8 h-8 gradient-lilac rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-secondary-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{leads}</p>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground">+12.4%</span>
              </div>
              <svg className="mt-3 w-full h-8" viewBox="0 0 48 20" preserveAspectRatio="none">
                <polyline fill="none" stroke="hsl(var(--lilac-dark))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="2,16 8,14 14,15 20,10 26,12 32,8 38,9 44,5" />
              </svg>
            </motion.div>

            <motion.div variants={item} className="bento-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">ROI Médio</span>
                <div className="w-8 h-8 gradient-mint rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-accent-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{roi === "42" ? "4.2" : (parseInt(roi) / 10).toFixed(1)}x</p>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground">+2.1%</span>
              </div>
              <svg className="mt-3 w-full h-8" viewBox="0 0 48 20" preserveAspectRatio="none">
                <polyline fill="none" stroke="hsl(var(--mint-dark))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="2,18 8,12 14,14 20,8 26,10 32,6 38,7 44,3" />
              </svg>
            </motion.div>
          </div>

          {/* Brand DNA */}
          <motion.div variants={item} whileHover={{ scale: 1.005 }} onClick={() => navigate("/brand-dna")} className="bento-card p-5 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-mint rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Dna size={20} className="text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Brand DNA</h2>
                  <p className="text-xs text-muted-foreground">{user?.brands.length} marca{user?.brands.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            {user?.brands && user.brands.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {user.brands.map((brand, i) => (
                  <div key={brand} className="flex-shrink-0 bg-muted/50 rounded-2xl p-3 flex items-center gap-3 min-w-[140px]">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-primary-foreground ${i % 3 === 0 ? 'gradient-peach' : i % 3 === 1 ? 'gradient-lilac' : 'gradient-mint'}`}>
                      {brand.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{brand}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Atalhos */}
          <div className="flex items-center gap-2 pt-2">
            <h2 className="text-lg font-bold text-foreground">Atalhos</h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fábrica */}
            <motion.div variants={item} whileHover={{ scale: 1.01 }} onClick={() => navigate("/fabrica")} className="bento-card p-5 cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-peach rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Fábrica de Conteúdo</h3>
                  <p className="text-[10px] text-muted-foreground">Últimos posts</p>
                </div>
              </div>
              <div className="space-y-2">
                {recentPosts.map((post, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted/40 rounded-xl px-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-lilac-dark' : 'bg-mint-dark'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-[10px] text-muted-foreground">{post.platform}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${post.status === 'Publicado' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Concierge */}
            <motion.div variants={item} whileHover={{ scale: 1.01 }} onClick={() => navigate("/concierge")} className="bento-card p-5 cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-lilac rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={18} className="text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Concierge SDR</h3>
                  <p className="text-[10px] text-muted-foreground">Últimos leads</p>
                </div>
              </div>
              <div className="space-y-2">
                {recentLeads.map((lead, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted/40 rounded-xl px-3 py-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground ${i % 2 === 0 ? 'gradient-peach' : 'gradient-lilac'}`}>
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{lead.name}</p>
                      <p className="text-[10px] text-muted-foreground">{lead.company}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{lead.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ads */}
            <motion.div variants={item} whileHover={{ scale: 1.01 }} onClick={() => navigate("/ads-intel")} className="bento-card p-5 cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-mint rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 size={18} className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ads Cockpit</h3>
                  <p className="text-[10px] text-muted-foreground">Melhor ROI</p>
                </div>
              </div>
              <div className="space-y-2">
                {topAds.map((ad, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted/40 rounded-xl px-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-lilac-dark' : 'bg-mint-dark'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{ad.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ad.spend}</p>
                    </div>
                    <span className="text-xs font-bold text-accent-foreground">{ad.roi}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Jimmy Neutron */}
            <motion.div variants={item} whileHover={{ scale: 1.01 }} onClick={() => navigate("/dim-neutron")} className="bento-card p-5 cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-foreground/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap size={18} className="text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Jimmy Neutron</h3>
                  <p className="text-[10px] text-muted-foreground">Base de dados IA</p>
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl px-3 py-3 flex items-center gap-3">
                <div className="w-8 h-8 gradient-peach rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={14} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Higienização IA</p>
                  <p className="text-[10px] text-muted-foreground">Limpe e enriqueça dados</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT 30% */}
        <motion.div variants={container} initial="hidden" animate="show" className="lg:w-[30%] space-y-5">
          {/* Mini Calendar */}
          <motion.div variants={item} className="bento-card p-5 cursor-pointer" onClick={() => navigate("/calendario")}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary" />
              <h3 className="font-bold text-foreground">{monthNames[currentMonth]} {currentYear}</h3>
              <ChevronRight size={14} className="text-muted-foreground ml-auto" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map((d, i) => (
                <span key={i} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</span>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <span key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const hasEvent = eventDays.includes(day);
                return (
                  <motion.div key={day} whileHover={{ scale: 1.15 }}
                    className={`relative text-xs py-1.5 rounded-lg font-medium transition-all ${isToday ? "gradient-peach text-primary-foreground font-bold shadow-card" : "text-foreground hover:bg-muted"}`}
                  >
                    {day}
                    {hasEvent && !isToday && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Resumo */}
          <motion.div variants={item} className="bento-card p-5">
            <h3 className="font-bold text-foreground mb-3">Resumo do Mês</h3>
            <div className="space-y-3">
              {[
                { label: "Posts publicados", value: 24, pct: "75%", grad: "gradient-peach" },
                { label: "Leads convertidos", value: 18, pct: "60%", grad: "gradient-lilac" },
                { label: "Campanhas ativas", value: 7, pct: "45%", grad: "gradient-mint" },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-bold text-foreground">{s.value}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: s.pct }} transition={{ duration: 1, delay: 0.5 + i * 0.2 }} className={`h-full ${s.grad} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plano */}
          <motion.div variants={item} whileHover={{ scale: 1.01 }} onClick={() => navigate("/planos")} className="bento-card p-5 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Seu plano</p>
                <p className="text-lg font-bold text-foreground capitalize">{user?.plan}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

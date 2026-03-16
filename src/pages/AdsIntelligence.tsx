import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, ChevronDown, ChevronUp, Eye, MousePointer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Platform = "all" | "meta" | "google" | "tiktok" | "mercadolivre";

const platformLabels: Record<Platform, string> = {
  all: "Todos",
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  mercadolivre: "Mercado Livre",
};

interface Campaign {
  name: string;
  platform: Platform;
  spend: number;
  revenue: number;
  leads: number;
  ctr: string;
  cpc: string;
  frequency: string;
}

const campaigns: Campaign[] = [
  { name: "Carrossel Verão", platform: "meta", spend: 4200, revenue: 24360, leads: 234, ctr: "2.1%", cpc: "R$ 0,45", frequency: "1.8" },
  { name: "Remarketing Carrinho", platform: "meta", spend: 3100, revenue: 12400, leads: 180, ctr: "3.4%", cpc: "R$ 0,32", frequency: "2.1" },
  { name: "Search Brand", platform: "google", spend: 1800, revenue: 7560, leads: 95, ctr: "4.2%", cpc: "R$ 0,28", frequency: "1.2" },
  { name: "Display Remarketing", platform: "google", spend: 2200, revenue: 6600, leads: 67, ctr: "1.1%", cpc: "R$ 0,65", frequency: "3.1" },
  { name: "UGC Produto", platform: "tiktok", spend: 950, revenue: 3705, leads: 120, ctr: "5.8%", cpc: "R$ 0,12", frequency: "1.5" },
  { name: "Spark Ads", platform: "tiktok", spend: 1500, revenue: 4500, leads: 88, ctr: "3.2%", cpc: "R$ 0,22", frequency: "2.0" },
  { name: "Product Ads", platform: "mercadolivre", spend: 800, revenue: 3200, leads: 45, ctr: "2.8%", cpc: "R$ 0,38", frequency: "1.0" },
  { name: "Campanha Full", platform: "mercadolivre", spend: 1200, revenue: 4800, leads: 58, ctr: "3.0%", cpc: "R$ 0,42", frequency: "1.3" },
];

const roiChartData = [
  { month: "Jan", meta: 320, google: 280, tiktok: 150, mercadolivre: 180 },
  { month: "Fev", meta: 380, google: 310, tiktok: 220, mercadolivre: 200 },
  { month: "Mar", meta: 480, google: 350, tiktok: 290, mercadolivre: 250 },
  { month: "Abr", meta: 420, google: 380, tiktok: 340, mercadolivre: 220 },
  { month: "Mai", meta: 520, google: 420, tiktok: 380, mercadolivre: 300 },
  { month: "Jun", meta: 580, google: 450, tiktok: 420, mercadolivre: 340 },
];

const AdsIntelligence = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [platform, setPlatform] = useState<Platform>("all");
  const restricted = user?.plan === "starter";

  const filtered = useMemo(() =>
    platform === "all" ? campaigns : campaigns.filter((c) => c.platform === platform)
  , [platform]);

  const totalSpend = filtered.reduce((a, c) => a + c.spend, 0);
  const totalRevenue = filtered.reduce((a, c) => a + c.revenue, 0);
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(0) : "0";
  const totalLeads = filtered.reduce((a, c) => a + c.leads, 0);
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0";

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-6">
          <BarChart3 className="inline mr-2 text-primary" size={28} />
          Ads Cockpit
        </motion.h1>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(platformLabels) as Platform[]).map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${platform === p ? "gradient-peach text-primary-foreground shadow-card" : "bg-card text-muted-foreground border border-border hover:text-foreground"}`}
            >{platformLabels[p]}</button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-peach rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">ROI</span>
            </div>
            <span className="text-3xl font-bold text-foreground">{roi}%</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-mint rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-accent-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">CPL</span>
            </div>
            <span className="text-3xl font-bold text-foreground">R$ {cpl}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-lilac rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-secondary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Investimento</span>
            </div>
            <span className="text-3xl font-bold text-foreground">R$ {totalSpend.toLocaleString("pt-BR")}</span>
          </motion.div>
        </div>

        {/* ROI Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6 mb-6">
          <h2 className="font-bold text-foreground mb-4">ROI por Plataforma</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={roiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
              {(platform === "all" || platform === "meta") && <Line type="monotone" dataKey="meta" stroke="#FF8A65" strokeWidth={2} dot={false} />}
              {(platform === "all" || platform === "google") && <Line type="monotone" dataKey="google" stroke="#5B9FE8" strokeWidth={2} dot={false} />}
              {(platform === "all" || platform === "tiktok") && <Line type="monotone" dataKey="tiktok" stroke="#E8637A" strokeWidth={2} dot={false} />}
              {(platform === "all" || platform === "mercadolivre") && <Line type="monotone" dataKey="mercadolivre" stroke="#5CB89A" strokeWidth={2} dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Campaigns */}
        <div className={`space-y-3 ${restricted ? "relative" : ""}`}>
          {restricted && (
            <div className="absolute inset-0 frosted-overlay z-10 rounded-squircle flex items-center justify-center">
              <div className="text-center">
                <Eye size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-bold text-foreground">Detalhes restritos no plano Starter</p>
                <p className="text-sm text-muted-foreground">Faça upgrade para ver métricas completas</p>
              </div>
            </div>
          )}

          {filtered.map((c, i) => (
            <motion.div key={c.name + c.platform} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-left">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">R$ {c.spend.toLocaleString("pt-BR")} · {c.leads} leads · ROI {((c.revenue - c.spend) / c.spend * 100).toFixed(0)}%</p>
                </div>
                {expanded === i ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
              </button>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted rounded-2xl p-4 text-center">
                      <MousePointer size={16} className="text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="font-bold text-foreground">{c.ctr}</p>
                    </div>
                    <div className="bg-muted rounded-2xl p-4 text-center">
                      <DollarSign size={16} className="text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">CPC</p>
                      <p className="font-bold text-foreground">{c.cpc}</p>
                    </div>
                    <div className="bg-muted rounded-2xl p-4 text-center">
                      <Eye size={16} className="text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Frequência</p>
                      <p className="font-bold text-foreground">{c.frequency}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdsIntelligence;

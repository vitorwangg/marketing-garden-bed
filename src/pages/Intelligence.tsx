import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import TrafficManager from "@/components/TrafficManager";
import AdsOverview from "@/components/AdsOverview";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, BarChart3, Users,
  Mail, Search, TrendingUp, TrendingDown,
  Clock, AlertTriangle, CheckCircle,
  DollarSign, Eye, MousePointer, Target
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type SubTab = "flow" | "ads" | "sdr";
type AdsPlatform = "all" | "meta" | "tiktok" | "google";

const mockCampaigns = [
  { id: "1", name: "Carrossel Verão 2026", platform: "meta" as const, spend: 4200, impressions: 125000, clicks: 2625, conversions: 234, ctr: "2.1%", cpc: "R$ 1,60", roas: "5.8x", status: "active", insight: "ROAS excelente em 5.8x. Recomendação: escalar orçamento em 30% mantendo o mesmo público. O criativo de carrossel está performando 2x acima da média do setor." },
  { id: "2", name: "Remarketing Carrinho", platform: "meta" as const, spend: 3100, impressions: 89000, clicks: 3026, conversions: 180, ctr: "3.4%", cpc: "R$ 1,02", roas: "4.0x", status: "active", insight: "CTR de 3.4% indica boa relevância. Sugestão: testar variações de copy focadas em urgência. Considere adicionar countdown no criativo para aumentar conversões em 15-20%." },
  { id: "3", name: "UGC Produto", platform: "tiktok" as const, spend: 950, impressions: 210000, clicks: 12180, conversions: 120, ctr: "5.8%", cpc: "R$ 0,08", roas: "3.9x", status: "active", insight: "CPC de R$ 0,08 é excepcional. O formato UGC está ressoando muito bem. Escalar investimento em 50% e replicar o formato para outros produtos. Atenção: audiência pode saturar em 7 dias." },
  { id: "4", name: "Spark Ads Brand", platform: "tiktok" as const, spend: 1500, impressions: 180000, clicks: 5760, conversions: 88, ctr: "3.2%", cpc: "R$ 0,26", roas: "3.0x", status: "paused", insight: "ROAS de 3.0x está no limiar de rentabilidade. Recomendação: pausar e reavaliar público-alvo. Testar segmentação por interesse em vez de lookalike. Considere retomar em 15 dias com novo criativo." },
  { id: "5", name: "Search Brand", platform: "google" as const, spend: 1800, impressions: 42000, clicks: 1764, conversions: 95, ctr: "4.2%", cpc: "R$ 1,02", roas: "4.2x", status: "active", insight: "Campanha de marca saudável com CTR 4.2%. Monitorar concorrentes que possam estar comprando sua marca. Adicionar extensões de sitelink para melhorar a experiência e aumentar CTR em 10%." },
  { id: "6", name: "Display Retargeting", platform: "google" as const, spend: 2200, impressions: 320000, clicks: 3520, conversions: 67, ctr: "1.1%", cpc: "R$ 0,63", roas: "3.0x", status: "active", insight: "CTR de 1.1% está dentro da média para display. Recomendação: reduzir frequência para evitar fadiga de anúncio. Testar formatos responsivos e excluir placements com baixa qualidade." },
  { id: "7", name: "Lookalike Compras", platform: "meta" as const, spend: 5800, impressions: 198000, clicks: 4356, conversions: 310, ctr: "2.2%", cpc: "R$ 1,33", roas: "6.2x", status: "active", insight: "Melhor ROAS do portfólio (6.2x). Audiência lookalike de compradores está validada. Escalar gradualmente (+20%/semana) e criar variações de criativos para evitar saturação. Potencial de escalar até R$ 12k/mês." },
  { id: "8", name: "Stories Promoção", platform: "meta" as const, spend: 1200, impressions: 67000, clicks: 1876, conversions: 45, ctr: "2.8%", cpc: "R$ 0,64", roas: "2.1x", status: "active", insight: "ROAS de 2.1x abaixo do target de 3.0x. Sugestão: pausar e retrabalhar o criativo. O formato de stories precisa de mais movimento e texto maior. Testar vídeo vertical com depoimento de cliente." },
  { id: "9", name: "In-Feed Awareness", platform: "tiktok" as const, spend: 2800, impressions: 520000, clicks: 15600, conversions: 52, ctr: "3.0%", cpc: "R$ 0,18", roas: "1.8x", status: "active", insight: "Campanha de awareness com CPM baixo (R$ 5,38). Embora ROAS seja baixo, está gerando volume de impressões significativo. Manter como topo de funil e direcionar para remarketing. Não escalar, manter budget atual." },
  { id: "10", name: "Shopping Catálogo", platform: "google" as const, spend: 3500, impressions: 156000, clicks: 6240, conversions: 198, ctr: "4.0%", cpc: "R$ 0,56", roas: "5.1x", status: "active", insight: "Performance excelente com ROAS 5.1x. Feed de produtos bem otimizado. Recomendação: expandir catálogo com mais SKUs e ativar lances inteligentes. Potencial de dobrar investimento mantendo ROAS acima de 4x." },
];

const mockInsights = [
  { id: "1", date: "31/03/2026 14:30", summary: "Lead Carlos Mendes demonstrou alto interesse no plano Enterprise. Score subiu de 78 para 85 após interação com bot. Recomendação: agendar demo personalizada.", type: "hot" },
  { id: "2", date: "31/03/2026 10:15", summary: "3 leads do segmento SaaS entraram pelo Google Ads nas últimas 24h. Padrão de busca: 'automação marketing'. Sugestão: criar landing page específica.", type: "trend" },
  { id: "3", date: "30/03/2026 16:00", summary: "Taxa de resposta do bot caiu 12% nos últimos 3 dias. Possível causa: mensagens muito longas. Recomendação: encurtar scripts do fluxo inicial.", type: "alert" },
  { id: "4", date: "30/03/2026 09:00", summary: "Lead Ana Beatriz converteu após 3 interações com o bot. Tempo médio de conversão: 2,4 dias. Performance acima da média do segmento.", type: "success" },
  { id: "5", date: "29/03/2026 14:45", summary: "Segmento 'Financeiro' apresenta CPL 40% menor que média. Sugestão: aumentar investimento em campanhas focadas neste nicho.", type: "trend" },
];

const platformLabels: Record<AdsPlatform, string> = {
  all: "Todos",
  meta: "Meta",
  tiktok: "TikTok",
  google: "Google",
};

const Intelligence = () => {
  const [params, setParams] = useSearchParams();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const tab = params.get("tab");
  const activeTab: SubTab = threadId ? "flow" : tab === "ads" || tab === "sdr" ? tab : "flow";
  const setActiveTab = (next: SubTab) => { if (threadId) navigate(`/intelligence?tab=${next}`); else setParams({ tab: next }); };
  const [sdrEnabled, setSdrEnabled] = useState(false);
  const [adsPlatform, setAdsPlatform] = useState<AdsPlatform>("all");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());

  const filteredCampaigns = adsPlatform === "all" ? mockCampaigns : mockCampaigns.filter((c) => c.platform === adsPlatform);

  const handleAnalyze = (id: string) => {
    setAnalyzingId(id);
    setTimeout(() => {
      setAnalyzingId(null);
      setAnalyzedIds(prev => new Set(prev).add(id));
    }, 2500);
  };

  const tabs: { id: SubTab; label: string; icon: any }[] = [
    { id: "flow", label: "Gestor de tráfego", icon: Zap },
    { id: "ads", label: "ADS Intelligence", icon: BarChart3 },
    { id: "sdr", label: "SDR Intelligence", icon: Users },
  ];

  return (
    <div className="tech-surface min-h-screen pb-28"><WorkspaceHeader /><div className="px-4 pt-7">
      <div className="max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-semibold text-foreground mb-2">
          <Brain className="inline mr-2 text-primary" size={28} />
          Intelligence
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">Campanhas, oportunidades e atendimento · Dados demonstrativos</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap`}>
              <tab.icon size={16} /> {tab.label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "flow" && <motion.div key={threadId || "flow"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TrafficManager key={threadId || "home"} threadId={threadId} /></motion.div>}

          {/* ADS INTELLIGENCE */}
          {activeTab === "ads" && (
            <motion.div key="ads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(platformLabels) as AdsPlatform[]).map((p) => (
                  <Button key={p} variant={adsPlatform === p ? "default" : "outline"} onClick={() => setAdsPlatform(p)}
                    className={`text-sm font-medium`}>
                    {platformLabels[p]}
                  </Button>
                ))}
              </div>

              <AdsOverview platform={adsPlatform} spend={filteredCampaigns.reduce((n,c) => n + c.spend, 0)} conversions={filteredCampaigns.reduce((n,c) => n + c.conversions, 0)} revenue={filteredCampaigns.reduce((n,c) => n + c.spend * parseFloat(c.roas), 0)} />
              <h2 className="text-lg font-semibold mt-7 mb-4">Campanhas · {filteredCampaigns.length}</h2>
              <div className="space-y-4">
                {filteredCampaigns.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="workspace-panel p-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-foreground">{c.name}</h3>
                        <span className="text-xs text-muted-foreground capitalize">{c.platform} · {c.status === "active" ? "🟢 Ativa" : "⏸️ Pausada"}</span>
                      </div>
                      <Button onClick={() => handleAnalyze(c.id)}
                        disabled={analyzingId === c.id}
                        className="shrink-0">
                        {analyzingId === c.id ? "Analisando..." : "Analisar"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-y border-border py-4">
                      <div className="p-2 text-center">
                        <DollarSign size={14} className="text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Investido</p>
                        <p className="font-bold text-foreground text-sm">R$ {c.spend.toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="p-2 text-center">
                        <MousePointer size={14} className="text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">CTR</p>
                        <p className="font-bold text-foreground text-sm">{c.ctr}</p>
                      </div>
                      <div className="p-2 text-center">
                        <Eye size={14} className="text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">ROAS</p>
                        <p className="font-bold text-foreground text-sm">{c.roas}</p>
                      </div>
                      <div className="p-2 text-center">
                        <TrendingUp size={14} className="text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Conversões</p>
                        <p className="font-bold text-foreground text-sm">{c.conversions}</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {analyzingId === c.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="mt-4 bg-muted/50 rounded-xl p-4 overflow-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain size={16} className="text-primary animate-pulse" />
                            <span className="text-sm font-semibold text-foreground">IA analisando campanha...</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-2 bg-muted rounded-full w-3/4 animate-pulse" />
                            <div className="h-2 bg-muted rounded-full w-1/2 animate-pulse" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Show insight after analysis */}
                    {analyzedIds.has(c.id) && analyzingId !== c.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 bg-accent/10 border border-accent/20 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <Brain size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">💡 Insight da IA</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{c.insight}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SDR INTELLIGENCE */}
          {activeTab === "sdr" && (
            <motion.div key="sdr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between bg-card rounded-2xl p-5 shadow-card mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sdrEnabled ? "gradient-peach" : "bg-muted"}`}>
                    <Users size={20} className={sdrEnabled ? "text-primary-foreground" : "text-muted-foreground"} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">SDR Intelligence</p>
                    <p className="text-xs text-muted-foreground">{sdrEnabled ? "Insights de atendimento ativos" : "Ative para gerar insights de atendimento"}</p>
                  </div>
                </div>
                <Switch checked={sdrEnabled} onCheckedChange={setSdrEnabled} />
              </div>

              {sdrEnabled ? (
                <>
                  <h3 className="font-bold text-foreground mb-4">Histórico de Insights</h3>
                  <div className="space-y-3">
                    {mockInsights.map((insight) => (
                      <motion.div key={insight.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="workspace-panel p-5">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            insight.type === "hot" ? "gradient-peach" : insight.type === "trend" ? "gradient-lilac" : insight.type === "alert" ? "bg-destructive/10" : "gradient-mint"
                          }`}>
                            {insight.type === "hot" && <TrendingUp size={14} className="text-primary-foreground" />}
                            {insight.type === "trend" && <BarChart3 size={14} className="text-secondary-foreground" />}
                            {insight.type === "alert" && <AlertTriangle size={14} className="text-destructive" />}
                            {insight.type === "success" && <CheckCircle size={14} className="text-accent-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{insight.summary}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock size={12} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{insight.date}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card p-8 text-center">
                  <Users size={40} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold text-foreground mb-2">SDR Intelligence Desativado</h3>
                  <p className="text-sm text-muted-foreground">Ative o SDR Intelligence acima para começar a gerar insights de atendimento e visualizar o histórico.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div></div>
  );
};

export default Intelligence;

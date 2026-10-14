import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Dna, Users, Layers, Brain, Calendar, Activity, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import AdsOverview from "@/components/AdsOverview";

const activities = [
  { icon: FileText, label: "Carrossel publicado no Instagram", time: "Há 12 min", type: "Conteúdo" },
  { icon: Users, label: "3 novos leads pelo WhatsApp", time: "Há 45 min", type: "CRM" },
  { icon: Activity, label: "Campanha Google Ads otimizada", time: "Há 1 h", type: "Intelligence" },
  { icon: Calendar, label: "Newsletter agendada para amanhã", time: "Há 3 h", type: "Conteúdo" },
];
const modules = [
  { name: "Brand DNA", detail: "Identidade das suas marcas", icon: Dna, path: "/brand-dna", tone: "text-secondary-foreground bg-secondary" },
  { name: "Fábrica de Conteúdo", detail: "Criação, aprovação e publicação", icon: Layers, path: "/fabrica", tone: "text-primary bg-primary/10" },
  { name: "Dimineutron", detail: "Relacionamento e automações", icon: Users, path: "/dimineutron", tone: "text-accent-foreground bg-accent" },
  { name: "Intelligence", detail: "Campanhas e decisões", icon: Brain, path: "/intelligence", tone: "text-peach-dark bg-peach-dark/10" },
];
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return <div className="tech-surface min-h-screen pb-28">
    <WorkspaceHeader />
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-7 space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium text-muted-foreground uppercase mb-2">Seu workspace</p><h1 className="text-2xl sm:text-3xl font-semibold">Olá, {user?.name} <span className="text-muted-foreground font-normal">/ Visão geral</span></h1><p className="text-sm text-muted-foreground mt-2">Sua operação, em um só lugar.</p></div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground mr-2">Dados demonstrativos</span><Button onClick={() => navigate("/fabrica")}><Layers /> Criar conteúdo</Button></div></div>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[
        { label: "Investimento no mês", value: "R$ 15.430", delta: "+8,13%", caption: "em relação ao mês anterior" },
        { label: "Leads capturados", value: "342", delta: "+12,4%", caption: "novas oportunidades" },
        { label: "Retorno médio", value: "4,2×", delta: "+2,1%", caption: "sobre o investimento" },
        { label: "Conteúdos publicados", value: "24", delta: "+6", caption: "publicações neste mês" },
      ].map(k => <article key={k.label} className="workspace-panel p-4 sm:p-5"><p className="text-xs sm:text-sm text-muted-foreground">{k.label}</p><p className="text-2xl font-semibold mt-3">{k.value}</p><div className="flex items-center gap-1 text-xs text-accent-foreground mt-3"><ArrowUpRight size={13} />{k.delta}<span className="hidden xl:inline text-muted-foreground ml-1">{k.caption}</span></div></article>)}</section>
      <section><div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Sua operação</h2><span className="text-xs text-muted-foreground">4 espaços de trabalho</span></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{modules.map(m => <article key={m.name} className="workspace-panel p-5"><div className="flex justify-between items-start"><span className={`flex items-center justify-center h-10 w-10 rounded-lg ${m.tone}`}><m.icon size={21} /></span><Button variant="ghost" size="icon-sm" title={`Abrir ${m.name}`} aria-label={`Abrir ${m.name}`} onClick={() => navigate(m.path)}><ArrowUpRight /></Button></div><h3 className="font-semibold mt-4">{m.name}</h3><p className="text-xs text-muted-foreground mt-1">{m.detail}</p></article>)}</div></section>
      <div className="grid lg:grid-cols-[1.65fr_1fr] gap-7"><section className="min-w-0"><div className="flex items-center justify-between"><h2 className="font-semibold">Performance de campanhas</h2><Button variant="ghost" size="sm" onClick={() => navigate("/intelligence?tab=ads")}>Ver Intelligence <ArrowRight /></Button></div><AdsOverview compact spend={15430} revenue={64806} conversions={342} /></section><section><div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Próximas publicações</h2><Button variant="ghost" size="icon-sm" title="Abrir calendário" aria-label="Abrir calendário" onClick={() => navigate("/fabrica?tab=calendario")}><Calendar /></Button></div>{[
        { day: "15", month: "OUT", title: "5 dicas de produtividade", platform: "Instagram", time: "09:00" },
        { day: "16", month: "OUT", title: "Como escalar seu negócio", platform: "Blog", time: "14:30" },
        { day: "17", month: "OUT", title: "Bastidores da marca", platform: "Instagram", time: "10:00" },
      ].map(p => <div key={p.title} className="flex gap-3 py-4 border-b border-border"><div className="bg-muted rounded-md h-12 w-12 flex-shrink-0 flex flex-col items-center justify-center"><span className="text-lg font-semibold leading-5">{p.day}</span><span className="text-[10px] text-muted-foreground">{p.month}</span></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.title}</p><p className="text-xs text-muted-foreground mt-1">{p.platform} · {p.time}</p></div><span className="text-xs text-secondary-foreground self-center">Agendado</span></div>)}<Button variant="link" className="mt-3 px-0" onClick={() => navigate("/fabrica?tab=aprovacao")}>Ir para aprovação <ArrowRight /></Button></section></div>
      <section><div className="flex items-center justify-between mb-2"><h2 className="font-semibold">Atividade recente</h2><span className="text-xs text-muted-foreground">Últimas 24 horas</span></div><div className="divide-y divide-border">{activities.map(a => <div key={a.label} className="flex items-center gap-3 py-4"><a.icon size={17} className="text-muted-foreground shrink-0" /><p className="flex-1 text-sm">{a.label}</p><span className="hidden sm:block text-xs text-muted-foreground">{a.type}</span><span className="text-xs text-muted-foreground shrink-0">{a.time}</span></div>)}</div></section>
    </main>
  </div>;
}

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
    <main className="px-4 md:px-8 py-6 grid xl:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6 min-w-0">
        <section className="relative overflow-hidden rounded-[2rem] gradient-peach p-8 text-primary-foreground shadow-hover">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary-foreground/15 blur-2xl" />
          <div className="absolute right-24 bottom-[-60px] h-40 w-40 rounded-full bg-primary-foreground/10" />
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Seu workspace</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2 max-w-md">Olá, {user?.name}. Sua operação em um só lugar.</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={() => navigate("/fabrica")}><Layers /> Criar conteúdo</Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15" onClick={() => navigate("/intelligence")}>Ver Intelligence <ArrowRight /></Button>
          </div>
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[
          { label: "Investimento", value: "R$ 15.430", delta: "+8,13%", p: 68 },
          { label: "Leads", value: "342", delta: "+12,4%", p: 54 },
          { label: "Retorno médio", value: "4,2×", delta: "+2,1%", p: 82 },
          { label: "Publicados", value: "24", delta: "+6", p: 40 },
        ].map(k => <article key={k.label} className="workspace-panel p-5"><p className="text-sm text-muted-foreground">{k.label}</p><p className="text-2xl font-bold mt-2">{k.value}</p><div className="h-1.5 rounded-full bg-muted mt-4 overflow-hidden"><div className="h-full gradient-peach rounded-full" style={{ width: `${k.p}%` }} /></div><p className="flex items-center gap-1 text-xs text-primary mt-2"><ArrowUpRight size={13} />{k.delta}</p></article>)}</section>
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{modules.map(m => <button key={m.name} onClick={() => navigate(m.path)} className="workspace-panel p-5 text-left hover:-translate-y-1 transition-transform"><span className={`flex items-center justify-center h-11 w-11 rounded-2xl ${m.tone}`}><m.icon size={21} /></span><h3 className="font-semibold mt-4">{m.name}</h3><p className="text-xs text-muted-foreground mt-1">{m.detail}</p></button>)}</section>
        <section className="workspace-panel p-6 min-w-0"><div className="flex items-center justify-between"><h2 className="font-semibold">Performance de campanhas</h2><Button variant="ghost" size="sm" onClick={() => navigate("/intelligence?tab=ads")}>Detalhes <ArrowRight /></Button></div><AdsOverview compact spend={15430} revenue={64806} conversions={342} /></section>
      </div>
      <aside className="space-y-6">
        <section className="workspace-panel p-5"><div className="flex items-center justify-between mb-3"><h2 className="font-semibold">Próximas publicações</h2><Button variant="ghost" size="icon-sm" aria-label="Abrir calendário" onClick={() => navigate("/fabrica?tab=calendario")}><Calendar /></Button></div>{[
          { day: "15", month: "OUT", title: "5 dicas de produtividade", platform: "Instagram", time: "09:00" },
          { day: "16", month: "OUT", title: "Como escalar seu negócio", platform: "Blog", time: "14:30" },
          { day: "17", month: "OUT", title: "Bastidores da marca", platform: "Instagram", time: "10:00" },
        ].map(p => <div key={p.title} className="flex gap-3 p-3 rounded-2xl hover:bg-muted transition-colors"><div className="gradient-peach text-primary-foreground rounded-xl h-12 w-12 shrink-0 flex flex-col items-center justify-center"><span className="text-lg font-bold leading-5">{p.day}</span><span className="text-[10px] opacity-80">{p.month}</span></div><div className="min-w-0"><p className="text-sm font-medium truncate">{p.title}</p><p className="text-xs text-muted-foreground mt-1">{p.platform} · {p.time}</p></div></div>)}<Button className="w-full mt-3" onClick={() => navigate("/fabrica?tab=aprovacao")}>Ir para aprovação</Button></section>
        <section className="workspace-panel p-5"><h2 className="font-semibold mb-2">Atividade recente</h2>{activities.map(a => <div key={a.label} className="flex items-center gap-3 py-3"><span className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><a.icon size={16} /></span><div className="min-w-0"><p className="text-sm truncate">{a.label}</p><p className="text-xs text-muted-foreground">{a.type} · {a.time}</p></div></div>)}</section>
      </aside>
    </main>
  </div>;
}

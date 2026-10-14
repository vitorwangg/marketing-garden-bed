import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
export const roiChartData = [
  { month: "Jan", meta: 320, google: 280, tiktok: 150, mercadolivre: 180 },
  { month: "Fev", meta: 380, google: 310, tiktok: 220, mercadolivre: 200 },
  { month: "Mar", meta: 480, google: 350, tiktok: 290, mercadolivre: 250 },
  { month: "Abr", meta: 420, google: 380, tiktok: 340, mercadolivre: 220 },
  { month: "Mai", meta: 520, google: 420, tiktok: 380, mercadolivre: 300 },
  { month: "Jun", meta: 580, google: 450, tiktok: 420, mercadolivre: 340 },
];
export default function AdsOverview({ platform = "all", spend, conversions, revenue, compact = false }: { platform?: string; spend: number; conversions: number; revenue: number; compact?: boolean }) {
  const currency = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return <section className="space-y-5">
    {!compact && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[
      ["ROI", `${spend ? ((revenue - spend) / spend * 100).toFixed(0) : 0}%`],
      ["Custo por lead", currency(conversions ? spend / conversions : 0)],
      ["Investimento", currency(spend)],
    ].map(([label, value]) => <div key={label} className="workspace-panel p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>}
    <div className="border-y border-border py-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">ROI por plataforma</h2><span className="text-xs text-muted-foreground">Jan – Jun · Dados demonstrativos</span></div>
      <div className="h-56 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={roiChartData} margin={{ left: -20, right: 12 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="month" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />{[
        { key: "meta", color: "hsl(var(--primary))" }, { key: "google", color: "hsl(var(--secondary-foreground))" }, { key: "tiktok", color: "hsl(var(--peach-dark))" }, { key: "mercadolivre", color: "hsl(var(--accent-foreground))" },
      ].filter(p => platform === "all" || platform === p.key).map(p => <Line key={p.key} type="monotone" dataKey={p.key} stroke={p.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />)}</LineChart></ResponsiveContainer></div>
      <div className="mt-3 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="text-primary">● Meta</span><span className="text-secondary-foreground">● Google</span><span className="text-peach-dark">● TikTok</span><span className="text-accent-foreground">● Mercado Livre</span></div>
    </div>
  </section>;
}
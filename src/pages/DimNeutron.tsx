import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lock, Activity, Search, Download, X, Filter, Database, Shield, BarChart3, MapPin, Mail, Phone, Globe, Building2, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle2, XCircle, MessageSquare, Link2, Hash, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Segment = "Todos" | "Tecnologia" | "SaaS" | "Financeiro" | "Marketing" | "Indústria";

interface ActivityEntry {
  date: string;
  action: string;
  detail: string;
}

interface RelatedContact {
  name: string;
  role: string;
  company: string;
}

interface Contact {
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: Segment;
  score: number;
  company: string;
  role: string;
  avatar: string;
  linkedin: string;
  instagram: string;
  website: string;
  cnpj: string;
  revenue: string;
  employees: number;
  founded: number;
  address: string;
  lat: number;
  lng: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  socialScore: number;
  engagementRate: number;
  riskLevel: "low" | "medium" | "high";
  lastSeen: string;
  tags: string[];
  recentActivity: ActivityEntry[];
  connections: RelatedContact[];
  notes: string;
}

const contacts: Contact[] = [
  {
    name: "Carlos Mendes", email: "carlos@empresa.com", phone: "(21) 99834-2211", city: "Rio de Janeiro", segment: "Tecnologia", score: 92,
    company: "TechNova Solutions", role: "CTO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    linkedin: "linkedin.com/in/carlosmendes", instagram: "@carlosmendes.tech", website: "technova.com.br",
    cnpj: "12.345.678/0001-90", revenue: "R$ 4.2M", employees: 85, founded: 2017,
    address: "Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ, 20040-003", lat: -22.9068, lng: -43.1729,
    emailVerified: true, phoneVerified: true, socialScore: 88, engagementRate: 4.7, riskLevel: "low", lastSeen: "09/03/2026 14:32",
    tags: ["Enterprise", "Tech Leader", "Decision Maker", "High Priority"],
    recentActivity: [
      { date: "09/03/2026", action: "Abriu email", detail: "Campanha Q1 - Taxa abertura" },
      { date: "07/03/2026", action: "Visitou site", detail: "Página de preços - 4min 23s" },
      { date: "05/03/2026", action: "Download", detail: "Whitepaper: IA no Marketing" },
      { date: "01/03/2026", action: "Reunião", detail: "Demo do produto - 45min" },
      { date: "25/02/2026", action: "Formulário", detail: "Solicitou proposta comercial" },
      { date: "20/02/2026", action: "LinkedIn", detail: "Interagiu com post da empresa" },
    ],
    connections: [
      { name: "Patricia Santos", role: "Head of Marketing", company: "TechNova Solutions" },
      { name: "Roberto Almeida", role: "CFO", company: "FinanceCore" },
    ],
    notes: "Interessado no plano Enterprise. Agendar follow-up para demo personalizada. Orçamento aprovado para Q2."
  },
  {
    name: "Fernanda Oliveira", email: "fernanda@startup.io", phone: "(11) 98765-4321", city: "São Paulo", segment: "SaaS", score: 88,
    company: "CloudPeak SaaS", role: "CEO & Founder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
    linkedin: "linkedin.com/in/fernandaoliveira", instagram: "@fernanda.ceo", website: "cloudpeak.io",
    cnpj: "23.456.789/0001-01", revenue: "R$ 8.5M", employees: 120, founded: 2019,
    address: "Rua Augusta, 2025 - Cerqueira César, São Paulo - SP, 01413-000", lat: -23.5558, lng: -46.6622,
    emailVerified: true, phoneVerified: true, socialScore: 95, engagementRate: 6.2, riskLevel: "low", lastSeen: "09/03/2026 10:15",
    tags: ["SaaS Founder", "Influencer", "Series A", "Hot Lead"],
    recentActivity: [
      { date: "09/03/2026", action: "Reunião agendada", detail: "Call de onboarding Enterprise" },
      { date: "08/03/2026", action: "Proposta aceita", detail: "Plano Enterprise Anual" },
      { date: "06/03/2026", action: "Webinar", detail: "Participou do evento Growth Hacking" },
      { date: "03/03/2026", action: "Referral", detail: "Indicou 2 novos contatos" },
    ],
    connections: [
      { name: "Diego Martins", role: "CRO", company: "CloudPeak SaaS" },
      { name: "Ana Costa", role: "CMO", company: "DigitalFirst" },
    ],
    notes: "Fechou contrato Enterprise anual. Potencial para case study. Muito engajada nas redes."
  },
  {
    name: "Roberto Almeida", email: "roberto@corp.com.br", phone: "(21) 97654-3218", city: "Rio de Janeiro", segment: "Financeiro", score: 95,
    company: "FinanceCore Capital", role: "CFO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    linkedin: "linkedin.com/in/robertoalmeida", instagram: "@roberto.finance", website: "financecore.com.br",
    cnpj: "34.567.890/0001-12", revenue: "R$ 52M", employees: 340, founded: 2008,
    address: "Av. Presidente Vargas, 3131 - Cidade Nova, Rio de Janeiro - RJ, 20210-030", lat: -22.9035, lng: -43.1823,
    emailVerified: true, phoneVerified: false, socialScore: 72, engagementRate: 3.1, riskLevel: "low", lastSeen: "08/03/2026 16:45",
    tags: ["Finance", "C-Level", "Enterprise", "Compliance"],
    recentActivity: [
      { date: "08/03/2026", action: "Email respondido", detail: "Solicitou informações de segurança" },
      { date: "05/03/2026", action: "Visitou site", detail: "Página de compliance - 8min" },
      { date: "02/03/2026", action: "Download", detail: "Relatório SOC2" },
    ],
    connections: [
      { name: "Carlos Mendes", role: "CTO", company: "TechNova Solutions" },
    ],
    notes: "Prioridade alta. Requer documentação de compliance antes de fechar. Budget alocado."
  },
  {
    name: "Ana Costa", email: "ana@digital.com", phone: "(11) 91234-5678", city: "São Paulo", segment: "Marketing", score: 79,
    company: "DigitalFirst Agency", role: "CMO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    linkedin: "linkedin.com/in/anacosta", instagram: "@ana.marketing", website: "digitalfirst.com.br",
    cnpj: "45.678.901/0001-23", revenue: "R$ 2.1M", employees: 32, founded: 2020,
    address: "Rua Oscar Freire, 379 - Jardins, São Paulo - SP, 01426-001", lat: -23.5632, lng: -46.6721,
    emailVerified: true, phoneVerified: true, socialScore: 91, engagementRate: 7.8, riskLevel: "medium", lastSeen: "07/03/2026 09:30",
    tags: ["Marketing", "Agency", "Content Creator", "Warm Lead"],
    recentActivity: [
      { date: "07/03/2026", action: "Social media", detail: "Compartilhou post da empresa" },
      { date: "04/03/2026", action: "Abriu email", detail: "Newsletter semanal" },
      { date: "01/03/2026", action: "Evento", detail: "Participou do meetup Marketing Digital" },
    ],
    connections: [
      { name: "Fernanda Oliveira", role: "CEO", company: "CloudPeak SaaS" },
      { name: "Lucas Ferreira", role: "Diretor Industrial", company: "IndusTech" },
    ],
    notes: "Interessada em Fábrica de Conteúdo. Agendar demo específica para agências."
  },
  {
    name: "Lucas Ferreira", email: "lucas@ind.com.br", phone: "(31) 99876-5432", city: "Belo Horizonte", segment: "Indústria", score: 84,
    company: "IndusTech Manufacturing", role: "Diretor de Operações", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    linkedin: "linkedin.com/in/lucasferreira", instagram: "@lucas.industech", website: "industech.com.br",
    cnpj: "56.789.012/0001-34", revenue: "R$ 18M", employees: 210, founded: 2012,
    address: "Av. do Contorno, 4747 - Funcionários, Belo Horizonte - MG, 30110-090", lat: -19.9245, lng: -43.9352,
    emailVerified: true, phoneVerified: true, socialScore: 65, engagementRate: 2.4, riskLevel: "medium", lastSeen: "06/03/2026 11:20",
    tags: ["Indústria", "B2B", "Operações", "Mid-Market"],
    recentActivity: [
      { date: "06/03/2026", action: "Formulário", detail: "Pediu contato comercial" },
      { date: "03/03/2026", action: "Visitou site", detail: "Página de integrações - 3min" },
    ],
    connections: [
      { name: "Camila Rocha", role: "Diretora Financeira", company: "FinTech Plus" },
    ],
    notes: "Busca automação de marketing para indústria. Ciclo de venda mais longo."
  },
  {
    name: "Patricia Santos", email: "patricia@tech.io", phone: "(21) 93456-7890", city: "Rio de Janeiro", segment: "Tecnologia", score: 91,
    company: "TechNova Solutions", role: "Head of Marketing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
    linkedin: "linkedin.com/in/patriciasantos", instagram: "@patricia.mkt", website: "technova.com.br",
    cnpj: "12.345.678/0001-90", revenue: "R$ 4.2M", employees: 85, founded: 2017,
    address: "Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ, 20040-003", lat: -22.9068, lng: -43.1729,
    emailVerified: true, phoneVerified: true, socialScore: 84, engagementRate: 5.3, riskLevel: "low", lastSeen: "09/03/2026 13:10",
    tags: ["Tech", "Marketing Leader", "Brand Advocate"],
    recentActivity: [
      { date: "09/03/2026", action: "LinkedIn", detail: "Conectou-se com CEO" },
      { date: "08/03/2026", action: "Webinar", detail: "Assistiu sessão de Ads Intelligence" },
      { date: "05/03/2026", action: "Demo", detail: "Participou da demo Fábrica de Conteúdo" },
    ],
    connections: [
      { name: "Carlos Mendes", role: "CTO", company: "TechNova Solutions" },
    ],
    notes: "Trabalha com Carlos Mendes na TechNova. Pode influenciar decisão de compra."
  },
  {
    name: "Diego Martins", email: "diego@saas.co", phone: "(11) 92345-6789", city: "São Paulo", segment: "SaaS", score: 86,
    company: "CloudPeak SaaS", role: "CRO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    linkedin: "linkedin.com/in/diegomartins", instagram: "@diego.revenue", website: "cloudpeak.io",
    cnpj: "23.456.789/0001-01", revenue: "R$ 8.5M", employees: 120, founded: 2019,
    address: "Rua Augusta, 2025 - Cerqueira César, São Paulo - SP, 01413-000", lat: -23.5558, lng: -46.6622,
    emailVerified: true, phoneVerified: false, socialScore: 77, engagementRate: 3.9, riskLevel: "low", lastSeen: "08/03/2026 15:00",
    tags: ["SaaS", "Revenue", "Growth"],
    recentActivity: [
      { date: "08/03/2026", action: "Reunião", detail: "Alinhamento sobre Concierge SDR" },
      { date: "06/03/2026", action: "Email", detail: "Solicitou pricing detalhado" },
    ],
    connections: [
      { name: "Fernanda Oliveira", role: "CEO", company: "CloudPeak SaaS" },
    ],
    notes: "Focado em ROI. Precisa de case studies com métricas claras."
  },
  {
    name: "Camila Rocha", email: "camila@fin.com", phone: "(41) 99123-4567", city: "Curitiba", segment: "Financeiro", score: 90,
    company: "FinTech Plus", role: "Diretora Financeira", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
    linkedin: "linkedin.com/in/camilarocha", instagram: "@camila.fintech", website: "fintechplus.com.br",
    cnpj: "67.890.123/0001-45", revenue: "R$ 15M", employees: 95, founded: 2015,
    address: "Rua XV de Novembro, 1299 - Centro, Curitiba - PR, 80060-000", lat: -25.4284, lng: -49.2733,
    emailVerified: true, phoneVerified: true, socialScore: 80, engagementRate: 4.1, riskLevel: "low", lastSeen: "09/03/2026 08:45",
    tags: ["FinTech", "Finance Director", "Enterprise Ready"],
    recentActivity: [
      { date: "09/03/2026", action: "Login plataforma", detail: "Acessou trial do dashboard" },
      { date: "07/03/2026", action: "Reunião", detail: "Call com equipe comercial - 30min" },
      { date: "04/03/2026", action: "Download", detail: "Checklist de implementação" },
      { date: "28/02/2026", action: "Indicação", detail: "Indicou Lucas Ferreira" },
    ],
    connections: [
      { name: "Lucas Ferreira", role: "Diretor de Operações", company: "IndusTech" },
      { name: "Roberto Almeida", role: "CFO", company: "FinanceCore Capital" },
    ],
    notes: "Em fase final de negociação. Precisa de aprovação do board. Muito organizada e detalhista."
  },
];

const segments: Segment[] = ["Todos", "Tecnologia", "SaaS", "Financeiro", "Marketing", "Indústria"];

const scoreColor = (score: number) => {
  if (score >= 90) return "bg-accent-foreground";
  if (score >= 80) return "bg-primary";
  return "bg-destructive";
};

const riskColors = { low: "text-accent-foreground", medium: "text-primary", high: "text-destructive" };
const riskLabels = { low: "Baixo", medium: "Médio", high: "Alto" };

// Matrix rain effect
const MatrixRain = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    let animId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = `hsl(${Math.random() > 0.5 ? 155 : 120}, 100%, ${50 + Math.random() * 30}%)`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />;
};

// Contact Detail Sidebar
const ContactSidebar = ({ contact, onClose }: { contact: Contact; onClose: () => void }) => {
  const [localNotes, setLocalNotes] = useState(contact.notes);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-foreground/20 z-40" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-card z-50 shadow-hover overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={contact.avatar} alt={contact.name} className="w-16 h-16 rounded-2xl bg-muted" />
              <div>
                <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
                <p className="text-sm text-muted-foreground">{contact.role}</p>
                <p className="text-sm text-primary font-medium">{contact.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${contact.riskLevel === "low" ? "bg-accent/20 text-accent-foreground" : contact.riskLevel === "medium" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              Risco {riskLabels[contact.riskLevel]}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Score {contact.score}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
              {contact.segment}
            </span>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Informações de Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground flex-1">{contact.email}</span>
                {contact.emailVerified ? <CheckCircle2 size={14} className="text-accent-foreground" /> : <XCircle size={14} className="text-destructive" />}
              </div>
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                <Phone size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground flex-1">{contact.phone}</span>
                {contact.phoneVerified ? <CheckCircle2 size={14} className="text-accent-foreground" /> : <XCircle size={14} className="text-destructive" />}
              </div>
              <a href={`https://wa.me/55${contact.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-accent/10 rounded-xl px-4 py-3 hover:bg-accent/20 transition-colors">
                <MessageSquare size={14} className="text-accent-foreground" />
                <span className="text-sm font-medium text-accent-foreground">Abrir WhatsApp</span>
              </a>
              <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 hover:bg-muted transition-colors">
                <Link2 size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">LinkedIn</span>
                <span className="text-xs text-muted-foreground ml-auto">{contact.linkedin}</span>
              </a>
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                <Hash size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Instagram</span>
                <span className="text-xs text-muted-foreground ml-auto">{contact.instagram}</span>
              </div>
              <a href={`https://${contact.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 hover:bg-muted transition-colors">
                <Globe size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{contact.website}</span>
              </a>
            </div>
          </div>

          {/* Company Intel */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Inteligência da Empresa</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">CNPJ</p>
                <p className="text-xs font-medium text-foreground mt-1">{contact.cnpj}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Receita</p>
                <p className="text-sm font-bold text-foreground mt-1">{contact.revenue}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Funcionários</p>
                <p className="text-sm font-bold text-foreground mt-1">{contact.employees}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Fundação</p>
                <p className="text-sm font-bold text-foreground mt-1">{contact.founded}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Segmento</p>
                <p className="text-xs font-medium text-foreground mt-1">{contact.segment}</p>
              </div>
            </div>
          </div>

          {/* Location & Map */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Localização</h3>
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{contact.address}</p>
              </div>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-muted">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${contact.lat},${contact.lng}&zoom=14&size=500x200&maptype=roadmap&markers=color:red%7C${contact.lat},${contact.lng}&key=DEMO`}
                  alt="Mapa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-muted-foreground text-xs"><span>📍 ${contact.city} · ${contact.lat.toFixed(4)}, ${contact.lng.toFixed(4)}</span></div>`;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scores & Analytics */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scores & Analytics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lead Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${scoreColor(contact.score)}`} style={{ width: `${contact.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{contact.score}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Social Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${contact.socialScore}%` }} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{contact.socialScore}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Engajamento</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{contact.engagementRate}%</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Nível de Risco</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertTriangle size={14} className={riskColors[contact.riskLevel]} />
                  <span className={`text-sm font-bold ${riskColors[contact.riskLevel]}`}>{riskLabels[contact.riskLevel]}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Email Verificado</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {contact.emailVerified ? <CheckCircle2 size={14} className="text-accent-foreground" /> : <XCircle size={14} className="text-destructive" />}
                  <span className="text-xs font-medium text-foreground">{contact.emailVerified ? "Sim" : "Não"}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Telefone Verificado</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {contact.phoneVerified ? <CheckCircle2 size={14} className="text-accent-foreground" /> : <XCircle size={14} className="text-destructive" />}
                  <span className="text-xs font-medium text-foreground">{contact.phoneVerified ? "Sim" : "Não"}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Último Acesso</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Eye size={14} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{contact.lastSeen}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{tag}</span>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline de Atividades</h3>
            <div className="space-y-3">
              {contact.recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    {i < contact.recentActivity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold text-foreground">{act.action}</p>
                    <p className="text-xs text-muted-foreground">{act.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Contacts */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contatos Relacionados</h3>
            <div className="space-y-2">
              {contact.connections.map((conn, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground ${i % 2 === 0 ? 'gradient-peach' : 'gradient-lilac'}`}>
                    {conn.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{conn.name}</p>
                    <p className="text-[10px] text-muted-foreground">{conn.role} · {conn.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notas</h3>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              rows={4}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground resize-none focus-glow border border-border"
              placeholder="Adicionar notas sobre este contato..."
            />
          </div>

          <div className="h-8" />
        </div>
      </motion.div>
    </>
  );
};

const DimNeutron = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const locked = user?.plan !== "enterprise";
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState<Segment>("Todos");
  const [matrixActive, setMatrixActive] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filtered = useMemo(() =>
    contacts.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchSeg = activeSegment === "Todos" || c.segment === activeSegment;
      return matchSearch && matchSeg;
    }), [search, activeSegment]);

  const handleOpenPlatform = () => {
    if (locked) return;
    setMatrixActive(true);
    setTimeout(() => {
      setIsOpen(true);
      setMatrixActive(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <MatrixRain active={matrixActive} />
      <div className="max-w-5xl mx-auto">
        {!isOpen ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="relative w-full max-w-2xl">
              {locked && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 backdrop-blur-xl bg-background/60 rounded-3xl z-10 flex items-center justify-center"
                  style={{ margin: "-2rem", padding: "2rem" }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                      <Lock size={36} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
                    <p className="text-muted-foreground mb-6">Disponível apenas no plano Enterprise</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/planos")}
                      className="gradient-peach text-primary-foreground font-semibold px-8 py-3 rounded-full shadow-soft"
                    >
                      Upgrade to Enterprise
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
                  <Zap size={36} className="text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Jimmy Neutron</h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Higienização avançada de dados com IA. Limpe, valide e enriqueça sua base de contatos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bento-card p-5 text-center">
                  <Database size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                  <p className="text-xs text-muted-foreground">Contatos na base</p>
                </div>
                <div className="bento-card p-5 text-center">
                  <Shield size={24} className="text-accent-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">96%</p>
                  <p className="text-xs text-muted-foreground">Taxa de validação</p>
                </div>
                <div className="bento-card p-5 text-center">
                  <BarChart3 size={24} className="text-secondary-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-xs text-muted-foreground">Segmentos ativos</p>
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenPlatform}
                  className="gradient-peach text-primary-foreground font-semibold px-8 py-3.5 rounded-full shadow-soft flex items-center gap-2 mx-auto"
                >
                  <Zap size={18} /> ACESSAR PLATAFORMA
                </motion.button>
                <p className="text-xs text-muted-foreground mt-4">RECURSO PREMIUM · ENTERPRISE</p>
                <p className="text-xs text-muted-foreground mt-2">Última atualização: 09/03/2026 às 14:32</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Jimmy Neutron — Base Higienizada</h1>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <Download size={16} /> EXPORTAR
                </motion.button>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex gap-5">
              {/* Sidebar Filters */}
              <div className="w-48 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Filtros</span>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nome ou email..."
                      className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus-glow" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Segmento</label>
                  <div className="space-y-0.5">
                    {segments.map((seg) => (
                      <button key={seg} onClick={() => setActiveSegment(seg)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${activeSegment === seg ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                      >{seg}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 bento-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Telefone</th>
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cidade</th>
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Segmento</th>
                        <th className="text-left p-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <motion.tr key={c.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => setSelectedContact(c)}
                          className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full bg-muted" />
                              <span className="text-sm font-semibold text-foreground">{c.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{c.email}</td>
                          <td className="p-4 text-sm text-muted-foreground">{c.phone}</td>
                          <td className="p-4 text-sm text-muted-foreground">{c.city}</td>
                          <td className="p-4 text-sm text-muted-foreground">{c.segment}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-10 h-2 rounded-full ${scoreColor(c.score)}`} />
                              <span className="text-sm font-semibold text-foreground">{c.score}</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Activity size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Última atualização: 09/03/2026 às 14:32 · {filtered.length} contatos</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contact Detail Sidebar */}
      <AnimatePresence>
        {selectedContact && <ContactSidebar contact={selectedContact} onClose={() => setSelectedContact(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default DimNeutron;

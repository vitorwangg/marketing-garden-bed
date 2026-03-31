import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Users, Clock, CreditCard, Moon, Sun, Plus, Trash2, Shield, Eye, Edit3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Member {
  id: string;
  email: string;
  role: "Admin" | "Editor" | "Visualizador";
}

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  date: string;
}

interface ApiPayment {
  platform: string;
  plan: string;
  value: string;
  renewal: string;
}

const mockMembers: Member[] = [
  { id: "1", email: "joao@gtflow.com", role: "Admin" },
  { id: "2", email: "vitor@gtflow.com", role: "Editor" },
  { id: "3", email: "maria@gtflow.com", role: "Visualizador" },
];

const mockActivities: ActivityItem[] = [
  { id: "1", action: "Conteúdo gerado", detail: "3 posts para Instagram via Fábrica de Conteúdo", date: "31/03/2026 14:30" },
  { id: "2", action: "Marca atualizada", detail: "Brand DNA da GT Flow atualizado", date: "31/03/2026 10:15" },
  { id: "3", action: "Campanha analisada", detail: "Análise de ROI das campanhas Meta Ads", date: "30/03/2026 16:45" },
  { id: "4", action: "Lead capturado", detail: "Novo lead via WhatsApp Bot: Carlos Mendes", date: "30/03/2026 09:20" },
  { id: "5", action: "Post publicado", detail: "Conteúdo publicado no Facebook", date: "29/03/2026 11:00" },
];

const mockApiPayments: ApiPayment[] = [
  { platform: "OpenAI", plan: "GPT-4o Pro", renewal: "15/04/2026", link: "https://platform.openai.com/account/billing" },
  { platform: "Meta Ads", plan: "Business", renewal: "01/04/2026", link: "https://business.facebook.com/billing" },
  { platform: "Google Ads", plan: "Standard", renewal: "10/04/2026", link: "https://ads.google.com/aw/billing" },
  { platform: "TikTok Ads", plan: "Starter", renewal: "20/04/2026", link: "https://ads.tiktok.com/i18n/account/payment" },
];

const roleOptions: Member["role"][] = ["Admin", "Editor", "Visualizador"];

const Perfil = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Member["role"]>("Visualizador");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    toast.success("Senha alterada com sucesso!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const addMember = () => {
    if (!newMemberEmail.trim() || !newMemberEmail.includes("@")) {
      toast.error("Insira um email válido.");
      return;
    }
    if (members.find((m) => m.email === newMemberEmail.trim())) {
      toast.error("Este membro já existe.");
      return;
    }
    setMembers([...members, { id: Date.now().toString(), email: newMemberEmail.trim(), role: newMemberRole }]);
    setNewMemberEmail("");
    toast.success("Membro adicionado!");
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast.success("Membro removido.");
  };

  const updateMemberRole = (id: string, role: Member["role"]) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const planInfo = {
    enterprise: { label: "Enterprise", price: "R$ 15.000/mês", renewal: "01/04/2026" },
    pro: { label: "Pro", price: "R$ 2.500/mês", renewal: "01/04/2026" },
    starter: { label: "Starter", price: "Grátis", renewal: "—" },
  };
  const currentPlan = planInfo[user?.plan || "starter"];

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-2">
          <User className="inline mr-2 text-primary" size={28} />
          Perfil
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-8">Gerencie sua conta, equipe e preferências</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Info do Usuário */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <User size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Informações Pessoais</h2>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 gradient-peach rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-card">
                {(user?.name || "U").charAt(0)}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize mt-1 inline-block">
                  {user?.plan}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Trocar Senha */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Trocar Senha</h2>
            </div>
            <div className="space-y-3">
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Senha atual"
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha"
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha"
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword}
                className="w-full py-2.5 gradient-peach text-primary-foreground rounded-xl font-semibold text-sm">
                Alterar Senha
              </motion.button>
            </div>
          </motion.div>

          {/* Gerenciar Membros */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Gerenciar Membros</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email do membro..."
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
              <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as Member["role"])}
                className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground focus-glow">
                {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addMember}
                className="gradient-peach text-primary-foreground px-4 rounded-xl font-medium text-sm flex items-center gap-1">
                <Plus size={16} /> Adicionar
              </motion.button>
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <Mail size={14} className="text-muted-foreground" />
                  <span className="flex-1 text-sm text-foreground">{m.email}</span>
                  <select value={m.role} onChange={(e) => updateMemberRole(m.id, e.target.value as Member["role"])}
                    className="bg-muted rounded-lg px-2 py-1 text-xs text-foreground border border-border">
                    {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <Shield size={12} className={m.role === "Admin" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[10px] text-muted-foreground font-medium">{m.role}</span>
                  </div>
                  <button onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Histórico de Atividades */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Atividades Recentes</h2>
            </div>
            <div className="space-y-3">
              {mockActivities.map((a) => (
                <div key={a.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium text-foreground">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.date}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plano e Pagamento */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bento-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Plano Atual</h2>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{currentPlan.label}</span>
                <span className="text-sm font-bold text-primary">{currentPlan.price}</span>
              </div>
              <p className="text-xs text-muted-foreground">Próxima renovação: {currentPlan.renewal}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
                <div>
                  <p className="text-sm font-bold text-foreground">Modo Noturno</p>
                  <p className="text-[10px] text-muted-foreground">Aplica tema escuro em todo o app</p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </motion.div>

          {/* Pagamentos das APIs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bento-card p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Pagamentos das APIs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Plataforma</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Plano</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Valor</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Renovação</th>
                  </tr>
                </thead>
                <tbody>
                  {mockApiPayments.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-3 text-sm font-medium text-foreground">{p.platform}</td>
                      <td className="p-3 text-sm text-muted-foreground">{p.plan}</td>
                      <td className="p-3 text-sm font-semibold text-foreground">{p.value}</td>
                      <td className="p-3 text-sm text-muted-foreground">{p.renewal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

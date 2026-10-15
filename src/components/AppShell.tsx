import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Dna, Sparkles, Users, Brain, User, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão geral" },
  { to: "/brand-dna", icon: Dna, label: "Brand DNA" },
  { to: "/fabrica", icon: Sparkles, label: "Fábrica de Conteúdo" },
  { to: "/dimineutron", icon: Users, label: "Dimineutron" },
  { to: "/intelligence", icon: Brain, label: "Intelligence" },
  { to: "/perfil", icon: User, label: "Perfil" },
  { to: "/planos", icon: Crown, label: "Planos" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  return (
    <div className="app-backdrop min-h-screen lg:h-screen lg:p-6">
      <div className="app-frame lg:h-full flex">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col p-6 gap-8">
          <NavLink to="/dashboard" className="flex items-center gap-3 px-2">
            <img src={logo} alt="GT Flow" className="h-10 w-10 rounded-xl object-contain" />
            <div><p className="font-bold leading-4">GT Flow</p><p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Hub</p></div>
          </NavLink>
          <nav className="flex-1 space-y-1">
            {items.map((i) => {
              const active = pathname === i.to || pathname.startsWith(i.to + "/");
              return (
                <NavLink key={i.to} to={i.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${active ? "bg-card text-primary font-semibold shadow-card" : "text-muted-foreground hover:text-foreground hover:bg-card/60"}`}>
                  <i.icon size={18} />{i.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="rounded-3xl bg-card shadow-card p-4 text-center">
            <NavLink to="/perfil" className="block">
              <div className="mx-auto h-20 w-20 rounded-2xl gradient-peach flex items-center justify-center text-3xl font-bold text-primary-foreground">{user?.name.charAt(0)}</div>
              <p className="mt-3 font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">Plano {user?.plan}</p>
            </NavLink>
            <button onClick={logout} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"><LogOut size={14} /> Sair</button>
          </div>
        </aside>
        <div className="app-content flex-1 min-w-0 lg:overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

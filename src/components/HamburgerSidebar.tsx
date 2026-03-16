import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, Dna, Sparkles, Users,
  BarChart3, Zap, CreditCard, LogOut, ChevronDown, Bot, Construction,
  CheckCircle, Clock, FileText, Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  icon: any;
  label: string;
  subItems?: { to: string; label: string; icon: any }[];
}

const navItems: NavItem[] = [
  {
    to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",
    subItems: [
      { to: "/calendario", label: "Calendário", icon: Calendar },
    ]
  },
  { to: "/brand-dna", icon: Dna, label: "Brand DNA" },
  {
    to: "/fabrica", icon: Sparkles, label: "Fábrica de Conteúdo",
    subItems: [
      { to: "/fabrica?tab=aprovacao", label: "Aprovação", icon: CheckCircle },
      { to: "/fabrica?tab=historico", label: "Histórico", icon: Clock },
    ]
  },
  {
    to: "/concierge", icon: Users, label: "Concierge SDR",
    subItems: [
      { to: "/concierge?tab=contatos", label: "Contatos", icon: Users },
      { to: "/concierge?tab=fluxo_bot", label: "Fluxo Bot", icon: Bot },
    ]
  },
  { to: "/ads-intel", icon: BarChart3, label: "Ads Cockpit" },
  {
    to: "/dim-neutron", icon: Zap, label: "Jimmy Neutron",
    subItems: [
      { to: "/dim-neutron?open=true", label: "Acessar Plataforma", icon: Zap },
    ]
  },
  { to: "/planos", icon: CreditCard, label: "Planos" },
];

const HamburgerSidebar = () => {
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-md shadow-card flex items-center justify-center hover:bg-card transition-colors"
      >
        <Menu size={20} className="text-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-card z-50 shadow-hover p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 gradient-peach rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user?.plan}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to.split("?")[0]);
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedItem === item.label;

                  return (
                    <div key={item.to}>
                      <div className="flex">
                        <NavLink
                          to={item.to.split("?")[0]}
                          onClick={() => { if (!hasSubItems) setOpen(false); }}
                          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                            isActive
                              ? "gradient-peach text-primary-foreground shadow-card"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon size={18} />
                          {item.label}
                        </NavLink>
                        {hasSubItems && (
                          <button onClick={() => toggleExpand(item.label)}
                            className="px-2 flex items-center text-muted-foreground hover:text-foreground">
                            <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {hasSubItems && isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6 mt-0.5 space-y-0.5">
                            {item.subItems!.map((sub) => (
                              <NavLink key={sub.label} to={sub.to}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <sub.icon size={14} /> {sub.label}
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              <button
                onClick={() => { logout(); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut size={18} />
                Sair
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerSidebar;

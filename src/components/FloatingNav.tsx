import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Dna, Sparkles, Users, BarChart3, Zap, CreditCard, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/brand-dna", icon: Dna, label: "Brand DNA" },
  { to: "/fabrica", icon: Sparkles, label: "Fábrica" },
  { to: "/concierge", icon: Users, label: "Concierge" },
  { to: "/ads-intel", icon: BarChart3, label: "Ads" },
  { to: "/dim-neutron", icon: Zap, label: "Neutron" },
  { to: "/planos", icon: CreditCard, label: "Planos" },
];

const FloatingNav = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-50 glass-pill px-3 py-2 flex items-center gap-1"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center px-3 py-2 rounded-full transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 gradient-peach rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon
              size={20}
              className={`relative z-10 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
            />
            <span
              className={`relative z-10 text-[10px] font-medium mt-0.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
      <button
        onClick={logout}
        className="flex flex-col items-center px-3 py-2 rounded-full text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium mt-0.5">Sair</span>
      </button>
    </motion.nav>
  );
};

export default FloatingNav;

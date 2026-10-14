import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Dna, Sparkles, Users, BarChart3, Zap, CreditCard, LogOut, Brain, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/brand-dna", icon: Dna, label: "Brand DNA" },
  { to: "/fabrica", icon: Sparkles, label: "Fábrica" },
  { to: "/dimineutron", icon: Users, label: "Dimineutron" },
  { to: "/intelligence", icon: Brain, label: "Intelligence" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

const FloatingNav = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      className="fixed bottom-4 left-3 right-3 sm:left-0 sm:right-0 mx-auto w-fit max-w-[calc(100%-24px)] z-50 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-card px-1 sm:px-3 py-1.5 flex items-center gap-0 sm:gap-1"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center px-1.5 sm:px-3 py-2 rounded-lg transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-primary rounded-lg"
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

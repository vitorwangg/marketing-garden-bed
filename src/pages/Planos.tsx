import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    price: "R$ 2.900",
    period: "/mês",
    icon: Rocket,
    gradient: "gradient-mint",
    features: ["1 Marca", "Fábrica de Conteúdo (básico)", "Concierge SDR Básico", "Ads Intelligence (limitado)", "Suporte por email"],
    highlight: false,
    plan: "starter" as const,
  },
  {
    name: "Pro",
    price: "R$ 7.500",
    period: "/mês",
    icon: Zap,
    gradient: "gradient-lilac",
    features: ["Até 3 Marcas", "Fábrica de Conteúdo Completa", "Concierge SDR Completo", "Ads Intelligence Full", "Suporte prioritário"],
    highlight: false,
    plan: "pro" as const,
  },
  {
    name: "Enterprise",
    price: "R$ 15.000",
    period: "/mês",
    icon: Crown,
    gradient: "gradient-peach",
    features: ["Até 10 Marcas", "Fábrica Ilimitada", "Concierge SDR Premium", "Ads Intelligence Full", "Jimmy Neutron Access", "Suporte 24/7 dedicado"],
    highlight: true,
    plan: "enterprise" as const,
  },
];

const Planos = () => {
  const { user, upgradeUser } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = (plan: "starter" | "pro" | "enterprise") => {
    upgradeUser(plan);
    toast.success(`Plano atualizado com sucesso!`);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Ver Planos</h1>
          <p className="text-lg text-muted-foreground">Escolha o plano ideal para sua operação</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bento-card p-8 ${plan.highlight ? "md:scale-105 md:-my-4 shadow-hover ring-2 ring-primary/20" : ""}`}
            >
              <div className={`w-14 h-14 ${plan.gradient} rounded-2xl flex items-center justify-center mb-5`}>
                <plan.icon size={28} className="text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-accent-foreground flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubscribe(plan.plan)}
                className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "gradient-peach text-primary-foreground shadow-soft"
                    : user?.plan === plan.plan
                    ? "bg-muted text-foreground cursor-default"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {user?.plan === plan.plan ? "Plano Atual" : "Assinar"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planos;

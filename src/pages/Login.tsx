import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import gtLogo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const quickProfiles = [
  { email: "joao@gtflow.com", name: "João", badge: "Enterprise" },
  { email: "vitor@gtflow.com", name: "Vitor", badge: "Pro" },
  { email: "maria@gtflow.com", name: "Maria", badge: "Starter" },
];

const accentColors = [
  { name: "Blue", hsl: "217 91% 60%", hslDark: "245 75% 62%", preview: "#3B82F6" },
  { name: "Lilac", hsl: "270 40% 72%", hslDark: "270 30% 55%", preview: "#B388D9" },
  { name: "Mint", hsl: "155 40% 55%", hslDark: "155 35% 40%", preview: "#5CB89A" },
  { name: "Teal", hsl: "178 60% 45%", hslDark: "200 70% 50%", preview: "#2EB8B3" },
  { name: "Coral", hsl: "350 80% 68%", hslDark: "350 70% 55%", preview: "#E8637A" },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const applyAccentGlobally = (color: typeof accentColors[0]) => {
  const root = document.documentElement.style;
  root.setProperty("--primary", color.hsl);
  root.setProperty("--ring", color.hsl);
  root.setProperty("--peach", color.hsl);
  root.setProperty("--peach-dark", color.hslDark);
  sessionStorage.setItem("gt-accent-hsl", color.hsl);
  sessionStorage.setItem("gt-accent-hsl-dark", color.hslDark);
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedAccent, setSelectedAccent] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
      });
    }
    particlesRef.current = particles;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 1) {
          const force = 0.8 / dist;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleAccentClick = (index: number) => {
    setSelectedAccent(index);
    applyAccentGlobally(accentColors[index]);
  };

  const handleLogin = (emailToUse: string) => {
    applyAccentGlobally(accentColors[selectedAccent]);

    const success = login(emailToUse);
    if (success) {
      const lowerEmail = emailToUse.toLowerCase();
      if (lowerEmail === "maria@gtflow.com") {
        navigate("/planos");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("Email não encontrado. Use um dos perfis abaixo.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 p-10 w-full max-w-md rounded-squircle border border-white/10"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={gtLogo} alt="GT Flow" className="w-14 h-14 rounded-2xl object-contain" />
          <h1 className="text-3xl font-bold text-white">GT Flow Hub</h1>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-xs text-white/50">Tema:</span>
          {accentColors.map((color, i) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAccentClick(i)}
              className={`w-7 h-7 rounded-full transition-all shadow-sm ${
                selectedAccent === i ? "ring-2 ring-offset-2 ring-offset-transparent ring-white scale-110" : ""
              }`}
              style={{ backgroundColor: color.preview }}
              title={color.name}
            />
          ))}
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 rounded-squircle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-white/10"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 rounded-squircle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-white/10"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin(email)}
            className="w-full py-3.5 gradient-peach text-primary-foreground font-semibold rounded-squircle shadow-soft transition-all"
          >
            Entrar
          </motion.button>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-sm text-white/40 text-center mb-4">Acesso rápido</p>
          <div className="flex gap-2 justify-center">
            {quickProfiles.map((p) => (
              <motion.button
                key={p.email}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLogin(p.email)}
                className="px-4 py-2.5 flex flex-col items-center gap-1 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all"
              >
                <span className="font-semibold text-sm text-white">{p.name}</span>
                <span className="text-[10px] text-white/50">{p.badge}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

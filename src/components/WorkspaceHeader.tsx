import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Palette, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.png";

const accents = [
  { label: "Azul", className: "swatch-sky", hsl: "218 78% 48%" },
  { label: "Coral", className: "swatch-coral", hsl: "350 70% 55%" },
  { label: "Menta", className: "swatch-mint", hsl: "165 50% 35%" },
  { label: "Lilás", className: "swatch-lilac", hsl: "260 40% 55%" },
];
export default function WorkspaceHeader() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [colorsOpen, setColorsOpen] = useState(false);
  return <header className="flex min-h-16 items-center justify-between gap-2 border-b border-border px-4 pl-16 md:px-6 md:pl-16">
    <Link to="/dashboard" className="flex min-w-0 items-center gap-2"><img src={logo} alt="GT Flow" className="h-9 w-9 rounded-lg object-contain" /><span className="font-semibold text-base sm:text-lg">GT Flow Hub</span></Link>
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="relative"><Button variant="ghost" size="icon-sm" aria-label="Escolher cor" title="Escolher cor" onClick={() => setColorsOpen(!colorsOpen)}><Palette /></Button>
        {colorsOpen && <div className="absolute right-0 top-10 z-50 flex gap-2 rounded-lg border border-border bg-card p-3 shadow-card">{accents.map(a => <Button key={a.label} size="icon-xs" aria-label={a.label} title={a.label} className={`${a.className} rounded-full`} onClick={() => {
          const surface = document.querySelector(".tech-surface") as HTMLElement | null;
          surface?.style.setProperty("--primary", a.hsl);
          surface?.style.setProperty("--ring", a.hsl);
          setColorsOpen(false);
        }} />)}</div>}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>{theme === "dark" ? <Sun /> : <Moon />}</Button>
      <Button asChild variant="ghost" className="px-1 sm:px-3"><Link to="/perfil"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">{user?.name.charAt(0)}</span><span className="hidden sm:inline">{user?.name}</span><ChevronDown className="hidden sm:block" /></Link></Button>
    </div>
  </header>;
}
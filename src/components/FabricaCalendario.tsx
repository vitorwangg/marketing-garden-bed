import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Instagram, Globe, Twitter, FileText } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const channelIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Globe,
  tiktok: Twitter,
  blog: FileText,
  email: Globe,
};

const channelColors: Record<string, string> = {
  instagram: "gradient-peach",
  facebook: "gradient-lilac",
  tiktok: "gradient-mint",
  blog: "bg-primary/20",
  email: "bg-secondary",
};

const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7h to 19h

interface CalendarPost {
  id: string;
  title: string;
  channelId: string;
  channel: string;
  scheduledDate: Date;
  status: string;
  imageUrl?: string;
}

const FabricaCalendario = () => {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      setLoading(true);
      const weekEnd = addDays(weekStart, 7);
      const { data, error } = await supabase
        .from("conteudos")
        .select("*")
        .eq("user_id", user.email)
        .not("data_agendada", "is", null)
        .gte("data_agendada", weekStart.toISOString())
        .lt("data_agendada", weekEnd.toISOString())
        .order("data_agendada", { ascending: true });

      if (error) {
        console.error("Erro ao buscar posts agendados:", error);
      } else {
        setPosts(
          (data || []).map((row: any) => ({
            id: row.id,
            title: row.titulo || "Conteúdo",
            channelId: row.channel_id || "instagram",
            channel: row.canal || "Instagram",
            scheduledDate: new Date(row.data_agendada),
            status: row.status,
            imageUrl: row.imagem_url || undefined,
          }))
        );
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user, weekStart]);

  const getPostsForDayHour = (day: Date, hour: number) => {
    return posts.filter((p) => {
      return isSameDay(p.scheduledDate, day) && p.scheduledDate.getHours() === hour;
    });
  };

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          className="flex items-center gap-1 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <ChevronLeft size={16} /> Anterior
        </motion.button>
        <h3 className="text-sm font-bold text-foreground">
          {format(weekDays[0], "dd MMM", { locale: ptBR })} — {format(weekDays[6], "dd MMM yyyy", { locale: ptBR })}
        </h3>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="flex items-center gap-1 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
          Próxima <ChevronRight size={16} />
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando calendário...</div>
      ) : (
        <div className="bento-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-16 p-2 text-[10px] font-semibold text-muted-foreground border-b border-r border-border">Hora</th>
                  {weekDays.map((day) => (
                    <th key={day.toISOString()} className={`p-2 text-center border-b border-r border-border last:border-r-0 ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</p>
                      <p className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-primary" : "text-foreground"}`}>{format(day, "dd")}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour}>
                    <td className="p-2 text-[10px] font-medium text-muted-foreground border-r border-b border-border text-center align-top">
                      {String(hour).padStart(2, "0")}:00
                    </td>
                    {weekDays.map((day) => {
                      const dayPosts = getPostsForDayHour(day, hour);
                      return (
                        <td key={day.toISOString() + hour} className={`p-1 border-r border-b border-border last:border-r-0 align-top min-h-[48px] ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}>
                          {dayPosts.map((post) => {
                            const Icon = channelIcons[post.channelId] || Globe;
                            return (
                              <motion.div key={post.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className={`${channelColors[post.channelId] || "bg-muted"} rounded-lg p-1.5 mb-1 cursor-pointer hover:scale-105 transition-transform`}>
                                <div className="flex items-center gap-1">
                                  <Icon size={10} className="text-primary-foreground flex-shrink-0" />
                                  <span className="text-[9px] font-semibold text-primary-foreground truncate">{post.title}</span>
                                </div>
                                <span className="text-[8px] text-primary-foreground/70">{format(post.scheduledDate, "HH:mm")}</span>
                              </motion.div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum post agendado nesta semana.</p>
          <p className="text-xs mt-1">Agende conteúdos na aba de Aprovação para vê-los aqui.</p>
        </div>
      )}
    </div>
  );
};

export default FabricaCalendario;

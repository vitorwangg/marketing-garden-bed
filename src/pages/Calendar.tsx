import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, X, Plus, Clock, Users, Sparkles, BarChart3, UserPlus, Check, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "fabrica" | "concierge" | "ads" | "meeting" | "custom";
  time?: string;
  description?: string;
  participants?: string[];
  checklist?: { text: string; done: boolean }[];
}

const typeConfig: Record<string, { color: string; icon: any; label: string }> = {
  fabrica: { color: "bg-primary/20 text-primary", icon: Sparkles, label: "Fábrica" },
  concierge: { color: "bg-secondary text-secondary-foreground", icon: UserPlus, label: "Concierge" },
  ads: { color: "bg-accent text-accent-foreground", icon: BarChart3, label: "Ads" },
  meeting: { color: "bg-primary/10 text-primary", icon: Users, label: "Reunião" },
  custom: { color: "bg-muted text-foreground", icon: CalIcon, label: "Evento" },
};

const today = new Date();
const pad = (n: number) => n.toString().padStart(2, "0");
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const initialEvents: CalendarEvent[] = [
  { id: "1", date: fmt(today.getFullYear(), today.getMonth(), 3), title: "Carrossel Dia das Mães publicado", type: "fabrica", time: "10:30" },
  { id: "2", date: fmt(today.getFullYear(), today.getMonth(), 5), title: "12 novos leads capturados", type: "concierge", time: "14:00" },
  { id: "3", date: fmt(today.getFullYear(), today.getMonth(), 6), title: "Campanha Google Ads iniciada", type: "ads", time: "09:00", description: "Budget: R$ 2.400 · Search Brand" },
  { id: "4", date: fmt(today.getFullYear(), today.getMonth(), 7), title: "Newsletter enviada", type: "fabrica", time: "08:00" },
  { id: "5", date: fmt(today.getFullYear(), today.getMonth(), 9), title: "8 leads atualizados no Concierge", type: "concierge", time: "16:20" },
  { id: "6", date: fmt(today.getFullYear(), today.getMonth(), 12), title: "Campanha Meta Ads pausada", type: "ads", time: "11:00" },
  { id: "7", date: fmt(today.getFullYear(), today.getMonth(), 15), title: "Reels publicado no Instagram", type: "fabrica", time: "15:00" },
  { id: "8", date: fmt(today.getFullYear(), today.getMonth(), 18), title: "Reunião com equipe de vendas", type: "meeting", time: "14:00", participants: ["João", "Ana", "Carlos"], checklist: [{ text: "Revisar metas", done: true }, { text: "Definir budget Q2", done: false }, { text: "Apresentar ROI", done: false }] },
  { id: "9", date: fmt(today.getFullYear(), today.getMonth(), 22), title: "TikTok UGC campanha iniciada", type: "ads", time: "10:00" },
  { id: "10", date: fmt(today.getFullYear(), today.getMonth(), 25), title: "Blog post tendências publicado", type: "fabrica", time: "09:30" },
  { id: "11", date: fmt(today.getFullYear(), today.getMonth(), 28), title: "5 leads convertidos", type: "concierge", time: "17:00" },
];

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", type: "custom" as CalendarEvent["type"], description: "", participants: "", checklist: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const saveEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    if (editingEventId) {
      setEvents(events.map(e => e.id === editingEventId ? {
        ...e,
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time || undefined,
        description: newEvent.description || undefined,
        participants: newEvent.participants ? newEvent.participants.split(",").map(p => p.trim()) : undefined,
        checklist: newEvent.checklist ? newEvent.checklist.split(",").map(t => ({ text: t.trim(), done: false })) : e.checklist,
      } : e));
      toast.success("Evento atualizado! ✏️");
    } else {
      const evt: CalendarEvent = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time || undefined,
        description: newEvent.description || undefined,
        participants: newEvent.participants ? newEvent.participants.split(",").map(p => p.trim()) : undefined,
        checklist: newEvent.checklist ? newEvent.checklist.split(",").map(t => ({ text: t.trim(), done: false })) : undefined,
      };
      setEvents([...events, evt]);
      toast.success("Evento adicionado! 🎉");
    }
    setNewEvent({ title: "", time: "", type: "custom", description: "", participants: "", checklist: "" });
    setShowNewEvent(false);
    setEditingEventId(null);
  };

  const startEdit = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setNewEvent({
      title: ev.title,
      time: ev.time || "",
      type: ev.type,
      description: ev.description || "",
      participants: ev.participants?.join(", ") || "",
      checklist: ev.checklist?.map(c => c.text).join(", ") || "",
    });
    setShowNewEvent(true);
  };

  const deleteEvent = (evId: string) => {
    setEvents(events.filter(e => e.id !== evId));
    toast.success("Evento excluído 🗑️");
  };

  const cancelForm = () => {
    setShowNewEvent(false);
    setEditingEventId(null);
    setNewEvent({ title: "", time: "", type: "custom", description: "", participants: "", checklist: "" });
  };

  const toggleChecklist = (eventId: string, idx: number) => {
    setEvents(events.map(e => {
      if (e.id === eventId && e.checklist) {
        const cl = [...e.checklist];
        cl[idx] = { ...cl[idx], done: !cl[idx].done };
        return { ...e, checklist: cl };
      }
      return e;
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6 ml-12">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={20} />
          </button>
          <CalIcon size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Calendar Grid */}
          <div className="flex-1">
            <div className="bento-card p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <ChevronLeft size={18} className="text-foreground" />
                </button>
                <h2 className="text-lg font-bold text-foreground">{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <ChevronRight size={18} className="text-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-20" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = fmt(year, month, day);
                  const dayEvents = eventsByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => { setSelectedDate(dateStr); cancelForm(); }}
                      className={`h-20 rounded-xl p-1.5 text-left transition-all border ${
                        isSelected ? "border-primary bg-primary/5" : isToday ? "border-primary/30 bg-primary/5" : "border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <span className={`text-xs font-semibold block mb-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map(ev => {
                          const cfg = typeConfig[ev.type];
                          return (
                            <div key={ev.id} className={`text-[8px] font-medium px-1 py-0.5 rounded ${cfg.color} truncate`}>
                              {ev.title.substring(0, 18)}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 2} mais</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Date */}
          <div className="lg:w-[340px] space-y-4">
            {selectedDate ? (
              <>
                <div className="bento-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                    </h3>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setEditingEventId(null); setNewEvent({ title: "", time: "", type: "custom", description: "", participants: "", checklist: "" }); setShowNewEvent(true); }}
                      className="w-8 h-8 gradient-peach rounded-full flex items-center justify-center">
                      <Plus size={16} className="text-primary-foreground" />
                    </motion.button>
                  </div>

                  {selectedEvents.length === 0 && !showNewEvent && (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento neste dia</p>
                  )}

                  <div className="space-y-3">
                    {selectedEvents.map(ev => {
                      const cfg = typeConfig[ev.type];
                      const Icon = cfg.icon;
                      return (
                        <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-muted/50 rounded-2xl p-4 relative group">
                          {/* Edit / Delete buttons */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(ev)}
                              className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-primary/10 transition-colors">
                              <Pencil size={12} className="text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteEvent(ev.id)}
                              className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-destructive/10 transition-colors">
                              <Trash2 size={12} className="text-destructive" />
                            </button>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                              <p className="text-sm font-semibold text-foreground">{ev.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                {ev.time && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} />{ev.time}</span>}
                              </div>
                              {ev.description && <p className="text-xs text-muted-foreground mt-2">{ev.description}</p>}
                              {ev.participants && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Users size={12} className="text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{ev.participants.join(", ")}</span>
                                </div>
                              )}
                              {ev.checklist && (
                                <div className="mt-3 space-y-1.5">
                                  {ev.checklist.map((item, idx) => (
                                    <button key={idx} onClick={() => toggleChecklist(ev.id, idx)}
                                      className="flex items-center gap-2 w-full text-left">
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.done ? "bg-primary border-primary" : "border-border"}`}>
                                        {item.done && <Check size={10} className="text-primary-foreground" />}
                                      </div>
                                      <span className={`text-xs ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.text}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* New/Edit Event Form */}
                <AnimatePresence>
                  {showNewEvent && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bento-card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-foreground text-sm">{editingEventId ? "Editar Evento" : "Novo Evento"}</h3>
                        <button onClick={cancelForm}><X size={16} className="text-muted-foreground" /></button>
                      </div>
                      <div className="space-y-3">
                        <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Título do evento..." className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
                        <div className="flex gap-2">
                          <input value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                            type="time" className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
                          <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })}
                            className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground focus-glow">
                            <option value="custom">Evento</option>
                            <option value="meeting">Reunião</option>
                            <option value="fabrica">Fábrica</option>
                            <option value="concierge">Concierge</option>
                            <option value="ads">Ads</option>
                          </select>
                        </div>
                        <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Descrição (opcional)..." rows={2} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow resize-none" />
                        <input value={newEvent.participants} onChange={e => setNewEvent({ ...newEvent, participants: e.target.value })}
                          placeholder="Participantes (separados por vírgula)..." className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
                        <input value={newEvent.checklist} onChange={e => setNewEvent({ ...newEvent, checklist: e.target.value })}
                          placeholder="Checklist (itens separados por vírgula)..." className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus-glow" />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={saveEvent}
                          className="w-full py-2.5 gradient-peach text-primary-foreground font-semibold rounded-xl text-sm">
                          {editingEventId ? "Salvar Alterações" : "Adicionar Evento"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div className="bento-card p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-3">Legenda</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(typeConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${cfg.color}`}><Icon size={10} /></div>
                          <span className="text-[11px] text-foreground">{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bento-card p-8 text-center">
                <CalIcon size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Selecione uma data para ver os eventos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

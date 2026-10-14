import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, MessageSquare, Target, TrendingUp, Layers } from "lucide-react";
import type { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useTrafficChat } from "@/contexts/TrafficChatContext";
import logo from "@/assets/logo.png";
const suggestions = ["Quais campanhas devo escalar?", "Como melhorar meus criativos?", "Onde reduzir o investimento?"];
export default function TrafficManager({ threadId }: { threadId?: string }) {
  const { threads, createThread, saveMessages } = useTrafficChat();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thread = threads.find(t => t.id === threadId);
  const messages = thread?.messages ?? [];
  const focus = () => formRef.current?.querySelector("textarea")?.focus();
  useEffect(() => { focus(); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [threadId]);
  const start = () => navigate(`/intelligence/chat/${createThread()}`);
  const send = (text: string) => {
    if (!thread || pending || !text.trim()) return;
    const next: UIMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: text.trim() }] }];
    saveMessages(thread.id, next); setInput(""); setPending(true); focus();
    timerRef.current = setTimeout(() => {
      const lower = text.toLowerCase();
      const response = lower.includes("criativ") || lower.includes("conteúdo") ? "**Sugestão para os criativos**\n\nNo cenário de exemplo, o UGC Produto tem CTR de 5,8%. Teste variações desse formato com aberturas diferentes e acompanhe conversões, não só cliques.\n\nNa Fábrica de Conteúdo, prepare três versões com o mesmo argumento e diferentes primeiras frases." : lower.includes("reduzir") || lower.includes("pausar") ? "**Prioridade de revisão**\n\nStories Promoção apresenta ROAS de 2,1× no cenário demonstrativo. Revise criativo, frequência e margem antes de reduzir o orçamento.\n\nMantenha uma campanha de controle para comparar os resultados." : "**Oportunidade de escala**\n\nNa base de exemplo, Lookalike Compras tem ROAS de 6,2× e Carrossel Verão, 5,8×. São bons candidatos a um teste de aumento gradual de orçamento.\n\nConfira margem e custo por aquisição antes de decidir. Estas sugestões são simuladas; ainda não há análise dos dados reais do aplicativo.";
      saveMessages(thread.id, [...next, { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: response }] }]); setPending(false); focus();
    }, 700);
  };
  return <section>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div className="flex items-center gap-3"><img src={logo} alt="Gestor GT Flow" className="h-12 w-12 rounded-lg object-contain" /><div><h2 className="text-xl font-semibold">Gestor de tráfego</h2><p className="text-xs text-muted-foreground mt-1">Campanhas · Conteúdos · Estratégia</p></div></div><span className="text-xs px-3 py-1 rounded-md bg-secondary text-secondary-foreground">Demonstração · IA não conectada</span></div>
    {!threadId ? <><div className="py-6 border-y border-border"><h3 className="text-2xl font-semibold mb-2">O próximo passo da sua operação.</h3><p className="text-muted-foreground text-sm mb-5">Decisões de mídia, com contexto.</p><Button onClick={start}><MessageSquare /> Iniciar chat <ArrowRight /></Button></div><div className="grid md:grid-cols-3 gap-4 mt-6">{[
      { icon: TrendingUp, title: "Oportunidade de escala", text: "Lookalike Compras · ROAS 6,2×", question: suggestions[0] },
      { icon: Layers, title: "Criativos em destaque", text: "UGC Produto · CTR 5,8%", question: suggestions[1] },
      { icon: Target, title: "Ponto de atenção", text: "Stories Promoção · ROAS 2,1×", question: suggestions[2] },
    ].map(i => <article className="workspace-panel p-5" key={i.title}><i.icon className="text-primary mb-4" /><h4 className="font-semibold text-sm">{i.title}</h4><p className="text-sm text-muted-foreground mt-2">{i.text}</p><Button variant="link" className="px-0 mt-3" onClick={() => { const id = createThread(); navigate(`/intelligence/chat/${id}`); }}>Conversar sobre isso <ArrowRight /></Button></article>)}</div></> : <div className="grid md:grid-cols-[210px_1fr] gap-4">
      <aside className="border-b md:border-b-0 md:border-r border-border pb-4 md:pr-4"><Button variant="outline" className="w-full mb-3" onClick={start}><Plus /> Nova conversa</Button><div className="space-y-1">{threads.map(t => <Button key={t.id} variant={t.id === threadId ? "secondary" : "ghost"} className="w-full justify-start overflow-hidden" onClick={() => navigate(`/intelligence/chat/${t.id}`)}><MessageSquare /><span className="truncate">{t.title}</span></Button>)}</div></aside>
      <div className="min-w-0"><div className="text-xs text-muted-foreground border-b border-border pb-3 mb-3">Contexto de exemplo: 10 campanhas · Fábrica de Conteúdo · Brand DNA</div>
        {!thread ? <div className="py-12 text-center"><p className="text-muted-foreground mb-4">Esta conversa não está mais disponível nesta sessão.</p><Button onClick={start}>Nova conversa</Button></div> : <><Conversation className="h-80"><ConversationContent>{!messages.length && <div className="py-8"><h3 className="font-semibold mb-4">Qual decisão vamos explorar?</h3><div className="flex flex-wrap gap-2">{suggestions.map(s => <Button variant="outline" key={s} onClick={() => send(s)}>{s}</Button>)}</div></div>}{messages.map(m => <Message key={m.id} from={m.role}><MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>{m.parts.map((p, i) => p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null)}</MessageContent></Message>)}{pending && <Shimmer>Analisando o cenário de exemplo…</Shimmer>}</ConversationContent><ConversationScrollButton /></Conversation>
          <div ref={formRef} className="mt-4"><PromptInput onSubmit={({ text }) => send(text)}><PromptInputTextarea autoFocus aria-label="Mensagem ao gestor" placeholder="Pergunte sobre campanhas ou conteúdos…" value={input} onChange={e => setInput(e.target.value)} className="min-h-24" /><PromptInputFooter className="justify-between"><span className="text-xs text-muted-foreground">Respostas simuladas</span><PromptInputSubmit aria-label="Enviar mensagem" status={pending ? "submitted" : "ready"} disabled={pending || !input.trim()} /></PromptInputFooter></PromptInput></div></>}
      </div>
    </div>}
  </section>;
}
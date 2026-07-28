import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AGENTS } from "@/lib/agents";
import type { AgentId, Message } from "@/lib/types";
import { useStore } from "@/lib/store";
import { generateReply, suggestForward } from "@/lib/engine";
import { responderAgente } from "@/lib/ai.functions";
import { contextoClube, personaAgente } from "@/lib/ai-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CornerUpRight, Gavel, Send, Sparkles } from "lucide-react";


export const Route = createFileRoute("/chat/$agentId")({
  component: Chat,
  head: ({ params }) => {
    const a = AGENTS[params.agentId as AgentId];
    return {
      meta: [
        { title: `${a?.cargo ?? "Conversa"} — Central do Treinador` },
        { name: "description", content: `Conversa com ${a?.nome ?? "o departamento"}.` },
      ],
    };
  },
});

function Chat() {
  const { agentId } = Route.useParams();
  const id = agentId as AgentId;
  const agent = AGENTS[id];
  const { state, addMessage, addDecision, addInbox } = useStore();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chamarIA = useServerFn(responderAgente);

  const msgs = state.chats[id] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, pensando]);

  if (!agent) {
    return <div className="p-6">Departamento não encontrado.</div>;
  }

  async function enviar(texto?: string) {
    const t = (texto ?? input).trim();
    if (!t || pensando) return;
    const userMsg: Message = { id: `u-${Date.now()}`, autor: "treinador", texto: t, ts: Date.now() };
    addMessage(id, userMsg);
    setInput("");
    setPensando(true);

    let resposta = "";
    try {
      const r = await chamarIA({
        data: {
          persona: personaAgente(id, state.confianca[id]),
          contexto: contextoClube(state),
          pergunta: t,
          historico: msgs.slice(-8).map((m) => ({
            role: m.autor === "treinador" ? ("user" as const) : ("assistant" as const),
            content: m.texto,
          })),
        },
      });
      if (r.texto) resposta = r.texto;
      else if (r.erro === "limite") toast.error("Muitas mensagens seguidas. Aguarde alguns segundos.");
      else if (r.erro === "creditos") toast.error("Créditos de IA esgotados no workspace.");
    } catch {
      /* usa o motor local abaixo */
    }
    if (!resposta) resposta = generateReply(id, t, { state });

    const fwd = suggestForward(t);
    const bot: Message = {
      id: `a-${Date.now()}`,
      autor: id,
      texto: resposta,
      ts: Date.now(),
      meta: { encaminhadoPara: fwd && fwd !== id ? fwd : undefined, sugestoes: agent.sugestoes },
    };
    addMessage(id, bot);
    setPensando(false);
  }


  function encaminhar(msg: Message) {
    const alvo = msg.meta?.encaminhadoPara;
    if (!alvo) return;
    addInbox({ de: id, para: alvo, assunto: `Encaminhado por ${agent.cargo}: "${msg.texto.slice(0, 60)}..."` });
    toast.success(`Assunto enviado para ${AGENTS[alvo].cargo}`);
  }

  function registrarDecisao(msg: Message) {
    addDecision({
      titulo: `Decisão via ${agent.cargo}`,
      descricao: msg.texto,
      origem: agent.cargo,
      impacto: { moral: 1 },
    });
    toast.success("Decisão registrada na linha do tempo");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] p-0 overflow-hidden">
        <div className={`flex items-center gap-3 border-b border-border/60 bg-gradient-to-r ${agent.cor} p-4`}>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-background/40 text-2xl">{agent.emoji}</div>
          <div className="min-w-0 flex-1">
            <div className="font-bold">{agent.nome}</div>
            <div className="text-xs text-muted-foreground">{agent.cargo} • {agent.personalidade}</div>
          </div>
          <Badge variant="secondary">Confiança {state.confianca[id]}</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              <div className="text-4xl mb-3">{agent.emoji}</div>
              <p>Nenhuma conversa ainda. Toque numa sugestão abaixo ou escreva sua pergunta.</p>
            </div>
          )}
          {msgs.map((m) => (
            <MessageBubble key={m.id} msg={m} onForward={() => encaminhar(m)} onDecision={() => registrarDecisao(m)} />
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border/60 bg-card/60 p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {agent.sugestoes.map((s) => (
              <button key={s} onClick={() => enviar(s)} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs hover:border-primary/60">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
              }}
              placeholder={`Fale com ${agent.nome}...`}
              className="min-h-[52px] resize-none"
            />
            <Button onClick={() => enviar()} className="h-auto"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Responsabilidade</div>
          <p className="mt-1 text-sm">{agent.responsabilidade}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Memórias</div>
          <ul className="mt-2 space-y-1 text-sm">
            {(state.memoriasAgentes[id] ?? []).map((m, i) => (
              <li key={i} className="rounded bg-secondary/40 px-2 py-1">• {m}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Ações rápidas</div>
          <Button variant="secondary" className="mt-2 w-full" onClick={() => navigate({ to: "/reunioes" })}>
            Chamar em reunião
          </Button>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onForward, onDecision }: { msg: Message; onForward: () => void; onDecision: () => void }) {
  const usuario = msg.autor === "treinador";
  const agent = usuario ? null : AGENTS[msg.autor as AgentId];
  return (
    <div className={`flex ${usuario ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${usuario ? "" : "flex gap-2 items-start"}`}>
        {!usuario && agent && (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-base">{agent.emoji}</div>
        )}
        <div>
          <div className={`rounded-2xl px-4 py-2 text-sm ${usuario ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"}`}>
            {msg.texto}
          </div>
          {!usuario && (
            <div className="mt-1 flex flex-wrap gap-1">
              {msg.meta?.encaminhadoPara && (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onForward}>
                  <CornerUpRight className="mr-1 h-3 w-3" /> Encaminhar para {AGENTS[msg.meta.encaminhadoPara].cargo}
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDecision}>
                <Gavel className="mr-1 h-3 w-3" /> Registrar como decisão
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

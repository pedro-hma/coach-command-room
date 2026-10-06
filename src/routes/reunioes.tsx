import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import type { AgentId, ClubState } from "@/lib/types";
import { useStore } from "@/lib/store";
import { generateReply } from "@/lib/engine";
import { responderAgente } from "@/lib/ai.functions";
import { contextoClube, personaAgente } from "@/lib/ai-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bot, Gavel, MessageCircle, Mic, MicOff, PhoneOff, ScreenShare, Sparkles, Users2, Video, VideoOff } from "lucide-react";

export const Route = createFileRoute("/reunioes")({
  component: Reunioes,
  head: () => ({ meta: [
    { title: "Sala de reuniões — Coach Command Room" },
    { name: "description", content: "Reuniões da comissão em formato de chamada de empresa." },
  ]}),
});

const TEMAS = [
  "Análise do próximo jogo",
  "Planejamento da janela",
  "Situação do elenco",
  "Desenvolvimento e minutos dos jovens",
  "Avaliação da sequência recente",
];

function Reunioes() {
  const { state, addMeeting, updateMeeting, addDecision } = useStore();
  const [tema, setTema] = useState(TEMAS[0]);
  const [selecionados, setSelecionados] = useState<AgentId[]>(["auxiliar", "diretor", "analise"]);
  const [reuniaoAtual, setReuniaoAtual] = useState<null | ReturnType<typeof addMeeting>>(null);
  const [carregando, setCarregando] = useState(false);
  const [microfone, setMicrofone] = useState(true);
  const [camera, setCamera] = useState(true);
  const [fala, setFala] = useState("");
  const chamarIA = useServerFn(responderAgente);

  function toggle(id: AgentId) {
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function opiniaoIA(a: AgentId, ctx: string) {
    try {
      const r = await chamarIA({ data: {
        persona: personaAgente(a, state.confianca[a]),
        contexto: ctx,
        pergunta: `Você está numa chamada de comissão sobre "${tema}". Dê sua posição usando somente os fatos do contexto. Se faltar dado, diga isso explicitamente.`,
        historico: [],
      }});
      if (r.texto) return r.texto;
    } catch {}
    return generateReply(a, tema, { state });
  }

  async function reuniaoInterna() {
    if (!tema.trim() || selecionados.length < 2) {
      toast.error("Escolha um tema e ao menos 2 participantes.");
      return;
    }
    setCarregando(true);
    let conversa: { agente: AgentId; texto: string; ts: number }[] = [];
    for (let rodada = 0; rodada < 2; rodada++) {
      for (const a of selecionados) {
        let texto = "";
        try {
          const r = await chamarIA({ data: {
            persona: personaAgente(a, state.confianca[a]),
            contexto: contextoClube(state),
            pergunta: "Você está numa reunião interna da comissão, sem o treinador. Tema: " + tema + ". Reaja ao que os colegas acabaram de dizer. Você pode concordar, discordar, fazer uma ressalva ou levantar algo novo. Fale como " + AGENTS[a].nome + ", não como um assistente.",
            historico: conversa.slice(-8).map((m) => ({ role: "user" as const, content: AGENTS[m.agente].nome + ": " + m.texto })),
          }});
          texto = r.texto ?? "";
        } catch {}
        if (!texto) texto = generateReply(a, tema, { state });
        conversa.push({ agente: a, texto, ts: Date.now() });
      }
    }
    const opinioes = selecionados.map((a) => ({ agente: a, texto: conversa.filter((m) => m.agente === a).at(-1)?.texto ?? "" }));
    let sintese = sintetizar(tema, opinioes, state);
    let rec = "A comissão deve levar o debate ao treinador antes de transformar a discussão em decisão.";
    try {
      const r = await chamarIA({ data: {
        persona: "Você é o chefe de gabinete. Resuma uma reunião interna realista entre membros da comissão, sem inventar fatos.",
        contexto: contextoClube(state),
        pergunta: "Tema: " + tema + ". Conversa: " + conversa.map((m) => AGENTS[m.agente].nome + ": " + m.texto).join(" | ") + ". Faça uma síntese humana e depois escreva 'Recomendação:' com o ponto central.",
        historico: [],
      }});
      if (r.texto) {
        const partes = r.texto.split(/Recomenda[çc][ãa]o:/i);
        sintese = partes[0].trim() || sintese;
        rec = partes[1]?.trim() || rec;
      }
    } catch {}
    const m = addMeeting({ tema, participantes: selecionados, opinioes, conversa, sintese, recomendacao: rec, formato: "video", duracaoMin: 30, inicio: Date.now(), status: "encerrada" });
    setReuniaoAtual(m);
    setCarregando(false);
  }

  function falarNaReuniao() {
    if (!fala.trim() || !reuniaoAtual) return;
    const turno = { agente: "treinador" as const, texto: fala.trim(), ts: Date.now() };
    const conversa = [...(reuniaoAtual.conversa ?? []), turno];
    setReuniaoAtual({ ...reuniaoAtual, conversa });
    updateMeeting(reuniaoAtual.id, { conversa });
    setFala("");
  }

  async function convocar() {
    if (!tema.trim() || selecionados.length < 2) {
      toast.error("Escolha um tema e ao menos 2 participantes.");
      return;
    }
    setCarregando(true);
    const ctx = contextoClube(state);
    const opinioes = await Promise.all(selecionados.map(async (a) => ({ agente: a, texto: await opiniaoIA(a, ctx) })));
    let sintese = "A reunião terminou sem síntese automática.";
    let rec = "Nenhuma recomendação factual foi gerada.";
    try {
      const r = await chamarIA({ data: {
        persona: "Você é o Chefe de Gabinete. Faça a ata de uma reunião realista, separando fatos registrados, divergências e pontos que precisam de decisão. Nunca invente fatos.",
        contexto: ctx,
        pergunta: `Tema: "${tema}". Opiniões dos participantes: ${opinioes.map((o) => AGENTS[o.agente].cargo + ": " + o.texto).join(" | ")}. Gere 2-4 frases de síntese e uma última frase iniciada por "Recomendação:" baseada apenas nos dados.`,
        historico: [],
      }});
      if (r.texto) {
        const partes = r.texto.split(/Recomenda[çc][ãa]o:/i);
        sintese = partes[0].trim() || sintese;
        rec = partes[1]?.trim() || rec;
      }
    } catch {}
    if (sintese === "A reunião terminou sem síntese automática.") sintese = sintetizar(tema, opinioes, state);
    const conversa = opinioes.map((o) => ({ agente: o.agente, texto: o.texto, ts: Date.now() }));
    const m = addMeeting({ tema, participantes: selecionados, opinioes, conversa, sintese, recomendacao: rec, formato: "video", duracaoMin: 30, inicio: Date.now(), status: "encerrada" });
    setReuniaoAtual(m);
    setCarregando(false);
  }

  function virarDecisao() {
    if (!reuniaoAtual) return;
    addDecision({ titulo: `Reunião: ${reuniaoAtual.tema}`, descricao: reuniaoAtual.recomendacao, origem: "Sala de reunião", impacto: {} });
    toast.success("Ponto da reunião registrado na linha do tempo.");
  }

  return (
    <div className="space-y-6">
      {!reuniaoAtual ? (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/15 via-card to-card p-6">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15"><Video className="h-5 w-5 text-primary" /></div><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Sala virtual da empresa</div><h2 className="text-2xl font-black">Agendar chamada da comissão</h2></div></div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A reunião deixa de ser uma lista de opiniões: você entra numa sala, vê quem está presente, pauta a conversa e sai com uma ata.</p>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Pauta</label><Input className="mt-1" value={tema} onChange={(e) => setTema(e.target.value)} /><div className="mt-2 flex flex-wrap gap-2">{TEMAS.map((t) => <button key={t} onClick={() => setTema(t)} className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs hover:border-primary/60">{t}</button>)}</div></div>
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Participantes</label><div className="mt-2 grid gap-2 sm:grid-cols-2">{AGENT_ORDER.map((id) => { const a = AGENTS[id]; const on = selecionados.includes(id); return <button key={id} onClick={() => toggle(id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${on ? "border-primary bg-primary/10" : "border-border bg-card/50"}`}><span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">{a.emoji}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{a.nome}</span><span className="block truncate text-xs text-muted-foreground">{a.cargo}</span></span>{on && <Badge>na chamada</Badge>}</button>; })}</div></div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button disabled={carregando} onClick={convocar}>{carregando ? "Conectando..." : "Entrar na chamada"}</Button>
                <Button variant="secondary" disabled={carregando} onClick={reuniaoInterna}><Bot className="mr-2 h-4 w-4" />Comissão conversa sozinha</Button>
              </div>
              <p className="text-xs text-muted-foreground">Na segunda opção, os agentes discutem entre si sem você participar e a conversa fica salva.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Antes de entrar</div><div className="mt-4 space-y-3 text-sm"><Check text="Pauta registrada antes da conversa" /><Check text="Cada participante recebe o contexto real da carreira" /><Check text="Fatos e recomendações ficam separados na ata" /><Check text="A reunião fica salva no histórico da carreira" /></div></div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <Card className="overflow-hidden bg-slate-950 p-0">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-5 py-4 text-white"><div><div className="text-xs uppercase tracking-widest text-white/50">chamada da comissão · ao vivo</div><div className="mt-1 font-bold">{reuniaoAtual.tema}</div></div><Badge className="bg-red-500/20 text-red-200 border-red-400/30">ENCERRADA</Badge></div>
            <div className="grid min-h-[430px] grid-cols-2 gap-3 bg-slate-950 p-4 sm:grid-cols-3">
              <div className="relative col-span-2 row-span-2 grid place-items-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-slate-900 sm:col-span-2"><div className="text-center text-white"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-3xl">{state.clube.treinador ? "T" : "?"}</div><div className="mt-3 font-bold">{state.clube.treinador || "Treinador"}</div><div className="text-xs text-white/50">Você</div></div><div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-1 text-xs text-white/70">{microfone ? "🎙️ microfone" : "🔇 mudo"} · {camera ? "câmera" : "sem câmera"}</div></div>
              {reuniaoAtual.participantes.map((id) => { const a = AGENTS[id]; return <div key={id} className="grid place-items-center rounded-2xl border border-white/10 bg-slate-900 text-center text-white"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-xl">{a.emoji}</div><div className="mt-2 text-sm font-semibold">{a.nome}</div><div className="text-[10px] text-white/40">{a.cargo}</div></div></div>; })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-slate-900 p-3"><Button variant="secondary" size="icon" onClick={() => setMicrofone(!microfone)}>{microfone ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</Button><Button variant="secondary" size="icon" onClick={() => setCamera(!camera)}>{camera ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</Button><Button variant="secondary" size="icon"><ScreenShare className="h-4 w-4" /></Button><Button variant="destructive" size="icon" onClick={() => setReuniaoAtual(null)}><PhoneOff className="h-4 w-4" /></Button></div>
          </Card>

          <div className="space-y-4">
          <Card className="flex h-[430px] flex-col p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/60 p-4"><MessageCircle className="h-4 w-4 text-primary" /><div><div className="font-bold">Chat da reunião</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{reuniaoAtual.conversa?.length ?? 0} falas</div></div></div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {(reuniaoAtual.conversa ?? []).map((m, i) => {
                const eu = m.agente === "treinador";
                const a = eu ? null : AGENTS[m.agente];
                return <div key={String(m.ts) + "-" + i} className={"flex " + (eu ? "justify-end" : "justify-start")}><div className={"max-w-[90%] rounded-2xl p-3 text-sm " + (eu ? "bg-primary text-primary-foreground" : "bg-muted/50")}>{!eu && <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{a?.nome}</div>}{m.texto}</div></div>;
              })}
            </div>
            <div className="border-t border-border/60 p-3"><div className="flex gap-2"><Input value={fala} onChange={(e) => setFala(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") falarNaReuniao(); }} placeholder="Fale na reunião..." /><Button size="icon" onClick={falarNaReuniao}><MessageCircle className="h-4 w-4" /></Button></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h3 className="font-bold">Ata da reunião</h3></div>
            <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Síntese</div><p className="mt-2 text-sm">{reuniaoAtual.sintese}</p>
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3"><div className="text-xs uppercase tracking-widest text-muted-foreground">Recomendação</div><p className="mt-1 text-sm font-medium">{reuniaoAtual.recomendacao}</p></div>
            <Button onClick={virarDecisao} className="mt-4 w-full"><Gavel className="mr-2 h-4 w-4" />Registrar ponto como decisão</Button>
            <div className="mt-5 border-t border-border/60 pt-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">Participantes</div><div className="mt-2 space-y-2">{reuniaoAtual.opinioes.map((o) => <div key={o.agente} className="rounded-lg bg-muted/30 p-2"><div className="text-xs font-semibold">{AGENTS[o.agente].nome}</div><div className="mt-1 text-xs text-muted-foreground">{o.texto}</div></div>)}</div></div>
          </Card>
          </div>
        </div>
      )}

      <Card className="p-5"><div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Histórico</h3></div>{state.reunioes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhuma reunião registrada.</p> : <div className="mt-3 grid gap-2 md:grid-cols-2">{state.reunioes.map((m) => <div key={m.id} className="rounded-xl border border-border/60 p-3"><div className="font-semibold">{m.tema}</div><div className="text-xs text-muted-foreground">{new Date(m.ts).toLocaleString("pt-BR")} · {m.participantes.length} participantes · chamada de vídeo</div><p className="mt-2 text-xs">{m.sintese}</p></div>)}</div>}</Card>
    </div>
  );
}

function Check({ text }: { text: string }) { return <div className="flex items-start gap-2"><span className="text-primary">✓</span><span>{text}</span></div>; }
function sintetizar(tema: string, opinioes: { agente: AgentId; texto: string }[], s: ClubState) {
  const jogos = s.calendario.filter((f) => f.jogado).slice(-1);
  return `A reunião sobre "${tema}" reuniu ${opinioes.length} participantes. Fatos disponíveis: ${s.jogadores.length} atletas cadastrados e ${jogos.length} partida(s) registrada(s). Não há recomendação automática além do que foi sustentado pelos participantes.`;
}

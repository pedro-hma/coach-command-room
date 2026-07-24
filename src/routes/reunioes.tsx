import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
import { useStore } from "@/lib/store";
import { generateReply } from "@/lib/engine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gavel, Users2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reunioes")({
  component: Reunioes,
  head: () => ({
    meta: [
      { title: "Sala de reuniões — Central do Treinador" },
      { name: "description", content: "Convoque departamentos, ouça opiniões diferentes e receba a síntese do Chefe de Gabinete." },
    ],
  }),
});

const TEMAS = [
  "Renovar contrato do capitão",
  "Promover jovem ao profissional",
  "Definir prioridade da janela",
  "Escalação para o próximo jogo",
  "Corte na folha salarial",
];

function Reunioes() {
  const { state, addMeeting, addDecision } = useStore();
  const [tema, setTema] = useState(TEMAS[0]);
  const [selecionados, setSelecionados] = useState<AgentId[]>(["auxiliar", "diretor", "analise", "capitao"]);
  const [reuniaoAtual, setReuniaoAtual] = useState<null | ReturnType<typeof addMeeting>>(null);

  function toggle(id: AgentId) {
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function convocar() {
    if (!tema.trim() || selecionados.length < 2) {
      toast.error("Escolha um tema e ao menos 2 participantes");
      return;
    }
    const opinioes = selecionados.map((a) => ({
      agente: a,
      texto: generateReply(a, tema, { state }),
    }));
    const sintese = sintetizar(tema, opinioes, state);
    const rec = recomendar(tema, opinioes);
    const m = addMeeting({
      tema,
      participantes: selecionados,
      opinioes,
      sintese,
      recomendacao: rec,
    });
    setReuniaoAtual(m);
  }

  function virarDecisao() {
    if (!reuniaoAtual) return;
    addDecision({
      titulo: `Reunião: ${reuniaoAtual.tema}`,
      descricao: reuniaoAtual.recomendacao,
      origem: "Sala de reuniões",
      impacto: { moral: 2 },
    });
    toast.success("Recomendação registrada como decisão");
  }

  const historico = state.reunioes;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold">Nova reunião</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Tema</label>
              <Input value={tema} onChange={(e) => setTema(e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2">
                {TEMAS.map((t) => (
                  <button key={t} onClick={() => setTema(t)} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs hover:border-primary/60">{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Participantes</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {AGENT_ORDER.map((id) => {
                  const a = AGENTS[id];
                  const on = selecionados.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${on ? "border-primary bg-primary/10" : "border-border bg-card/60"}`}
                    >
                      <span className="text-lg">{a.emoji}</span>
                      <span className="flex-1 truncate">{a.nome}</span>
                      <span className="text-xs text-muted-foreground">{a.cargo.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button onClick={convocar} className="w-full">Convocar reunião</Button>
          </div>
        </Card>

        {reuniaoAtual && (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{reuniaoAtual.tema}</h3>
              <Badge variant="secondary">{reuniaoAtual.participantes.length} participantes</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {reuniaoAtual.opinioes.map((o) => {
                const a = AGENTS[o.agente];
                return (
                  <div key={o.agente} className={`rounded-lg border bg-gradient-to-r ${a.cor} p-3`}>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-base">{a.emoji}</span>
                      <span className="font-semibold">{a.nome}</span>
                      <span className="text-muted-foreground">• {a.cargo}</span>
                    </div>
                    <p className="mt-1 text-sm">{o.texto}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-primary/40 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Chefe de Gabinete</span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-line">{reuniaoAtual.sintese}</p>
              <div className="mt-3 rounded-lg bg-background/40 p-3 text-sm">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Recomendação</div>
                <p className="mt-1 font-medium">{reuniaoAtual.recomendacao}</p>
              </div>
              <Button onClick={virarDecisao} className="mt-3 w-full">
                <Gavel className="mr-2 h-4 w-4" /> Transformar em decisão
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-5 h-fit">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Histórico de reuniões</h3>
        {historico.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhuma reunião ainda.</p>}
        <ul className="mt-3 space-y-2">
          {historico.map((m) => (
            <li key={m.id} className="rounded-lg border border-border/60 bg-card/60 p-3">
              <div className="text-sm font-medium">{m.tema}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(m.ts).toLocaleString("pt-BR")} • {m.participantes.length} participantes
              </div>
              <div className="mt-1 text-xs">{m.recomendacao}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function sintetizar(tema: string, opinioes: { agente: AgentId; texto: string }[], _s: any) {
  const dif = opinioes.length;
  return `Analisei ${dif} posições sobre "${tema}". Há convergência sobre urgência do tema, com divergência de intensidade entre departamentos técnicos e institucionais.\nRiscos: impacto na moral do vestiário, custo financeiro e leitura da imprensa.\nConflitos: prioridade de gasto vs. resultado esportivo imediato.`;
}
function recomendar(tema: string, opinioes: { agente: AgentId; texto: string }[]) {
  const t = tema.toLowerCase();
  if (t.includes("renov")) return "Autorizar proposta formal de 2 anos ao capitão com cláusula de saída moderada.";
  if (t.includes("promov") || t.includes("jovem")) return "Promover a jovem promessa ao elenco principal já para o próximo ciclo de treinos.";
  if (t.includes("janela") || t.includes("prioridade")) return "Manter prioridade em meio-campo e liberar até 40% do orçamento livre.";
  if (t.includes("escalação") || t.includes("escalacao")) return "Manter 4-3-3, com titular no lugar de retornos incertos.";
  if (t.includes("folha") || t.includes("corte")) return "Abrir negociação de dois veteranos com contrato até 2026.";
  return `Executar a linha defendida pela maioria dos ${opinioes.length} participantes e revisar em 2 semanas.`;
}

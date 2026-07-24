import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Flame, AlertTriangle, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Painel,
  head: () => ({
    meta: [
      { title: "Painel — Central do Treinador" },
      { name: "description", content: "Visão geral do clube, próxima partida, moral, orçamento e pendências." },
    ],
  }),
});

function Painel() {
  const { state } = useStore();
  const s = state;
  const proximo = s.calendario.find((f) => !f.jogado);
  const ultimos = s.calendario.filter((f) => f.jogado).slice(0, 5);
  const lesionados = s.jogadores.filter((p) => p.lesionado);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Próxima partida</div>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black">{proximo?.adversario ?? "—"}</div>
              <div className="text-sm text-muted-foreground">
                {proximo?.competicao} • {proximo?.casa ? "Casa" : "Fora"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-primary">D-{s.clube.proximoJogoDias}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">dias</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/departamentos" className="flex-1">
              <Button className="w-full" variant="secondary">Falar com departamentos</Button>
            </Link>
            <Link to="/reunioes">
              <Button className="w-full">Convocar reunião</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Forma recente</div>
          <div className="mt-2 flex gap-1">
            {s.clube.forma.split(" ").map((r, i) => (
              <span
                key={i}
                className={`grid h-9 w-9 place-items-center rounded-lg font-bold ${
                  r === "V" ? "bg-primary/20 text-primary" : r === "E" ? "bg-muted text-foreground" : "bg-danger/20 text-danger"
                }`}
              >{r}</span>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs"><span>Moral do elenco</span><span className="font-semibold">{s.clube.moralElenco}%</span></div>
              <Progress value={s.clube.moralElenco} className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-xs"><span>Prioridade da janela</span><span className="font-semibold uppercase">{s.clube.prioridadeJanela}</span></div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Estado do clube</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {s.jogadores.length} atletas no elenco</div>
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-danger" /> {lesionados.length} lesionado(s)</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {s.jogadores.filter(p => p.jovem).length} promessas da base</div>
            <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" /> {s.pendencias.length} pendências abertas</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Pendências que precisam da sua palavra</h3>
            <Link to="/decisoes" className="text-xs text-primary hover:underline">ver decisões</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {s.pendencias.map((p) => (
              <li key={p.jogadorId + p.tipo} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{p.descricao}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">{p.tipo}</div>
                </div>
                <Link to="/reunioes" className="shrink-0">
                  <Button size="sm" variant="secondary">Discutir <ArrowRight className="ml-1 h-3 w-3" /></Button>
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Últimos resultados</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-5">
            {ultimos.map((f) => (
              <div key={f.id} className="rounded-lg border border-border/60 bg-card/60 p-3 text-center">
                <div className="text-[10px] uppercase text-muted-foreground truncate">{f.adversario}</div>
                <div className="mt-1 text-lg font-bold">{f.resultado}</div>
                <div className="text-[10px] text-muted-foreground">{f.casa ? "Casa" : "Fora"}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Departamentos</h3>
          <div className="mt-3 space-y-2">
            {AGENT_ORDER.slice(0, 6).map((id) => {
              const a = AGENTS[id];
              return (
                <Link key={id} to="/chat/$agentId" params={{ agentId: id }}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2 hover:border-primary/60">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-lg">{a.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.cargo}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{state.confianca[id]}</Badge>
                </Link>
              );
            })}
          </div>
          <Link to="/departamentos">
            <Button variant="ghost" className="mt-2 w-full">Ver todos os departamentos</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

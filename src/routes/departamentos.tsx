import { createFileRoute, Link } from "@tanstack/react-router";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/departamentos")({
  component: Departamentos,
  head: () => ({
    meta: [
      { title: "Departamentos — Central do Treinador" },
      { name: "description", content: "Todos os departamentos do clube: personalidade, responsabilidade e nível de confiança." },
    ],
  }),
});

function Departamentos() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Departamentos</h2>
        <p className="text-sm text-muted-foreground">Cada agente tem personalidade própria e memória do que já foi conversado.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AGENT_ORDER.map((id) => {
          const a = AGENTS[id];
          const msgs = state.chats[id]?.length ?? 0;
          return (
            <Link key={id} to="/chat/$agentId" params={{ agentId: id }}>
              <Card className={`p-5 h-full bg-gradient-to-br ${a.cor} hover:scale-[1.01] transition`}>
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{a.emoji}</div>
                  <Badge variant="secondary">Confiança {state.confianca[id]}</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold">{a.nome}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{a.cargo}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{a.personalidade}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  {msgs} mensagem(ns) • responsável por {a.responsabilidade.toLowerCase()}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

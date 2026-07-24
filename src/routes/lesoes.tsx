import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/lesoes")({
  component: Lesoes,
  head: () => ({ meta: [
    { title: "Lesões — Central do Treinador" },
    { name: "description", content: "Situação do departamento médico do clube." },
  ]}),
});

function Lesoes() {
  const { state } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <HeartPulse className="h-6 w-6 text-danger" />
        <div>
          <h2 className="text-2xl font-black">Departamento Médico</h2>
          <p className="text-sm text-muted-foreground">{state.lesoes.length} atleta(s) em recuperação</p>
        </div>
      </div>
      <Card className="p-5">
        {state.lesoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum atleta lesionado. 🎉</p>
        ) : (
          <ul className="space-y-3">
            {state.lesoes.map((l) => {
              const j = state.jogadores.find(p => p.id === l.jogadorId);
              return (
                <li key={l.jogadorId} className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{j?.nome} <span className="text-xs text-muted-foreground">({j?.pos})</span></div>
                      <div className="text-sm text-muted-foreground">{l.descricao}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black">{l.semanas}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">semanas</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link to="/chat/$agentId" params={{ agentId: "medico" }}>
          <Button variant="secondary" className="mt-4 w-full">Falar com a Dra. Helena</Button>
        </Link>
      </Card>
    </div>
  );
}

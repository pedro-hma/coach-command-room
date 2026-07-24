import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Gavel } from "lucide-react";

export const Route = createFileRoute("/decisoes")({
  component: Decisoes,
  head: () => ({ meta: [
    { title: "Decisões — Central do Treinador" },
    { name: "description", content: "Linha do tempo das decisões tomadas pelo treinador." },
  ]}),
});

function Decisoes() {
  const { state } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Gavel className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-black">Linha do tempo de decisões</h2>
          <p className="text-sm text-muted-foreground">{state.decisoes.length} decisão(ões) registradas.</p>
        </div>
      </div>
      <div className="space-y-3">
        {state.decisoes.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{d.titulo}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d.descricao}</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {new Date(d.ts).toLocaleString("pt-BR")} • origem: {d.origem}
                </div>
              </div>
              {d.impacto && (
                <div className="text-right text-xs">
                  {d.impacto.moral ? <div>moral {d.impacto.moral > 0 ? "+" : ""}{d.impacto.moral}</div> : null}
                  {d.impacto.orcamento ? <div>orçamento {d.impacto.orcamento > 0 ? "+" : ""}R$ {(d.impacto.orcamento/1e6).toFixed(1)}mi</div> : null}
                  {d.impacto.prioridade ? <div>prioridade: {d.impacto.prioridade}</div> : null}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

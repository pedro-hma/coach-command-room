import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/calendario")({
  component: Calendario,
  head: () => ({ meta: [
    { title: "Calendário — Central do Treinador" },
    { name: "description", content: "Próximas partidas e resultados recentes da temporada." },
  ]}),
});

function Calendario() {
  const { state } = useStore();
  const proximas = state.calendario.filter(f => !f.jogado).sort((a,b) => +new Date(a.data) - +new Date(b.data));
  const passadas = state.calendario.filter(f => f.jogado).sort((a,b) => +new Date(b.data) - +new Date(a.data));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Próximas partidas</h3>
        <ul className="mt-3 space-y-2">
          {proximas.map(f => (
            <li key={f.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
              <div>
                <div className="font-semibold">{f.adversario}</div>
                <div className="text-xs text-muted-foreground">{new Date(f.data).toLocaleDateString("pt-BR")} • {f.competicao} • {f.casa ? "Casa" : "Fora"}</div>
              </div>
              <Badge variant="secondary">D-{Math.max(0, Math.round((+new Date(f.data) - Date.now())/86400000))}</Badge>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Resultados recentes</h3>
        <ul className="mt-3 space-y-2">
          {passadas.map(f => (
            <li key={f.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
              <div>
                <div className="font-semibold">{f.adversario}</div>
                <div className="text-xs text-muted-foreground">{new Date(f.data).toLocaleDateString("pt-BR")} • {f.competicao} • {f.casa ? "Casa" : "Fora"}</div>
              </div>
              <div className="text-2xl font-black">{f.resultado}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

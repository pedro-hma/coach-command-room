import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AGENTS } from "@/lib/agents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => ({ meta: [
    { title: "Caixa de entrada — Central do Treinador" },
    { name: "description", content: "Assuntos encaminhados entre departamentos." },
  ]}),
});

function InboxPage() {
  const { state, setState } = useStore();
  function marcarLido(id: string) {
    setState((s) => ({ ...s, inbox: s.inbox.map(i => i.id === id ? { ...i, lido: true } : i) }));
  }
  function marcarTodosLidos() {
    setState((s) => ({ ...s, inbox: s.inbox.map(i => ({ ...i, lido: true })) }));
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-black">Caixa de entrada</h2>
            <p className="text-sm text-muted-foreground">{state.inbox.filter(i => !i.lido).length} não lida(s)</p>
          </div>
        </div>
        <Button variant="ghost" onClick={marcarTodosLidos}>Marcar todos como lidos</Button>
      </div>
      <div className="space-y-2">
        {state.inbox.length === 0 && <Card className="p-6 text-sm text-muted-foreground">Nenhum encaminhamento no momento.</Card>}
        {state.inbox.map(i => {
          const de = AGENTS[i.de]; const para = AGENTS[i.para];
          return (
            <Card key={i.id} className={`p-4 ${!i.lido ? "border-primary/50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">{de.cargo}</span> → {para.cargo} • {new Date(i.ts).toLocaleString("pt-BR")}
                  </div>
                  <div className="mt-1 text-sm">{i.assunto}</div>
                </div>
                {!i.lido && <Button size="sm" variant="ghost" onClick={() => marcarLido(i.id)}>Marcar lido</Button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

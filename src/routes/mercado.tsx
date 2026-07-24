import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/mercado")({
  component: Mercado,
  head: () => ({ meta: [
    { title: "Mercado — Central do Treinador" },
    { name: "description", content: "Prioridade da janela, orçamento livre e alvos monitorados." },
  ]}),
});

const alvos = [
  { nome: "Pedro Sartori", pos: "MEI", idade: 24, overall: 78, valor: 4.2, clube: "Cruzeiro do Sul" },
  { nome: "Adrian Vega", pos: "MEI", idade: 27, overall: 80, valor: 6.5, clube: "Grêmio Portuário" },
  { nome: "Kaio Freitas", pos: "ZAG", idade: 23, overall: 75, valor: 3.0, clube: "Vila Nova FC" },
  { nome: "Léo Ribas", pos: "ATA", idade: 26, overall: 79, valor: 5.8, clube: "Estrela do Vale" },
];

function Mercado() {
  const { state, setState, addDecision } = useStore();
  function definirPrioridade(p: any) {
    setState((s) => ({ ...s, clube: { ...s.clube, prioridadeJanela: p } }));
    addDecision({ titulo: "Prioridade da janela atualizada", descricao: `Nova prioridade: ${p}`, origem: "Mercado", impacto: { prioridade: p } });
    toast.success("Prioridade atualizada");
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Orçamento livre</div>
          <div className="mt-1 text-3xl font-black">R$ {(state.clube.orcamento/1_000_000).toFixed(1).replace(".",",")} mi</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Prioridade atual</div>
          <div className="mt-1 text-3xl font-black uppercase">{state.clube.prioridadeJanela}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["goleiro","defesa","meio","ataque"] as const).map(p => (
              <button key={p} onClick={() => definirPrioridade(p)} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs hover:border-primary/60 uppercase">{p}</button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Alvos monitorados</div>
          <div className="mt-1 text-3xl font-black">{alvos.length}</div>
          <Link to="/chat/$agentId" params={{ agentId: "diretor" }}>
            <Button variant="secondary" className="mt-2 w-full">Falar com Diretor Esportivo</Button>
          </Link>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Alvos</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {alvos.map((a) => (
            <div key={a.nome} className="rounded-lg border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.nome}</div>
                  <div className="text-xs text-muted-foreground">{a.pos} • {a.idade} anos • {a.clube}</div>
                </div>
                <Badge variant="secondary">OVR {a.overall}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm">R$ {a.valor.toFixed(1).replace(".",",")} mi</div>
                <Button size="sm" onClick={() => toast.success(`Proposta enviada por ${a.nome}`)}>Fazer proposta</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

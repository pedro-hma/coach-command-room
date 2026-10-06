import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Target, MessageCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/mercado")({
  component: Mercado,
  head: () => ({ meta: [
    { title: "Mercado — Central do Treinador" },
    { name: "description", content: "Mercado real da carreira, sem alvos fictícios." },
  ]}),
});

function Mercado() {
  const { state, setState } = useStore();
  function prioridade(p: "goleiro" | "defesa" | "meio" | "ataque" | "indefinida") {
    setState((s) => ({ ...s, clube: { ...s.clube, prioridadeJanela: p } }));
    toast.success("Prioridade da janela atualizada.");
  }
  const prioridades = ["goleiro", "defesa", "meio", "ataque"] as const;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Orçamento livre</div><div className="mt-1 text-3xl font-black">{new Intl.NumberFormat("pt-BR",{style:"currency",currency:state.clube.moeda ?? "EUR",notation:"compact",maximumFractionDigits:1}).format(state.clube.orcamento)}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Prioridade atual</div><div className="mt-1 text-3xl font-black uppercase">{state.clube.prioridadeJanela}</div><div className="mt-3 flex flex-wrap gap-2">{prioridades.map((p) => <button key={p} onClick={() => prioridade(p)} className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs uppercase hover:border-primary/60">{p}</button>)}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Alvos reais</div><div className="mt-1 text-3xl font-black">0</div><Link to="/chat/$agentId" params={{agentId:"diretor"}}><Button variant="secondary" className="mt-2 w-full"><MessageCircle className="mr-2 h-4 w-4"/>Falar com Diretor Esportivo</Button></Link></Card>
      </div>
      <Card className="border-dashed p-12 text-center">
        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">Mercado limpo</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Nenhum alvo foi pré-carregado. Isso é intencional: os jogadores desta carreira precisam vir do seu save ou de uma fonte de dados real.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link to="/elenco"><Button><Plus className="mr-2 h-4 w-4"/>Cadastrar/importar jogadores</Button></Link>
          <Link to="/chat/$agentId" params={{agentId:"diretor"}}><Button variant="secondary">Discutir mercado com Rogério</Button></Link>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-2"><Badge variant="outline">Regra de realismo</Badge><span className="text-sm text-muted-foreground">Uma proposta só pode aparecer depois que um alvo real for registrado.</span></div>
      </Card>
    </div>
  );
}

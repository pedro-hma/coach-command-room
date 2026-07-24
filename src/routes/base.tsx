import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/base")({
  component: Base,
  head: () => ({ meta: [
    { title: "Base — Central do Treinador" },
    { name: "description", content: "Jovens promessas da base do clube." },
  ]}),
});

function Base() {
  const { state, addDecision } = useStore();
  const jovens = state.jogadores.filter(p => p.jovem);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black">Categoria de Base</h2>
        <p className="text-sm text-muted-foreground">{jovens.length} promessa(s) monitoradas por Cléber Andrade.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jovens.map((p) => (
          <Card key={p.id} className="p-5 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">{p.nome}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.pos} • {p.idade} anos</div>
              </div>
              <div className="text-2xl font-black text-teal-300">{p.overall}</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Moral {p.moral} • Forma {p.forma} • Contrato {p.contratoAte}</div>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => {
              addDecision({ titulo: `Promoção: ${p.nome}`, descricao: `${p.nome} promovido(a) ao elenco principal.`, origem: "Base", impacto: { moral: 2 } });
              toast.success("Promoção registrada");
            }}>Promover ao profissional</Button>
          </Card>
        ))}
      </div>
      <Link to="/chat/$agentId" params={{ agentId: "base" }}>
        <Button variant="ghost">Conversar com o coordenador da base →</Button>
      </Link>
    </div>
  );
}

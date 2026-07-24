import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/elenco")({
  component: Elenco,
  head: () => ({ meta: [
    { title: "Elenco — Central do Treinador" },
    { name: "description", content: "Todos os atletas do elenco principal com posição, idade, overall, moral e forma." },
  ]}),
});

function Elenco() {
  const { state } = useStore();
  const jogadores = [...state.jogadores].sort((a,b) => b.overall - a.overall);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black">Elenco</h2>
        <p className="text-sm text-muted-foreground">{jogadores.length} atletas • {jogadores.filter(p=>p.jovem).length} da base • {jogadores.filter(p=>p.lesionado).length} lesionados</p>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Atleta</th>
                <th className="p-3 text-left">Pos</th>
                <th className="p-3 text-center">Idade</th>
                <th className="p-3 text-center">OVR</th>
                <th className="p-3 text-center">Moral</th>
                <th className="p-3 text-center">Forma</th>
                <th className="p-3 text-left">Contrato</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {jogadores.map((p) => (
                <tr key={p.id} className="border-t border-border/50">
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3 text-muted-foreground">{p.pos}</td>
                  <td className="p-3 text-center">{p.idade}</td>
                  <td className="p-3 text-center font-bold">{p.overall}</td>
                  <td className="p-3 text-center">{p.moral}</td>
                  <td className="p-3 text-center">{p.forma}</td>
                  <td className="p-3 text-muted-foreground">{p.contratoAte}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.capitao && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Capitão</Badge>}
                      {p.jovem && <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40">Base</Badge>}
                      {p.lesionado && <Badge className="bg-danger/20 text-danger border-danger/40">Lesionado</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

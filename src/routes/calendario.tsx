import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CalendarPlus, X } from "lucide-react";

export const Route = createFileRoute("/calendario")({
  component: Calendario,
  head: () => ({ meta: [
    { title: "Calendário — Central do Treinador" },
    { name: "description", content: "Partidas registradas a partir do seu save FC26." },
  ]}),
});

function Calendario() {
  const { state, addFixture } = useStore();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ data: new Date().toISOString().slice(0, 10), adversario: "", competicao: "", casa: true, jogado: true, placarCasa: 0, placarFora: 0, observacoes: "" });
  const passadas = state.calendario.filter(f => f.jogado).sort((a,b) => +new Date(b.data) - +new Date(a.data));
  const proximas = state.calendario.filter(f => !f.jogado).sort((a,b) => +new Date(a.data) - +new Date(b.data));

  function salvar() {
    if (!form.adversario.trim() || !form.competicao.trim()) {
      toast.error("Informe adversário e competição.");
      return;
    }
    addFixture({
      data: new Date(form.data + "T12:00:00").toISOString(),
      adversario: form.adversario.trim(),
      competicao: form.competicao.trim(),
      casa: form.casa,
      jogado: form.jogado,
      resultado: form.jogado ? `${form.placarCasa}-${form.placarFora}` : undefined,
      placarCasa: form.jogado ? form.placarCasa : undefined,
      placarFora: form.jogado ? form.placarFora : undefined,
      observacoes: form.observacoes.trim() || undefined,
    });
    setModal(false);
    toast.success(form.jogado ? "Partida registrada na linha do tempo" : "Próxima partida adicionada");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-2xl font-black">Calendário</h2><p className="text-sm text-muted-foreground">Aqui entram somente partidas que você registrou no save.</p></div>
        <Button onClick={() => setModal(true)}><CalendarPlus className="mr-2 h-4 w-4" />Adicionar partida</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Próximas partidas</h3>
          {proximas.length === 0 ? <Empty text="Nenhuma partida futura registrada." /> : (
            <ul className="mt-3 space-y-2">{proximas.map(f => (
              <li key={f.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3">
                <div><div className="font-semibold">{f.casa ? "Casa" : "Fora"} · {f.adversario}</div><div className="text-xs text-muted-foreground">{new Date(f.data).toLocaleDateString("pt-BR")} · {f.competicao}</div></div>
                <Badge variant="secondary">D-{Math.max(0, Math.round((+new Date(f.data) - Date.now())/86400000))}</Badge>
              </li>
            ))}</ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Resultados registrados</h3>
          {passadas.length === 0 ? <Empty text="Nenhum resultado ainda. Registre o que aconteceu no FC26." /> : (
            <ul className="mt-3 space-y-2">{passadas.map(f => (
              <li key={f.id} className="rounded-xl border border-border/60 bg-card/60 p-3">
                <div className="flex items-center justify-between gap-3"><div><div className="font-semibold">{f.casa ? "Você" : f.adversário} · {f.adversario}</div><div className="text-xs text-muted-foreground">{new Date(f.data).toLocaleDateString("pt-BR")} · {f.competicao}</div></div><div className="text-2xl font-black">{f.resultado}</div></div>
                {f.observacoes && <p className="mt-2 text-xs text-muted-foreground">{f.observacoes}</p>}
              </li>
            ))}</ul>
          )}
        </Card>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={() => setModal(false)}>
          <Card className="w-full max-w-2xl p-6" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Registro de save</div><h3 className="text-2xl font-black">Ficha da partida</h3><p className="mt-1 text-sm text-muted-foreground">Primeiro registre o que realmente aconteceu. A análise vem depois.</p></div><Button variant="ghost" size="icon" onClick={() => setModal(false)}><X className="h-4 w-4" /></Button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Data"><Input type="date" value={form.data} onChange={(e) => setForm({...form, data:e.target.value})} /></Field>
              <Field label="Adversário *"><Input value={form.adversario} onChange={(e) => setForm({...form, adversario:e.target.value})} placeholder="Nome do adversário no FC26" /></Field>
              <Field label="Competição *"><Input value={form.competicao} onChange={(e) => setForm({...form, competicao:e.target.value})} placeholder="Liga, copa..." /></Field>
              <Field label="Local"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.casa ? "casa" : "fora"} onChange={(e) => setForm({...form, casa:e.target.value === "casa"})}><option value="casa">Casa</option><option value="fora">Fora</option></select></Field>
              <Field label="Status"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.jogado ? "jogado" : "futuro"} onChange={(e) => setForm({...form, jogado:e.target.value === "jogado"})}><option value="jogado">Já aconteceu</option><option value="futuro">Ainda vai acontecer</option></select></Field>
              {form.jogado && <><Field label="Seu placar"><Input type="number" min={0} value={form.placarCasa} onChange={(e) => setForm({...form, placarCasa:Number(e.target.value)})} /></Field><Field label="Placar adversário"><Input type="number" min={0} value={form.placarFora} onChange={(e) => setForm({...form, placarFora:Number(e.target.value)})} /></Field></>}
              <div className="sm:col-span-2"><Field label="Observação do jogo"><textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.observacoes} onChange={(e) => setForm({...form, observacoes:e.target.value})} placeholder="O que você quer que a comissão lembre desta partida?" /></Field></div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button onClick={salvar}>Salvar partida</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>; }
function Empty({ text }: { text: string }) { return <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>; }

import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { Player } from "@/lib/types";
import { parsePlayerDatabase } from "@/lib/player-import";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Database, FileUp, Plus, Sprout, X, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/base")({
  component: Base,
  head: () => ({ meta: [
    { title: "Base — Central do Treinador" },
    { name: "description", content: "Base real da carreira, sem jogadores fictícios." },
  ]}),
});

const vazio: Player = {
  id: "", nome: "", pos: "", idade: 16, overall: 50, moral: 50, forma: 50,
  contratoAte: "", origem: "manual", jovem: true, moedaValor: "EUR", moedaTransferencia: "EUR",
};

function dinheiro(v?: number, moeda = "EUR") {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, notation: "compact", maximumFractionDigits: 1 }).format(v);
}

function Base() {
  const { state, addPlayer, addDecision } = useStore();
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<Player | null>(null);
  const [draft, setDraft] = useState<Player>(vazio);
  const fileRef = useRef<HTMLInputElement>(null);
  const jovens = [...state.jogadores].filter((p) => p.jovem).sort((a, b) => (b.potencial ?? b.overall) - (a.potencial ?? a.overall));

  function set<K extends keyof Player>(key: K, value: Player[K]) { setDraft((p) => ({ ...p, [key]: value })); }

  function importar(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parsePlayerDatabase(String(reader.result), file.name);
        if (!parsed.length) throw new Error();
        parsed.forEach((p) => addPlayer({ ...p, jovem: true, origem: p.origem ?? "fc26" }));
        toast.success(`${parsed.length} jogador(es) da base importado(s).`);
      } catch {
        toast.error("Use CSV/JSON com nome, posição, idade e overall.");
      }
    };
    reader.readAsText(file);
  }

  function salvar() {
    if (!draft.nome.trim() || !draft.pos.trim()) return toast.error("Nome real e posição são obrigatórios.");
    addPlayer({ ...draft, id: `base-${Date.now()}`, nome: draft.nome.trim(), pos: draft.pos.trim(), jovem: true, origem: "manual" });
    setModal(false); setDraft(vazio);
    toast.success(`${draft.nome.trim()} adicionado à base.`);
  }

  function promover(p: Player) {
    addDecision({
      titulo: `Promoção: ${p.nome}`,
      descricao: `${p.nome} foi promovido da base ao elenco principal.`,
      origem: "Coordenador da Base",
      impacto: { moral: 2 },
    });
    toast.success(`${p.nome} marcado como promoção ao profissional.`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Cléber Andrade · Coordenação</div>
          <h2 className="mt-1 text-3xl font-black">Categoria de Base</h2>
          <p className="text-sm text-muted-foreground">{jovens.length} jogador(es) reais registrados. A base também começa vazia.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv,.json,application/json,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}><FileUp className="mr-2 h-4 w-4" />Importar base FC26</Button>
          <Button onClick={() => setModal(true)}><Plus className="mr-2 h-4 w-4" />Adicionar jogador da base</Button>
        </div>
      </div>

      <Card className="border-teal-500/25 bg-teal-500/5 p-4">
        <div className="flex gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
          <div>
            <div className="font-semibold">Mesmo princípio do elenco profissional</div>
            <p className="mt-1 text-sm text-muted-foreground">Importe os jogadores reais do seu save ou monte os dossiês manualmente. Potencial, posição, idade, contrato e evolução ficam associados ao jogador. Nenhum nome é gerado pelo sistema.</p>
          </div>
        </div>
      </Card>

      {jovens.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Sprout className="mx-auto h-12 w-12 text-teal-300" />
          <h3 className="mt-4 text-xl font-bold">A base está vazia</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Perfeito para sua carreira real. Importe a base do FC26 ou cadastre os jovens que realmente existem no seu save.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>Importar base</Button>
            <Button onClick={() => setModal(true)}>Cadastrar primeiro jovem</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jovens.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)} className="text-left">
              <Card className="h-full p-4 transition hover:border-teal-400/60 hover:bg-teal-500/5">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-base font-bold">{p.nome}</div><div className="mt-1 text-xs text-muted-foreground">{p.pos} · {p.idade} anos · contrato {p.contratoAte || "—"}</div></div>
                  <div className="rounded-xl bg-teal-500/10 px-3 py-2 text-center"><div className="text-xl font-black">{p.overall}</div><div className="text-[9px] uppercase tracking-widest text-muted-foreground">OVR</div></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Info label="Potencial" value={p.potencial ? String(p.potencial) : "—"} />
                  <Info label="Forma" value={String(p.forma)} />
                  <Info label="Mercado" value={dinheiro(p.valorMercado, p.moedaValor)} />
                </div>
                <div className="mt-3 flex items-center justify-between"><Badge variant="outline">{p.origem === "fc26" ? "FC26" : "Manual"}</Badge><span className="text-xs text-teal-300">Abrir dossiê →</span></div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {selected && <Dossie player={selected} onClose={() => setSelected(null)} onPromover={() => { promover(selected); setSelected(null); }} />}
      {modal && <Cadastro draft={draft} set={set} onClose={() => { setModal(false); setDraft(vazio); }} onSave={salvar} />}
    </div>
  );
}

function Dossie({ player: p, onClose, onPromover }: { player: Player; onClose: () => void; onPromover: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={onClose}>
    <Card className="max-h-[90vh] w-full max-w-2xl overflow-auto p-6" onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Dossiê da base</div><h3 className="mt-1 text-2xl font-black">{p.nome}</h3><p className="text-sm text-muted-foreground">{p.pos} · {p.idade} anos</p></div><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Info label="Overall" value={String(p.overall)} /><Info label="Potencial" value={p.potencial ? String(p.potencial) : "Não informado"} /><Info label="Mercado" value={dinheiro(p.valorMercado, p.moedaValor)} />
        <Info label="Transferência" value={dinheiro(p.valorTransferencia, p.moedaTransferencia)} /><Info label="Contrato" value={p.contratoAte || "Não informado"} /><Info label="Origem" value={p.clubeOrigem || "Categorias do clube"} />
      </div>
      <div className="mt-4 rounded-xl border border-border/60 p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">Leitura de desenvolvimento</div><p className="mt-2 text-sm">Moral {p.moral}/100 · Forma {p.forma}/100 · Confiança do treinador {p.confiancaTreinador ?? "—"}/100.</p>{p.observacoes && <p className="mt-2 text-sm text-muted-foreground">{p.observacoes}</p>}</div>
      <Button className="mt-4 w-full" onClick={onPromover}><ArrowUpRight className="mr-2 h-4 w-4" />Registrar promoção ao profissional</Button>
    </Card>
  </div>;
}

function Cadastro({ draft, set, onClose, onSave }: { draft: Player; set: <K extends keyof Player>(key: K, value: Player[K]) => void; onClose: () => void; onSave: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={onClose}>
    <Card className="max-h-[92vh] w-full max-w-3xl overflow-auto p-6" onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Cadastro real</div><h3 className="text-2xl font-black">Dossiê do jogador da base</h3><p className="mt-1 text-sm text-muted-foreground">Somente jogadores reais do seu save.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nome *"><Input value={draft.nome} onChange={(e) => set("nome", e.target.value)} /></Field>
        <Field label="Posição *"><Input value={draft.pos} onChange={(e) => set("pos", e.target.value)} /></Field>
        <Field label="Idade"><Input type="number" value={draft.idade} onChange={(e) => set("idade", Number(e.target.value))} /></Field>
        <Field label="Overall"><Input type="number" min={1} max={99} value={draft.overall} onChange={(e) => set("overall", Number(e.target.value))} /></Field>
        <Field label="Potencial"><Input type="number" min={1} max={99} value={draft.potencial ?? ""} onChange={(e) => set("potencial", e.target.value ? Number(e.target.value) : undefined)} /></Field>
        <Field label="Contrato até"><Input value={draft.contratoAte} onChange={(e) => set("contratoAte", e.target.value)} /></Field>
        <Field label="Valor de mercado"><Input type="number" value={draft.valorMercado ?? ""} onChange={(e) => set("valorMercado", e.target.value ? Number(e.target.value) : undefined)} /></Field>
        <Field label="Valor de transferência"><Input type="number" value={draft.valorTransferencia ?? ""} onChange={(e) => set("valorTransferencia", e.target.value ? Number(e.target.value) : undefined)} /></Field>
        <Field label="Moral"><Input type="number" min={0} max={100} value={draft.moral} onChange={(e) => set("moral", Number(e.target.value))} /></Field>
        <Field label="Forma"><Input type="number" min={0} max={100} value={draft.forma} onChange={(e) => set("forma", Number(e.target.value))} /></Field>
        <Field label="Observações"><Input value={draft.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} /></Field>
      </div>
      <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSave}>Adicionar à base</Button></div>
    </Card>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div><label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/30 p-3"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold break-words">{value}</div></div>; }

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
import { Database, FileUp, Plus, UserRound, X, Pencil, Trash2, ChartNoAxesCombined } from "lucide-react";

export const Route = createFileRoute("/elenco")({
  component: Elenco,
  head: () => ({ meta: [
    { title: "Elenco — Central do Treinador" },
    { name: "description", content: "Elenco real da carreira, importado do FC26 ou cadastrado manualmente." },
  ]}),
});

const vazio: Player = {
  id: "",
  nome: "",
  pos: "",
  idade: 18,
  overall: 50,
  moral: 50,
  forma: 50,
  contratoAte: "",
  origem: "manual",
  moedaValor: "EUR",
  moedaTransferencia: "EUR",
};

function dinheiro(v?: number, moeda = "EUR") {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, notation: "compact", maximumFractionDigits: 1 }).format(v);
}

function Elenco() {
  const { state, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Player>(vazio);
  const [selected, setSelected] = useState<Player | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const jogadores = [...state.jogadores].sort((a, b) => b.overall - a.overall);

  function set<K extends keyof Player>(key: K, value: Player[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  function salvarManual() {
    if (!draft.nome.trim() || !draft.pos.trim()) {
      toast.error("Informe o nome real do jogador e a posição.");
      return;
    }
    addPlayer({ ...draft, id: `manual-${Date.now()}`, nome: draft.nome.trim(), pos: draft.pos.trim(), origem: "manual" });
    setModal(false);
    setDraft(vazio);
    toast.success(`${draft.nome.trim()} adicionado ao elenco`);
  }

  function importar(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parsePlayerDatabase(String(reader.result), file.name);
        if (!parsed.length) throw new Error("nenhum jogador válido");
        parsed.forEach((p) => addPlayer(p));
        toast.success(`${parsed.length} jogador(es) importado(s). Sem jogadores genéricos.`);
      } catch {
        toast.error("Não consegui ler o banco. Use CSV ou JSON com nome, posição, idade e overall.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">Elenco</h2>
          <p className="text-sm text-muted-foreground">{jogadores.length} atleta(s) cadastrados. Esta carreira não cria jogadores fictícios.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv,.json,application/json,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}><FileUp className="mr-2 h-4 w-4" />Importar banco FC26</Button>
          <Button onClick={() => setModal(true)}><Plus className="mr-2 h-4 w-4" />Adicionar jogador</Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="font-semibold">Fonte da carreira</div>
            <p className="mt-1 text-sm text-muted-foreground">Importe um banco FC26 em CSV/JSON ou monte o elenco real manualmente. O sistema preserva identidade, valor de mercado e valor de transferência; não preenche nomes genéricos.</p>
          </div>
        </div>
      </Card>

      {jogadores.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-bold">Ainda não há elenco</h3>
          <p className="mt-1 text-sm text-muted-foreground">Comece importando a base ou adicione o primeiro atleta pelo dossiê.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jogadores.map((p) => (
            <div key={p.id} onClick={() => setSelected(p)} className="cursor-pointer text-left">
              <Card className="h-full p-4 transition hover:border-primary/50 hover:bg-primary/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold">{p.nome}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.pos} · {p.idade} anos · contrato {p.contratoAte}</div>
                  </div>
                  <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
                    <div className="text-xl font-black">{p.overall}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">OVR</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/30 p-2"><div className="text-xs text-muted-foreground">Jogos</div><div className="font-semibold">{p.estatisticas?.jogos ?? 0}</div></div>
                  <div className="rounded-lg bg-muted/30 p-2"><div className="text-xs text-muted-foreground">Gols</div><div className="font-semibold">{p.estatisticas?.gols ?? 0}</div></div>
                  <div className="rounded-lg bg-muted/30 p-2"><div className="text-xs text-muted-foreground">Assist.</div><div className="font-semibold">{p.estatisticas?.assistencias ?? 0}</div></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelected(p); setDraft({ ...vazio, ...p, estatisticas: { jogos: p.estatisticas?.jogos ?? 0, gols: p.estatisticas?.gols ?? 0, assistencias: p.estatisticas?.assistencias ?? 0 } }); setEditingId(p.id); setModal(true); }}><Pencil className="mr-1 h-3 w-3" />Editar</Button>
                  <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Excluir ${p.nome} do elenco? Essa ação não pode ser desfeita.`)) { deletePlayer(p.id); if (selected?.id === p.id) setSelected(null); toast.success(`${p.nome} excluído do elenco`); } }}><Trash2 className="mr-1 h-3 w-3" />Excluir</Button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/30 p-2"><div className="text-xs text-muted-foreground">Mercado</div><div className="font-semibold">{dinheiro(p.valorMercado, p.moedaValor)}</div></div>
                  <div className="rounded-lg bg-muted/30 p-2"><div className="text-xs text-muted-foreground">Transferência</div><div className="font-semibold">{dinheiro(p.valorTransferencia, p.moedaTransferencia)}</div></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="outline">{p.origem === "fc26" ? "FC26" : p.origem === "base_externa" ? "Base externa" : "Manual"}</Badge>
                  {p.clubeOrigem && <Badge variant="secondary">veio de {p.clubeOrigem}</Badge>}
                  {p.capitao && <Badge>Capitão</Badge>}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={() => setSelected(null)}>
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-auto p-6" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Dossiê do atleta</div><h3 className="mt-1 text-2xl font-black">{selected.nome}</h3><p className="text-sm text-muted-foreground">{selected.pos} · {selected.idade} anos</p></div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Info label="Overall" value={String(selected.overall)} />
              <Info label="Potencial" value={selected.potencial ? String(selected.potencial) : "Não informado"} />
              <Info label="Mercado" value={dinheiro(selected.valorMercado, selected.moedaValor)} />
              <Info label="Transferência" value={dinheiro(selected.valorTransferencia, selected.moedaTransferencia)} />
              <Info label="Jogos" value={String(selected.estatisticas?.jogos ?? 0)} />
              <Info label="Gols" value={String(selected.estatisticas?.gols ?? 0)} />
              <Info label="Assistências" value={String(selected.estatisticas?.assistencias ?? 0)} />
              <Info label="Clube de origem" value={selected.clubeOrigem ?? "Não informado"} />
              <Info label="Contrato" value={selected.contratoAte || "Não informado"} />
            </div>
            <div className="mt-4 rounded-xl border border-border/60 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><ChartNoAxesCombined className="h-4 w-4" />Estatísticas da temporada</div>
              <p className="mt-2 text-sm">Jogos: {selected.estatisticas?.jogos ?? 0} · Gols: {selected.estatisticas?.gols ?? 0} · Assistências: {selected.estatisticas?.assistencias ?? 0}</p>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Leitura da carreira</div>
              <p className="mt-2 text-sm">Moral {selected.moral}/100 · Forma {selected.forma}/100 · Confiança {selected.confiancaTreinador ?? "—"}/100.</p>
              {selected.observacoes && <p className="mt-2 text-sm text-muted-foreground">{selected.observacoes}</p>}
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => { setDraft({ ...vazio, ...selected, estatisticas: { jogos: selected.estatisticas?.jogos ?? 0, gols: selected.estatisticas?.gols ?? 0, assistencias: selected.estatisticas?.assistencias ?? 0 } }); setEditingId(selected.id); setModal(true); }}><Pencil className="mr-2 h-4 w-4" />Editar jogador</Button>
              <Button variant="outline" onClick={() => setSelected(null)}>Fechar dossiê</Button>
            </div>
          </Card>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={() => setModal(false)}>
          <Card className="max-h-[92vh] w-full max-w-3xl overflow-auto p-6" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-widest text-muted-foreground">{editingId ? "Editar cadastro" : "Cadastro real"}</div><h3 className="text-2xl font-black">{editingId ? "Editar jogador" : "Montar dossiê do jogador"}</h3><p className="mt-1 text-sm text-muted-foreground">{editingId ? "Altere os dados e as estatísticas do atleta." : "Sem gerador de nomes. Você informa um atleta real e o sistema guarda o registro."}</p></div><Button variant="ghost" size="icon" onClick={() => setModal(false)}><X className="h-4 w-4" /></Button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome do jogador *"><Input value={draft.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: jogador do seu save" /></Field>
              <Field label="Posição *"><Input value={draft.pos} onChange={(e) => set("pos", e.target.value)} placeholder="GOL, ZAG, MC, ATA..." /></Field>
              <Field label="Idade"><Input type="number" value={draft.idade} onChange={(e) => set("idade", Number(e.target.value))} /></Field>
              <Field label="Overall FC26"><Input type="number" min={1} max={99} value={draft.overall} onChange={(e) => set("overall", Number(e.target.value))} /></Field>
              <Field label="Potencial (opcional)"><Input type="number" min={1} max={99} value={draft.potencial ?? ""} onChange={(e) => set("potencial", e.target.value ? Number(e.target.value) : undefined)} /></Field>
              <Field label="Contrato até"><Input value={draft.contratoAte} onChange={(e) => set("contratoAte", e.target.value)} placeholder="2028" /></Field>
              <Field label="Valor de mercado"><Input type="number" value={draft.valorMercado ?? ""} onChange={(e) => set("valorMercado", e.target.value ? Number(e.target.value) : undefined)} placeholder="Ex.: 2500000" /></Field>
              <Field label="Valor de transferência pago"><Input type="number" value={draft.valorTransferencia ?? ""} onChange={(e) => set("valorTransferencia", e.target.value ? Number(e.target.value) : undefined)} placeholder="Ex.: 1800000" /></Field>
              <Field label="Clube de origem"><Input value={draft.clubeOrigem ?? ""} onChange={(e) => set("clubeOrigem", e.target.value)} /></Field>
              <Field label="Data da transferência"><Input type="date" value={draft.dataTransferencia ?? ""} onChange={(e) => set("dataTransferencia", e.target.value)} /></Field>
              <Field label="Moral"><Input type="number" min={0} max={100} value={draft.moral} onChange={(e) => set("moral", Number(e.target.value))} /></Field>
              <Field label="Forma"><Input type="number" min={0} max={100} value={draft.forma} onChange={(e) => set("forma", Number(e.target.value))} /></Field>
              <Field label="Jogos"><Input type="number" min={0} value={draft.estatisticas?.jogos ?? 0} onChange={(e) => set("estatisticas", { jogos: Math.max(0, Number(e.target.value)), gols: draft.estatisticas?.gols ?? 0, assistencias: draft.estatisticas?.assistencias ?? 0 })} /></Field>
              <Field label="Gols"><Input type="number" min={0} value={draft.estatisticas?.gols ?? 0} onChange={(e) => set("estatisticas", { jogos: draft.estatisticas?.jogos ?? 0, gols: Math.max(0, Number(e.target.value)), assistencias: draft.estatisticas?.assistencias ?? 0 })} /></Field>
              <Field label="Assistências"><Input type="number" min={0} value={draft.estatisticas?.assistencias ?? 0} onChange={(e) => set("estatisticas", { jogos: draft.estatisticas?.jogos ?? 0, gols: draft.estatisticas?.gols ?? 0, assistencias: Math.max(0, Number(e.target.value)) })} /></Field>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => { setModal(false); setEditingId(null); }}>Cancelar</Button><Button onClick={salvarManual}>{editingId ? "Salvar alterações" : "Adicionar ao elenco"}</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div><label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/30 p-3"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold break-words">{value}</div></div>; }

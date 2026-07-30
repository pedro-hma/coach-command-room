import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Upload, RefreshCw, GitBranch, Loader2 } from "lucide-react";
import { useGithubSync, INTERVALO_SYNC_MS } from "@/hooks/useGithubSync";

export const Route = createFileRoute("/configuracoes")({
  component: Config,
  head: () => ({ meta: [
    { title: "Configurações — Central do Treinador" },
    { name: "description", content: "Exportar, importar e resetar dados da demonstração." },
  ]}),
});

function Config() {
  const { state, setState, resetDemo, exportJson, importJson } = useStore();
  const [nome, setNome] = useState(state.clube.nome);
  const [treinador, setTreinador] = useState(state.clube.treinador);
  const fileRef = useRef<HTMLInputElement>(null);

  function salvar() {
    setState((s) => ({ ...s, clube: { ...s.clube, nome, treinador } }));
    toast.success("Configurações salvas");
  }
  function baixar() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mundo-do-clube-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  }
  function subir(f: File) {
    const r = new FileReader();
    r.onload = () => {
      if (importJson(String(r.result))) toast.success("Estado importado");
      else toast.error("Arquivo inválido");
    };
    r.readAsText(f);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <h3 className="text-lg font-bold">Clube</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Nome do clube</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Treinador</label>
            <Input value={treinador} onChange={(e) => setTreinador(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" onClick={salvar}>Salvar</Button>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-bold">Dados da demonstração</h3>
        <p className="mt-1 text-sm text-muted-foreground">Toda a informação é salva no seu navegador (localStorage).</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={baixar}><Download className="mr-2 h-4 w-4" />Exportar JSON</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Importar JSON</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) subir(f); e.target.value = ""; }} />
          <Button variant="destructive" onClick={() => { resetDemo(); toast.success("Demonstração resetada"); }}>
            <RefreshCw className="mr-2 h-4 w-4" />Resetar demonstração
          </Button>
        </div>
      </Card>

      <SyncCard />

    </div>
  );
}

function SyncCard() {
  const { data, isFetching, refetch } = useGithubSync();
  const divergentes = data ? [...data.divergentes, ...data.somenteLocal, ...data.somenteRemoto] : [];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2"><GitBranch className="h-4 w-4" />Sincronia com o GitHub</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Verificação automática a cada {Math.round(INTERVALO_SYNC_MS / 60000)} minutos contra o último commit do repositório.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Verificar agora
        </Button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {!data && <div className="text-muted-foreground">Checando…</div>}
        {data?.erro && <div className="text-danger">Falha ao consultar o GitHub: {data.erro}</div>}
        {data?.commit && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Último commit</div>
            <div className="font-medium">{data.commit.mensagem.split("\n")[0]}</div>
            <div className="text-xs text-muted-foreground">
              {data.commit.sha.slice(0, 7)} • {new Date(data.commit.data).toLocaleString("pt-BR")}
            </div>
          </div>
        )}
        {data && !data.erro && (
          data.ok ? (
            <div className="text-primary">Tudo sincronizado ({data.totalComparados} arquivos comparados).</div>
          ) : (
            <div>
              <div className="text-orange-400">{divergentes.length} arquivo(s) divergente(s):</div>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {data.divergentes.map((f) => <li key={f}>• {f} — conteúdo diferente</li>)}
                {data.somenteLocal.map((f) => <li key={f}>• {f} — só existe localmente</li>)}
                {data.somenteRemoto.map((f) => <li key={f}>• {f} — só existe no GitHub</li>)}
              </ul>
            </div>
          )
        )}
        {data && (
          <div className="text-xs text-muted-foreground">
            Última verificação: {new Date(data.verificadoEm).toLocaleTimeString("pt-BR")}
          </div>
        )}
      </div>
    </Card>
  );
}


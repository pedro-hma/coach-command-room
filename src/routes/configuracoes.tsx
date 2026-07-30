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

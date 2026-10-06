import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Upload, RefreshCw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: Config,
  head: () => ({ meta: [
    { title: "Configurações — Central de Comando" },
    { name: "description", content: "Gerenciar carreira, dados e configurações da central." },
  ]}),
});

function Config() {
  const { state, lastSavedAt, setState, resetCareerData, deleteCareer, exportJson, importJson } = useStore();
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
    a.href = url;
    a.download = `mundo-do-clube-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function subir(f: File) {
    const r = new FileReader();
    r.onload = () => {
      if (importJson(String(r.result))) toast.success("Estado importado");
      else toast.error("Arquivo inválido");
    };
    r.readAsText(f);
  }

  function excluirCarreira() {
    const confirmado = window.confirm(
      `Excluir permanentemente a carreira "${state.clube.nome}"?\\n\\nTodos os dados salvos desta carreira neste navegador serão removidos. Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    deleteCareer();
    toast.success("Carreira excluída. Você pode criar uma nova carreira.");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <h3 className="text-lg font-bold">Carreira atual</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os dados básicos da carreira que está salva neste navegador.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Clube</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Treinador</label>
            <Input value={treinador} onChange={(e) => setTreinador(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" onClick={salvar}>Salvar alterações</Button>
      </Card>

      <Card className="border-destructive/30 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">Excluir carreira</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Apaga a carreira salva e volta para a tela inicial de criação. Use isso para começar uma nova carreira do zero.
            </p>
            <Button variant="destructive" className="mt-4" onClick={excluirCarreira}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir carreira atual
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-bold">Dados da carreira</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Faça uma cópia antes de excluir se quiser guardar esta carreira para consultar depois.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={baixar}>
            <Download className="mr-2 h-4 w-4" />Exportar JSON
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />Importar JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => {
            resetCareerData();
            toast.success("Dados esportivos resetados; identidade da carreira preservada");
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />Resetar dados esportivos
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-bold">Persistência da sessão</h3>
        <p className="mt-1 text-sm text-muted-foreground">A carreira é gravada localmente após cada alteração, novamente a cada 5 minutos e no fechamento/atualização da página.</p>
        <div className="mt-3 rounded-xl bg-muted/30 p-3 text-sm">
          Último salvamento: {lastSavedAt ? new Date(lastSavedAt).toLocaleString("pt-BR") : "aguardando primeiro salvamento"}
        </div>
      </Card>
    </div>
  );
}

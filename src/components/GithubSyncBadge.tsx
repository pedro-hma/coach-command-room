import { useGithubSync } from "@/hooks/useGithubSync";
import { cn } from "@/lib/utils";
import { GitBranch, Loader2 } from "lucide-react";

export function GithubSyncBadge({ className }: { className?: string }) {
  const { data, isFetching, refetch } = useGithubSync();

  const estado = !data ? "checando" : data.erro ? "erro" : data.ok ? "ok" : "divergente";
  const cor =
    estado === "ok" ? "text-primary" : estado === "divergente" ? "text-orange-400" : estado === "erro" ? "text-danger" : "text-muted-foreground";
  const rotulo =
    estado === "ok" ? "Sincronizado" : estado === "divergente"
      ? `${data!.divergentes.length + data!.somenteLocal.length + data!.somenteRemoto.length} divergência(s)`
      : estado === "erro" ? "Falha ao checar" : "Checando…";

  return (
    <button
      type="button"
      onClick={() => refetch()}
      title="Verificar sincronia com o GitHub"
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs transition-colors hover:border-primary/60",
        cor,
        className,
      )}
    >
      {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{rotulo}</span>
    </button>
  );
}

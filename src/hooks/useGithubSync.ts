import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { checarSincroniaGithub } from "@/lib/github-sync.functions";

export const INTERVALO_SYNC_MS = 5 * 60 * 1000;

export function useGithubSync(intervaloMs = INTERVALO_SYNC_MS) {
  const checar = useServerFn(checarSincroniaGithub);
  const query = useQuery({
    queryKey: ["github-sync"],
    queryFn: () => checar(),
    refetchInterval: intervaloMs,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const ultimoAlerta = useRef<string | null>(null);

  useEffect(() => {
    const d = query.data;
    if (!d) return;
    const assinatura = d.erro
      ? `erro:${d.erro}`
      : `${d.commit?.sha}:${d.divergentes.join(",")}|${d.somenteLocal.join(",")}|${d.somenteRemoto.join(",")}`;
    if (ultimoAlerta.current === assinatura) return;
    ultimoAlerta.current = assinatura;

    if (d.erro) {
      toast.error("Não foi possível verificar o GitHub", { description: d.erro.slice(0, 160) });
      return;
    }
    if (!d.ok) {
      const total = d.divergentes.length + d.somenteLocal.length + d.somenteRemoto.length;
      toast.warning(`Divergência com o GitHub: ${total} arquivo(s)`, {
        description: [...d.divergentes, ...d.somenteLocal, ...d.somenteRemoto].slice(0, 4).join(", "),
        duration: 8000,
      });
    }
  }, [query.data]);

  return query;
}

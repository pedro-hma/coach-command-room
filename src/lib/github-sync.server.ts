// Compara os arquivos locais (embutidos no build) com o último commit do GitHub.

const REPO = "pedro-hma/coach-command-room";

// Snapshot dos arquivos-fonte no momento do build.
const localFiles = import.meta.glob("/src/**/*.{ts,tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const IGNORADOS = ["/src/routeTree.gen.ts"];

async function gitBlobSha(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  const header = new TextEncoder().encode(`blob ${bytes.length}\0`);
  const full = new Uint8Array(header.length + bytes.length);
  full.set(header, 0);
  full.set(bytes, header.length);
  const digest = await crypto.subtle.digest("SHA-1", full);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type SyncStatus = {
  ok: boolean;
  erro?: string;
  commit?: { sha: string; mensagem: string; data: string; url: string };
  divergentes: string[];
  somenteLocal: string[];
  somenteRemoto: string[];
  totalComparados: number;
  verificadoEm: string;
};

async function gh(path: string, token?: string) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "mundo-do-clube-sync",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json() as Promise<any>;
}

export async function verificarSincronia(): Promise<SyncStatus> {
  const verificadoEm = new Date().toISOString();
  try {
    const token = process.env.GITHUB_TOKEN;
    const commits = await gh("/commits?per_page=1", token);
    const head = commits[0];
    const tree = await gh(`/git/trees/${head.sha}?recursive=1`, token);

    const remoto = new Map<string, string>();
    for (const item of tree.tree as Array<{ path: string; type: string; sha: string }>) {
      if (item.type === "blob" && item.path.startsWith("src/")) {
        remoto.set(`/${item.path}`, item.sha);
      }
    }

    const divergentes: string[] = [];
    const somenteLocal: string[] = [];
    let totalComparados = 0;

    for (const [path, content] of Object.entries(localFiles)) {
      if (IGNORADOS.includes(path)) continue;
      const remotoSha = remoto.get(path);
      if (!remotoSha) {
        somenteLocal.push(path);
        continue;
      }
      totalComparados++;
      const localSha = await gitBlobSha(content);
      if (localSha !== remotoSha) divergentes.push(path);
      remoto.delete(path);
    }

    const somenteRemoto = Array.from(remoto.keys()).filter(
      (p) => /\.(ts|tsx|css)$/.test(p) && !IGNORADOS.includes(p),
    );

    return {
      ok: divergentes.length === 0 && somenteLocal.length === 0 && somenteRemoto.length === 0,
      commit: {
        sha: head.sha,
        mensagem: head.commit.message,
        data: head.commit.committer.date,
        url: head.html_url,
      },
      divergentes,
      somenteLocal,
      somenteRemoto,
      totalComparados,
      verificadoEm,
    };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : String(e),
      divergentes: [],
      somenteLocal: [],
      somenteRemoto: [],
      totalComparados: 0,
      verificadoEm,
    };
  }
}

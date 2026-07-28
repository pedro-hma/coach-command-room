import type { AgentId, ClubState } from "./types";
import { AGENTS } from "./agents";

/** Resumo textual do estado do clube usado como contexto dos agentes de IA. */
export function contextoClube(s: ClubState): string {
  const linhas: string[] = [];
  linhas.push(
    `Clube: ${s.clube.nome ?? "clube"} | Temporada ${s.clube.temporada} | Forma recente: ${s.clube.forma}`,
  );
  linhas.push(
    `Próximo jogo: ${s.clube.proximoAdversario} em ${s.clube.proximoJogoDias} dias`,
  );
  linhas.push(
    `Orçamento livre: R$ ${(s.clube.orcamento / 1_000_000).toFixed(1)} mi | Prioridade da janela: ${s.clube.prioridadeJanela}`,
  );
  linhas.push(
    "Elenco: " +
      s.jogadores
        .map(
          (p) =>
            `${p.nome} (${p.pos}, ${p.idade}a, geral ${p.overall}, forma ${p.forma}, moral ${p.moral}${p.capitao ? ", capitão" : ""}${p.jovem ? ", base" : ""}${p.lesionado ? ", lesionado" : ""}, contrato até ${p.contratoAte})`,
        )
        .join("; "),
  );
  linhas.push(
    "Lesionados: " +
      (s.lesoes.length
        ? s.lesoes
            .map((l) => {
              const j = s.jogadores.find((p) => p.id === l.jogadorId);
              return `${j?.nome ?? "atleta"} — ${l.descricao}, ~${l.semanas} semanas`;
            })
            .join("; ")
        : "nenhum"),
  );
  const dec = s.decisoes.slice(0, 5);
  linhas.push(
    "Decisões recentes do treinador: " +
      (dec.length ? dec.map((d) => `${d.titulo} (${d.origem})`).join("; ") : "nenhuma ainda"),
  );
  return linhas.join("\n");
}

export function personaAgente(id: AgentId, confianca: number): string {
  const a = AGENTS[id];
  return `Você é ${a.nome}, ${a.cargo}. Personalidade: ${a.personalidade}. Responsabilidade: ${a.responsabilidade}. Sua confiança atual no treinador é ${confianca}/100. Fale apenas dentro da sua área; se o assunto for de outro departamento, diga a quem encaminhar.`;
}

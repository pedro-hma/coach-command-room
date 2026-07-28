import type { AgentId, ClubState } from "./types";
import { AGENTS } from "./agents";

function dinheiro(valor: number, moeda = "EUR") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);
}

/** Resumo do mundo da carreira. Identidade/contrato são dados reais; moral e forma pertencem ao save. */
export function contextoClube(s: ClubState): string {
  const linhas: string[] = [];
  linhas.push(
    `Clube: ${s.clube.nome} | ${s.clube.divisao}${s.clube.pais ? `, ${s.clube.pais}` : ""} | Temporada ${s.clube.temporada}`,
  );
  linhas.push(
    `Situação no save: ${s.clube.posicaoLiga ? `${s.clube.posicaoLiga}º lugar, ${s.clube.pontos ?? 0} pontos` : "posição não informada"} | Forma ${s.clube.forma} | Moral ${s.clube.moralElenco}/100 | Pressão ${s.clube.pressaoDiretoria ?? 0}/100`,
  );
  linhas.push(`Próximo jogo: ${s.clube.proximoAdversario} em ${s.clube.proximoJogoDias} dias`);
  linhas.push(
    `Orçamento livre: ${dinheiro(s.clube.orcamento, s.clube.moeda)} | Prioridade da janela: ${s.clube.prioridadeJanela}`,
  );
  linhas.push(
    "Elenco (identidade, idade, posição e contrato são referência real; overall, potencial, moral, forma e confiança são dados simulados do save): " +
      s.jogadores
        .map((p) => {
          const valor = p.valorMercado ? `, valor de referência ${dinheiro(p.valorMercado, p.moedaValor)}` : "";
          const potencial = p.potencial ? `, potencial ${p.potencial}` : "";
          return `${p.nome} (${p.pos}, ${p.idade}a, geral ${p.overall}${potencial}, forma ${p.forma}, moral ${p.moral}, confiança ${p.confiancaTreinador ?? "n/i"}${valor}${p.papelElenco ? `, papel ${p.papelElenco}` : ""}${p.capitao ? ", capitão" : ""}${p.jovem ? ", jovem" : ""}${p.lesionado ? ", lesionado" : ""}, contrato até ${p.contratoAte})`;
        })
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
  return `Você é ${a.nome}, ${a.cargo}. Personalidade: ${a.personalidade}. Responsabilidade: ${a.responsabilidade}. Sua confiança atual no treinador é ${confianca}/100. Fale apenas dentro da sua área; se o assunto for de outro departamento, diga a quem encaminhar. Nunca apresente moral, forma, confiança ou conflitos simulados como fatos sobre a pessoa real fora desta carreira.`;
}
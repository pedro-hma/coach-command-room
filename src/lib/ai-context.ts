import type { AgentId, ClubState } from "./types";
import { AGENTS } from "./agents";

function dinheiro(valor: number, moeda = "EUR") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, notation: "compact", maximumFractionDigits: 1 }).format(valor);
}

export function contextoClube(s: ClubState): string {
  const linhas: string[] = [];
  linhas.push(`IDENTIDADE: Clube ${s.clube.nome || "não informado"} | ${s.clube.divisao || "divisão não informada"} | ${s.clube.pais || "país não informado"} | temporada ${s.clube.temporada || "não informada"} | treinador ${s.clube.treinador || "não informado"}`);
  linhas.push(`SITUAÇÃO: orçamento ${dinheiro(s.clube.orcamento, s.clube.moeda)} | moral ${s.clube.moralElenco}/100 | pressão ${s.clube.pressaoDiretoria ?? 0}/100 | forma ${s.clube.forma || "não registrada"}`);

  const jogos = s.calendario.filter((f) => f.jogado).slice(-5).reverse();
  linhas.push("PARTIDAS REGISTRADAS: " + (jogos.length ? jogos.map((f) => {
    const placar = f.resultado ?? (f.placarCasa != null ? `${f.placarCasa}-${f.placarFora}` : "sem placar");
    return `${f.adversario} | ${placar} | ${f.competicao} | ${f.casa ? "casa" : "fora"}${f.observacoes ? " | " + f.observacoes : ""}`;
  }).join("; ") : "nenhuma"));
  const proximos = s.calendario.filter((f) => !f.jogado).slice(0, 3);
  linhas.push("PRÓXIMAS PARTIDAS: " + (proximos.length ? proximos.map((f) => `${f.adversario} | ${f.competicao} | ${new Date(f.data).toLocaleDateString("pt-BR")}`).join("; ") : "nenhuma"));

  linhas.push("ELENCO REAL REGISTRADO: " + (s.jogadores.length ? s.jogadores.map((p) => {
    const valor = p.valorMercado != null ? `, mercado ${dinheiro(p.valorMercado, p.moedaValor)}` : "";
    const transferencia = p.valorTransferencia != null ? `, transferência ${dinheiro(p.valorTransferencia, p.moedaTransferencia)}` : "";
    return `${p.nome} | ${p.pos} | ${p.idade}a | OVR ${p.overall}${p.potencial ? " | POT " + p.potencial : ""}${valor}${transferencia} | contrato ${p.contratoAte}${p.clubeOrigem ? " | veio de " + p.clubeOrigem : ""}${p.lesionado ? " | lesionado" : ""}`;
  }).join("; ") : "nenhum jogador cadastrado"));

  linhas.push("LESÕES REGISTRADAS: " + (s.lesoes.length ? s.lesoes.map((l) => {
    const p = s.jogadores.find((x) => x.id === l.jogadorId);
    return `${p?.nome ?? "atleta"} — ${l.descricao}, ~${l.semanas} semanas`;
  }).join("; ") : "nenhuma"));
  linhas.push("DECISÕES RECENTES: " + (s.decisoes.length ? s.decisoes.slice(0, 8).map((d) => `${d.titulo} | ${d.descricao}`).join("; ") : "nenhuma"));
  linhas.push("REUNIÕES RECENTES: " + (s.reunioes.length ? s.reunioes.slice(0, 4).map((m) => `${m.tema} | síntese: ${m.sintese} | recomendação: ${m.recomendacao}`).join("; ") : "nenhuma"));
  linhas.push("PENDÊNCIAS: " + (s.pendencias.length ? s.pendencias.map((p) => p.descricao).join("; ") : "nenhuma"));
  return linhas.join("\n");
}

export function personaAgente(id: AgentId, confianca: number): string {
  const a = AGENTS[id];
  return `Você é ${a.nome}, ${a.cargo}. Personalidade: ${a.personalidade}. Responsabilidade: ${a.responsabilidade}. Confiança atual no treinador: ${confianca}/100. Sua memória registrada deve orientar continuidade, mas nunca pode virar fato não sustentado pelo estado.`;
}

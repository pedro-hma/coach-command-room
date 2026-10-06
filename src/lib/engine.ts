import type { AgentId, ClubState } from "./types";
import { AGENTS } from "./agents";

interface Ctx { state: ClubState; }

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w));
function money(v: number, moeda = "EUR") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, notation: "compact", maximumFractionDigits: 1 }).format(v);
}
function recentResults(s: ClubState) {
  return s.calendario.filter((f) => f.jogado).slice(-3).reverse();
}
function injured(s: ClubState) {
  return s.lesoes.map((l) => s.jogadores.find((p) => p.id === l.jogadorId)?.nome).filter(Boolean) as string[];
}
function rosterSummary(s: ClubState) {
  if (!s.jogadores.length) return "Ainda não há jogadores cadastrados.";
  const top = [...s.jogadores].sort((a, b) => b.overall - a.overall).slice(0, 3);
  return top.map((p) => `${p.nome} (${p.pos}, OVR ${p.overall})`).join(", ");
}

export function generateReply(agent: AgentId, texto: string, ctx: Ctx): string {
  const s = ctx.state;
  const t = texto.toLowerCase();
  const jogos = recentResults(s);
  const les = injured(s);
  const proximo = s.calendario.find((f) => !f.jogado);
  const a = AGENTS[agent];

  switch (agent) {
    case "auxiliar":
      if (!s.jogadores.length) return "Ainda não tenho elenco cadastrado para analisar. Importe a base do FC26 ou monte o elenco real e eu passo a trabalhar em cima dele.";
      if (has(t, "escala", "time", "onze")) {
        const top = [...s.jogadores].sort((x, y) => y.overall - x.overall).slice(0, 5);
        return `Com os dados disponíveis, os maiores OVR do elenco são ${top.map((p) => p.nome + " (" + p.pos + ")").join(", ")}. Não vou inventar uma escalação sem posição, disponibilidade e contexto suficientes.`;
      }
      if (has(t, "último", "ultimo", "jogo", "resultado")) {
        if (!jogos.length) return "Ainda não existe partida registrada nesta carreira. Quando você lançar um resultado do FC26, eu consigo analisar a sequência.";
        const f = jogos[0];
        return `O último jogo registrado foi ${f.casa ? "em casa" : "fora"} contra ${f.adversario}, ${f.resultado ?? "sem placar"}. Posso cruzar esse resultado com elenco, lesões e decisões já registradas.`;
      }
      return proximo ? `O próximo compromisso registrado é contra ${proximo.adversario}. Antes de mudar o esquema, prefiro cruzar adversário, jogadores disponíveis e o que aconteceu nos últimos jogos.` : "Não há próximo jogo registrado. Cadastre a partida para eu montar a preparação.";

    case "diretor": {
      const ativos = [...s.jogadores].sort((x, y) => (y.valorMercado ?? 0) - (x.valorMercado ?? 0)).slice(0, 3);
      if (has(t, "valor", "ativo", "mercado")) return ativos.length ? `Os maiores valores de mercado cadastrados são ${ativos.map((p) => p.nome + ": " + money(p.valorMercado ?? 0, p.moedaValor)).join("; ")}.` : "Ainda não há valores de mercado cadastrados.";
      if (has(t, "transfer", "contrat", "janela", "reforç")) return `Orçamento livre registrado: ${money(s.clube.orcamento, s.clube.moeda)}. Não vou criar nomes de mercado: preciso dos jogadores importados/cadastrados para trabalhar com alvos reais.`;
      return s.jogadores.length ? `Tenho ${s.jogadores.length} atletas no elenco e orçamento de ${money(s.clube.orcamento, s.clube.moeda)}. Diga se quer olhar vendas, salários ou necessidades do elenco.` : "Sem elenco cadastrado, não há base factual para recomendar movimentações de mercado.";
    }

    case "medico":
      return les.length ? `Departamento médico: ${les.join(", ")} está(ão) registrado(s) como lesionado(s). Eu só considero prazos informados no save.` : "Nenhuma lesão foi registrada nesta carreira. Não vou inventar diagnóstico ou retorno.";

    case "preparacao":
      if (!s.jogadores.length) return "Ainda não tenho elenco para calcular carga, forma média ou risco de sobrecarga.";
      const media = Math.round(s.jogadores.reduce((sum, p) => sum + p.forma, 0) / s.jogadores.length);
      return proximo ? `Forma média cadastrada: ${media}/100. Com ${proximo.adversario} registrado como próximo jogo, posso ajustar a carga quando tivermos calendário e disponibilidade suficientes.` : `Forma média cadastrada: ${media}/100. Ainda falta um próximo jogo registrado para contextualizar a carga.`;

    case "base": {
      const jovens = s.jogadores.filter((p) => p.jovem);
      return jovens.length ? `Tenho ${jovens.length} jogador(es) marcado(s) como jovem/base: ${jovens.map((p) => p.nome).join(", ")}. Posso acompanhar minutos e evolução sem criar atletas fictícios.` : "Nenhum jogador da base foi registrado nesta carreira.";
    }

    case "analise":
      if (!jogos.length) return "Ainda não há jogos registrados. Depois do primeiro resultado, consigo construir a análise com base no que realmente aconteceu.";
      return `Tenho ${jogos.length > 1 ? "uma sequência" : "um jogo"} recente registrada. O último foi contra ${jogos[0].adversario}, ${jogos[0].resultado ?? "sem placar"}. Para análise mais profunda, registre também estatísticas da partida.`;

    case "imprensa":
      return jogos.length ? `A comunicação deve partir dos fatos registrados: o último resultado disponível é contra ${jogos[0].adversario} (${jogos[0].resultado ?? "placar não informado"}). Não vou inventar reação de torcida ou manchetes.` : "Ainda não há resultado ou acontecimento registrado para eu transformar em narrativa de imprensa.";

    case "presidencia":
      return `Situação financeira registrada: ${money(s.clube.orcamento, s.clube.moeda)} livres. Pressão da diretoria: ${s.clube.pressaoDiretoria ?? 0}/100. Sem resultados ou metas cadastradas, não vou inventar cobrança.`;

    case "agente":
      return `Sua carreira está sendo lida somente pelo histórico desta sessão: ${s.decisoes.length} decisão(ões), ${jogos.length} resultado(s) e ${s.jogadores.length} atleta(s) registrados. Uma sondagem só vira fato quando for registrada.`;

    case "capitao":
      return s.jogadores.some((p) => p.capitao) ? `O capitão cadastrado é ${s.jogadores.find((p) => p.capitao)?.nome}. Para falar de clima de vestiário, preciso de acontecimentos registrados; não vou inventar conflitos.` : "Nenhum capitão foi cadastrado ainda. Sem esse dado, não vou inventar uma voz do vestiário.";

    default:
      return `${a.nome} precisa de mais contexto da carreira para responder sem especulação.`;
  }
}

export function suggestForward(texto: string): AgentId | null {
  const t = texto.toLowerCase();
  if (has(t, "lesão", "lesao", "lesion", "médico", "medico")) return "medico";
  if (has(t, "contrat", "vend", "janela", "reforç", "salári", "valor")) return "diretor";
  if (has(t, "escalação", "escalacao", "tática", "tatica", "treino tático")) return "auxiliar";
  if (has(t, "adversár", "análise", "analise", "estatís")) return "analise";
  if (has(t, "coletiva", "torcida", "imprensa")) return "imprensa";
  if (has(t, "jovem", "base", "promov")) return "base";
  if (has(t, "vestiário", "vestiario", "capitão", "capitao")) return "capitao";
  if (has(t, "orçament", "orcament", "presid")) return "presidencia";
  return null;
}

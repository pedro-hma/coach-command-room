import type { AgentId, ClubState } from "./types";
import { AGENTS } from "./agents";

interface Ctx {
  state: ClubState;
}

const kw = (t: string, ...arr: string[]) => arr.some((k) => t.toLowerCase().includes(k));

function fmtMoeda(v: number) {
  return "R$ " + (v / 1_000_000).toFixed(1).replace(".", ",") + " mi";
}

function lesionadosTxt(s: ClubState) {
  if (!s.lesoes.length) return "não temos lesionados no momento";
  return s.lesoes
    .map((l) => {
      const j = s.jogadores.find((p) => p.id === l.jogadorId);
      return `${j?.nome ?? "atleta"} (${l.descricao}, ~${l.semanas} sem)`;
    })
    .join("; ");
}

export function generateReply(agent: AgentId, texto: string, ctx: Ctx): string {
  const s = ctx.state;
  const a = AGENTS[agent];
  const t = texto.toLowerCase();
  const jogo = `${s.clube.proximoAdversario} em ${s.clube.proximoJogoDias} dias`;

  const escalao = s.jogadores;
  const jovens = escalao.filter((p) => p.jovem);
  const capitao = escalao.find((p) => p.capitao);

  // por agente
  switch (agent) {
    case "auxiliar":
      if (kw(t, "escalação", "escalacao", "escalar", "time", "onze"))
        return `Treinador, para ${jogo} sugiro 4-3-3 com ${capitao?.nome ?? "capitão"} liderando a zaga. Ravi no gol, Caio Vidal como volante de saída e Diego Marín pela direita. ${s.lesoes.length ? `Sem contar com ${lesionadosTxt(s)}.` : ""}`;
      if (kw(t, "esquema", "tática", "tatica", "formação"))
        return `Nossa forma recente é ${s.clube.forma}. Manter 4-3-3 nos deu equilíbrio; se o ${s.clube.proximoAdversario} vier fechado, testo 4-2-3-1 no segundo tempo.`;
      if (kw(t, "último", "ultimo", "jogo", "análise"))
        return `Vencemos o último 2-1 em casa. Criamos volume pelos lados, mas cedemos transições. Ajuste: pressão no meio-campo.`;
      return `Certo, treinador. Foco no ${s.clube.proximoAdversario}. O que precisa decidir agora?`;

    case "diretor":
      if (kw(t, "janela", "mercado", "contrat", "reforç"))
        return `Prioridade atual: ${s.clube.prioridadeJanela}. Orçamento livre: ${fmtMoeda(s.clube.orcamento)}. Tenho 3 nomes mapeados no meio-campo — posso trazer proposta formal se autorizar.`;
      if (kw(t, "vend", "sair", "saída"))
        return `Podemos abrir negociação por Hugo Prata (32) e Rodrigo Neves (33). Liberaria cerca de R$ 3,2 mi em folha por temporada.`;
      if (kw(t, "folha", "salári", "salario"))
        return `A folha está enxuta para a divisão. Se renovarmos ${capitao?.nome ?? "o capitão"}, ele pesa +12% no bloco defesa.`;
      if (kw(t, "renov"))
        return `Sobre renovação: recomendo fechar com ${capitao?.nome} por 2 anos, cláusula de saída em R$ 6 mi. Evita ruído no vestiário.`;
      return `Estou no seu comando. Prioridade da janela hoje é ${s.clube.prioridadeJanela} — mantemos ou muda?`;

    case "medico":
      return `Departamento médico: ${lesionadosTxt(s)}. ${s.lesoes.length ? "Nenhum retorna para o próximo jogo com segurança." : "Elenco 100% disponível."} Recomendo carga leve na véspera.`;

    case "preparacao": {
      const media = Math.round(escalao.reduce((x, p) => x + p.forma, 0) / escalao.length);
      if (kw(t, "carga", "treino", "forte", "intens"))
        return `Com jogo em ${s.clube.proximoJogoDias} dias, sugiro 1 sessão forte (D-3), regenerativa D-2 e ativação D-1. Risco de sobrecarga hoje é moderado.`;
      return `Forma média do elenco: ${media}/100. Atenção redobrada com Rodrigo Neves (66) e retornos pós-lesão.`;
    }

    case "base":
      if (kw(t, "promov", "subir", "jovem"))
        return `Miguel Prado (19, meia) está pronto — pediu chance no coletivo dessa semana. Kaique Ferrer e Erik Sanches vêm logo atrás. Total de ${jovens.length} promessas no radar.`;
      return `Base saudável. Se quiser, promovo Miguel Prado ao grupo principal para o jogo contra ${s.clube.proximoAdversario}.`;

    case "analise":
      if (kw(t, "adversár", "próximo", "proximo", s.clube.proximoAdversario.toLowerCase()))
        return `${s.clube.proximoAdversario} joga em 5-4-1, força na bola parada (4 gols nas últimas 5 partidas). Vulnerável no corredor esquerdo — Dener Alves pode explorar.`;
      if (kw(t, "fraco", "fraqueza", "problema"))
        return `Nosso xG concedido cresceu 18% após transição defesa-ataque perdida. Precisamos de meia posicional. Confirma prioridade meio-campo.`;
      if (kw(t, "chance", "criar"))
        return `Criamos 62% das chances pelo corredor direito. Diego Marín + Túlio Rezende são o principal duplex.`;
      return `Tenho relatórios dos últimos 5 jogos. Sobre o que quer que eu me aprofunde?`;

    case "imprensa":
      if (kw(t, "coletiva", "declaração", "declarac"))
        return `Sugestão de fala: reforce foco no coletivo, cite o esforço na vitória por 2-1 e evite falar de arbitragem. Torcida quer ouvir sobre reforços.`;
      if (kw(t, "torcida", "sócio"))
        return `Termômetro da torcida: 62% aprova o trabalho, cobrança por reforço no meio (${s.clube.prioridadeJanela}). Nenhum protesto agendado.`;
      return `Posso preparar nota oficial ou roteiro de coletiva. Qual assunto?`;

    case "presidencia":
      if (kw(t, "orçament", "orcament", "verba", "dinheiro"))
        return `Orçamento atual: ${fmtMoeda(s.clube.orcamento)}. Só libero aumento se apresentar plano com retorno esportivo claro.`;
      if (kw(t, "meta", "objetivo"))
        return `Meta contratual: G-4 na temporada ${s.clube.temporada}. Estamos em rota, mas a diretoria observa cada resultado.`;
      if (kw(t, "aprovaç", "cargo", "demiss"))
        return `Você tem meu apoio — hoje. Uma sequência ruim muda o cenário rapidamente.`;
      return `Fale rápido, treinador, tenho conselho em 20 minutos.`;

    case "agente":
      if (kw(t, "propost", "clube", "sair"))
        return `Nada firme no radar. Um clube da 1ª divisão perguntou informalmente — se ganharmos os próximos 3, viro sondagem oficial.`;
      if (kw(t, "imagem", "mídia"))
        return `Sua imagem está estável. Um bom desempenho contra ${s.clube.proximoAdversario} melhora sua cotação.`;
      return `Confia em mim. Foca no jogo — carreira é longa. Quer que eu movimente algo nos bastidores?`;

    case "capitao":
      if (kw(t, "vestiário", "vestiario", "clima", "grupo"))
        return `Grupo firme, professor. Só o Rodrigo Neves tá quieto — perdeu espaço. E o pessoal quer saber da minha renovação, tá pesando aqui dentro.`;
      if (kw(t, "renov"))
        return `Direto ao ponto: quero ficar. Se a diretoria fizer proposta digna, fecho hoje. Se enrolar, o grupo sente.`;
      return `Pode contar comigo dentro e fora de campo. Precisa que eu converse com alguém?`;
  }

  return `${a.nome} anotou. Me dá um contexto a mais que já te respondo com base nos dados que temos.`;
}

/** Encaminhamento simples baseado em palavras-chave. */
export function suggestForward(texto: string): AgentId | null {
  const t = texto.toLowerCase();
  if (kw(t, "lesão", "lesao", "lesion", "médico", "medico")) return "medico";
  if (kw(t, "contrat", "vend", "janela", "reforç", "salári")) return "diretor";
  if (kw(t, "escalação", "escalacao", "tática", "tatica", "treino tático")) return "auxiliar";
  if (kw(t, "adversár", "análise", "analise", "estatís")) return "analise";
  if (kw(t, "coletiva", "torcida", "imprensa")) return "imprensa";
  if (kw(t, "jovem", "base", "promov")) return "base";
  if (kw(t, "vestiário", "vestiario", "capitão", "capitao")) return "capitao";
  if (kw(t, "orçament", "orcament", "presid")) return "presidencia";
  return null;
}

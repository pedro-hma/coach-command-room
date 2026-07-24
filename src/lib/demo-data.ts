import type { ClubState, Player } from "./types";

const jogadores: Player[] = [
  { id: "p1", nome: "Ravi Monteiro", pos: "GOL", idade: 29, overall: 78, moral: 72, forma: 80, contratoAte: "2027" },
  { id: "p2", nome: "Léo Bastos", pos: "GOL", idade: 22, overall: 68, moral: 65, forma: 74, jovem: true, contratoAte: "2028" },
  { id: "p3", nome: "Ítalo Fontes", pos: "ZAG", idade: 31, overall: 80, moral: 78, forma: 76, capitao: true, contratoAte: "2026" },
  { id: "p4", nome: "Bruno Carvalho", pos: "ZAG", idade: 27, overall: 76, moral: 70, forma: 78, contratoAte: "2027" },
  { id: "p5", nome: "Dener Alves", pos: "LAT", idade: 24, overall: 74, moral: 68, forma: 82, contratoAte: "2028" },
  { id: "p6", nome: "Fabinho Souza", pos: "LAT", idade: 30, overall: 72, moral: 60, forma: 55, lesionado: true, contratoAte: "2026" },
  { id: "p7", nome: "Caio Vidal", pos: "VOL", idade: 26, overall: 77, moral: 75, forma: 79, contratoAte: "2028" },
  { id: "p8", nome: "Rodrigo Neves", pos: "VOL", idade: 33, overall: 74, moral: 62, forma: 66, contratoAte: "2026" },
  { id: "p9", nome: "Miguel Prado", pos: "MEI", idade: 19, overall: 71, moral: 88, forma: 85, jovem: true, contratoAte: "2029" },
  { id: "p10", nome: "Vinícius Rangel", pos: "MEI", idade: 28, overall: 79, moral: 73, forma: 80, contratoAte: "2027" },
  { id: "p11", nome: "Túlio Rezende", pos: "PON", idade: 25, overall: 76, moral: 70, forma: 78, contratoAte: "2027" },
  { id: "p12", nome: "Kaique Ferrer", pos: "PON", idade: 20, overall: 72, moral: 82, forma: 84, jovem: true, contratoAte: "2029" },
  { id: "p13", nome: "Diego Marín", pos: "ATA", idade: 27, overall: 81, moral: 74, forma: 77, contratoAte: "2026" },
  { id: "p14", nome: "Wallace Silva", pos: "ATA", idade: 23, overall: 74, moral: 55, forma: 50, lesionado: true, contratoAte: "2027" },
  { id: "p15", nome: "Hugo Prata", pos: "MEI", idade: 32, overall: 73, moral: 68, forma: 71, contratoAte: "2026" },
  { id: "p16", nome: "Erik Sanches", pos: "ATA", idade: 21, overall: 70, moral: 80, forma: 82, jovem: true, contratoAte: "2028" },
];

export function createDemoState(): ClubState {
  const now = Date.now();
  const dia = 86400000;
  return {
    onboarded: false,
    clube: {
      nome: "Atlético Aurora",
      treinador: "Dante Silva",
      divisao: "Segunda Divisão Nacional",
      temporada: "2026/27",
      orcamento: 18_000_000,
      moralElenco: 70,
      prioridadeJanela: "meio",
      forma: "V E V E D",
      proximoJogoDias: 4,
      proximoAdversario: "União do Norte",
    },
    jogadores,
    lesoes: [
      { jogadorId: "p6", descricao: "Estiramento na coxa esquerda", semanas: 3 },
      { jogadorId: "p14", descricao: "Entorse de tornozelo grau 2", semanas: 5 },
    ],
    calendario: [
      { id: "f-1", data: new Date(now - dia * 3).toISOString(), adversario: "Ferroviário Sul", competicao: "2ª Divisão", casa: true, resultado: "2-1", jogado: true },
      { id: "f-2", data: new Date(now - dia * 10).toISOString(), adversario: "Grêmio Portuário", competicao: "2ª Divisão", casa: false, resultado: "1-1", jogado: true },
      { id: "f-3", data: new Date(now - dia * 17).toISOString(), adversario: "Cruzeiro do Sul", competicao: "2ª Divisão", casa: true, resultado: "3-2", jogado: true },
      { id: "f-4", data: new Date(now - dia * 24).toISOString(), adversario: "Vila Nova FC", competicao: "2ª Divisão", casa: false, resultado: "1-1", jogado: true },
      { id: "f-5", data: new Date(now - dia * 31).toISOString(), adversario: "Náutico Real", competicao: "2ª Divisão", casa: true, resultado: "0-1", jogado: true },
      { id: "f-p1", data: new Date(now + dia * 4).toISOString(), adversario: "União do Norte", competicao: "2ª Divisão", casa: true },
      { id: "f-p2", data: new Date(now + dia * 11).toISOString(), adversario: "Estrela do Vale", competicao: "2ª Divisão", casa: false },
      { id: "f-p3", data: new Date(now + dia * 18).toISOString(), adversario: "Bragantino B", competicao: "Copa Regional", casa: true },
    ],
    decisoes: [
      {
        id: "d-seed",
        ts: now - dia * 5,
        titulo: "Sistema tático definido em 4-3-3",
        descricao: "Após reunião com Auxiliar e Análise, esquema base fixado em 4-3-3.",
        origem: "auxiliar",
      },
    ],
    inbox: [
      {
        id: "i-seed-1",
        ts: now - dia * 1,
        de: "capitao",
        para: "diretor",
        assunto: "Renovação do capitão Ítalo Fontes precisa de resposta",
      },
      {
        id: "i-seed-2",
        ts: now - dia * 2,
        de: "base",
        para: "auxiliar",
        assunto: "Miguel Prado pronto para subir ao profissional",
      },
    ],
    reunioes: [],
    pendencias: [
      { jogadorId: "p3", tipo: "renovacao", descricao: "Renovar contrato do capitão Ítolo Fontes (vence em 2026)" },
      { jogadorId: "p9", tipo: "promocao", descricao: "Promover Miguel Prado ao elenco principal" },
      { jogadorId: "p12", tipo: "promocao", descricao: "Definir prioridade da janela: reforço para o meio-campo" },
    ],
    chats: {
      diretor: [], auxiliar: [], medico: [], preparacao: [], base: [],
      analise: [], imprensa: [], presidencia: [], agente: [], capitao: [],
    },
    confianca: {
      diretor: 78, auxiliar: 88, medico: 82, preparacao: 80, base: 75,
      analise: 84, imprensa: 70, presidencia: 65, agente: 90, capitao: 85,
    },
    memoriasAgentes: {
      diretor: ["Prioridade da janela em aberto"],
      auxiliar: ["Esquema 4-3-3 aprovado"],
      medico: ["2 atletas em recuperação"],
      preparacao: ["Semana com jogo em 4 dias"],
      base: ["Miguel Prado em observação"],
      analise: ["Próximo: União do Norte, joga em 5-4-1"],
      imprensa: ["Torcida cobra reforços"],
      presidencia: ["Meta: G-4 da temporada"],
      agente: ["Sem propostas no momento"],
      capitao: ["Vestiário estável, mas preocupado com renovação"],
    },
  };
}

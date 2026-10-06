export type AgentId =
  | "diretor"
  | "auxiliar"
  | "medico"
  | "preparacao"
  | "base"
  | "analise"
  | "imprensa"
  | "presidencia"
  | "agente"
  | "capitao";

export interface Agent {
  id: AgentId;
  nome: string;
  cargo: string;
  personalidade: string;
  responsabilidade: string;
  confianca: number;
  cor: string;
  emoji: string;
  sugestoes: string[];
}

export interface Message {
  id: string;
  autor: "treinador" | AgentId | "sistema" | "chefe";
  texto: string;
  ts: number;
  meta?: { encaminhadoPara?: AgentId; sugestoes?: string[] };
}

export interface DataSource {
  nome: string;
  atualizadoEm: string;
  url?: string;
}

export interface Player {
  id: string;
  nome: string;
  nomeCompleto?: string;
  pos: string;
  idade: number;
  nacionalidades?: string[];
  overall: number;
  potencial?: number;
  valorMercado?: number;
  moedaValor?: "EUR" | "BRL";
  moral: number;
  forma: number;
  confiancaTreinador?: number;
  papelElenco?: string;
  lesionado?: boolean;
  jovem?: boolean;
  capitao?: boolean;
  contratoAte: string;
  disponivelNoJogo?: boolean;
  idExterno?: { transfermarkt?: string; ea?: string; wikidata?: string };
  fonte?: DataSource;
  origem?: "fc26" | "base_externa" | "manual";
  valorTransferencia?: number;
  moedaTransferencia?: "EUR" | "BRL";
  clubeOrigem?: string;
  dataTransferencia?: string;
  observacoes?: string;
}

export interface Injury {
  jogadorId: string;
  descricao: string;
  semanas: number;
}

export interface Fixture {
  id: string;
  data: string;
  adversario: string;
  competicao: string;
  casa: boolean;
  resultado?: string;
  jogado?: boolean;
  placarCasa?: number;
  placarFora?: number;
  posse?: number;
  finalizacoes?: number;
  finalizacoesNoAlvo?: number;
  xg?: number;
  observacoes?: string;
  fonte?: DataSource;
}

export interface Decision {
  id: string;
  ts: number;
  titulo: string;
  descricao: string;
  origem: string;
  impacto?: { moral?: number; orcamento?: number; prioridade?: string };
}

export interface InboxItem {
  id: string;
  ts: number;
  de: AgentId;
  para: AgentId;
  assunto: string;
  lido?: boolean;
  prioridade?: "baixa" | "media" | "alta";
  jogadorId?: string;
}

export interface Meeting {
  id: string;
  ts: number;
  tema: string;
  participantes: AgentId[];
  opinioes: { agente: AgentId; texto: string }[];
  sintese: string;
  recomendacao: string;
  virouDecisao?: boolean;
  formato?: "video" | "presencial";
  duracaoMin?: number;
  inicio?: number;
  status?: "agendada" | "em_andamento" | "encerrada";
}

export interface RenewalPending {
  jogadorId: string;
  tipo: "renovacao" | "promocao";
  descricao: string;
}

export interface ClubState {
  onboarded: boolean;
  clube: {
    nome: string;
    nomeCompleto?: string;
    treinador: string;
    divisao: string;
    pais?: string;
    temporada: string;
    orcamento: number;
    moeda?: "EUR" | "BRL";
    moralElenco: number;
    pressaoDiretoria?: number;
    posicaoLiga?: number;
    pontos?: number;
    prioridadeJanela: "defesa" | "meio" | "ataque" | "goleiro" | "indefinida";
    forma: string;
    proximoJogoDias: number;
    proximoAdversario: string;
    fonte?: DataSource;
  };
  jogadores: Player[];
  lesoes: Injury[];
  calendario: Fixture[];
  decisoes: Decision[];
  inbox: InboxItem[];
  reunioes: Meeting[];
  pendencias: RenewalPending[];
  chats: Record<AgentId, Message[]>;
  confianca: Record<AgentId, number>;
  memoriasAgentes: Record<AgentId, string[]>;
}
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
  confianca: number; // 0-100
  cor: string; // tailwind class fragment
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

export interface Player {
  id: string;
  nome: string;
  pos: string;
  idade: number;
  overall: number;
  moral: number;
  forma: number;
  lesionado?: boolean;
  jovem?: boolean;
  capitao?: boolean;
  contratoAte: string;
}

export interface Injury {
  jogadorId: string;
  descricao: string;
  semanas: number;
}

export interface Fixture {
  id: string;
  data: string; // ISO
  adversario: string;
  competicao: string;
  casa: boolean;
  resultado?: string;
  jogado?: boolean;
}

export interface Decision {
  id: string;
  ts: number;
  titulo: string;
  descricao: string;
  origem: string; // agente ou "reunião"
  impacto?: { moral?: number; orcamento?: number; prioridade?: string };
}

export interface InboxItem {
  id: string;
  ts: number;
  de: AgentId;
  para: AgentId;
  assunto: string;
  lido?: boolean;
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
    treinador: string;
    divisao: string;
    temporada: string;
    orcamento: number; // em R$
    moralElenco: number; // 0-100
    prioridadeJanela: "defesa" | "meio" | "ataque" | "goleiro" | "indefinida";
    forma: string;
    proximoJogoDias: number;
    proximoAdversario: string;
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

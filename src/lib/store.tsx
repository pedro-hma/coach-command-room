import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ClubState, Decision, Fixture, InboxItem, Meeting, Message, AgentId, Player } from "./types";
import { createNewCareerState } from "./career-defaults";

const KEY = "mundo-do-clube-v3";
const SAVE_META_KEY = "mundo-do-clube-v3-last-save";
const AUTOSAVE_MS = 5 * 60 * 1000;

type Ctx = {
  state: ClubState;
  lastSavedAt: number | null;
  setState: (updater: (s: ClubState) => ClubState) => void;
  addMessage: (agent: AgentId, msg: Message) => void;
  addDecision: (d: Omit<Decision, "id" | "ts"> & { id?: string; ts?: number }) => void;
  addInbox: (i: Omit<InboxItem, "id" | "ts">) => void;
  addMeeting: (m: Omit<Meeting, "id" | "ts">) => Meeting;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  addPlayer: (p: Player) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  addFixture: (f: Omit<Fixture, "id">) => void;
  resetCareerData: () => void;
  deleteCareer: () => void;
  importJson: (json: string) => boolean;
  exportJson: () => string;
};

const StoreCtx = createContext<Ctx | null>(null);

function load(): ClubState {
  if (typeof window === "undefined") return createNewCareerState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createNewCareerState();
    const parsed = JSON.parse(raw) as ClubState;
    if (!parsed?.clube || !Array.isArray(parsed.jogadores) || !Array.isArray(parsed.calendario)) {
      return createNewCareerState();
    }
    return parsed;
  } catch {
    return createNewCareerState();
  }
}

function persist(state: ClubState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(SAVE_META_KEY, String(Date.now()));
  } catch {
    // armazenamento local pode ser bloqueado pelo navegador
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setLocal] = useState<ClubState>(() => createNewCareerState());
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setLocal(load());
    try {
      const saved = Number(localStorage.getItem(SAVE_META_KEY));
      if (Number.isFinite(saved) && saved > 0) setLastSavedAt(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(state);
    setLastSavedAt(Date.now());
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => {
      setLocal((current) => {
        persist(current);
        setLastSavedAt(Date.now());
        return current;
      });
    }, AUTOSAVE_MS);
    const onBeforeUnload = () => persist(state);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [hydrated, state]);

  const setState = useCallback((u: (s: ClubState) => ClubState) => {
    setLocal((s) => u(s));
  }, []);

  const addMessage = useCallback((agent: AgentId, msg: Message) => {
    setLocal((s) => ({
      ...s,
      chats: { ...s.chats, [agent]: [...(s.chats[agent] ?? []), msg] },
    }));
  }, []);

  const addDecision: Ctx["addDecision"] = useCallback((d) => {
    setLocal((s) => {
      const dec: Decision = {
        id: d.id ?? `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: d.ts ?? Date.now(),
        titulo: d.titulo,
        descricao: d.descricao,
        origem: d.origem,
        impacto: d.impacto,
      };
      let clube = s.clube;
      if (dec.impacto?.moral) clube = { ...clube, moralElenco: Math.max(0, Math.min(100, clube.moralElenco + dec.impacto.moral)) };
      if (dec.impacto?.orcamento) clube = { ...clube, orcamento: Math.max(0, clube.orcamento + dec.impacto.orcamento) };
      if (dec.impacto?.prioridade) clube = { ...clube, prioridadeJanela: dec.impacto.prioridade as any };
      return { ...s, clube, decisoes: [dec, ...s.decisoes] };
    });
  }, []);

  const addInbox: Ctx["addInbox"] = useCallback((i) => {
    setLocal((s) => ({
      ...s,
      inbox: [{ id: `i-${Date.now()}`, ts: Date.now(), ...i }, ...s.inbox],
    }));
  }, []);

  const addMeeting: Ctx["addMeeting"] = useCallback((m) => {
    const meeting: Meeting = {
      id: `m-${Date.now()}`,
      ts: Date.now(),
      formato: "video",
      duracaoMin: 30,
      inicio: Date.now(),
      status: "encerrada",
      ...m,
    };
    setLocal((s) => ({ ...s, reunioes: [meeting, ...s.reunioes] }));
    return meeting;
  }, []);

  const updateMeeting = useCallback((id: string, patch: Partial<Meeting>) => {
    setLocal((s) => ({ ...s, reunioes: s.reunioes.map((m) => m.id === id ? { ...m, ...patch } : m) }));
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setLocal((s) => {
      const normalizedName = player.nome.trim().toLocaleLowerCase("pt-BR");
      if (!normalizedName) return s;
      const exists = s.jogadores.some((p) => p.nome.trim().toLocaleLowerCase("pt-BR") === normalizedName);
      if (exists) return s;
      return { ...s, jogadores: [...s.jogadores, player] };
    });
  }, []);

  const updatePlayer = useCallback((id: string, patch: Partial<Player>) => {
    setLocal((s) => ({ ...s, jogadores: s.jogadores.map((p) => p.id === id ? { ...p, ...patch, id: p.id } : p) }));
  }, []);

  const deletePlayer = useCallback((id: string) => {
    setLocal((s) => ({ ...s, jogadores: s.jogadores.filter((p) => p.id !== id), lesoes: s.lesoes.filter((l) => l.jogadorId !== id), pendencias: s.pendencias.filter((p) => p.jogadorId !== id) }));
  }, []);

  const addFixture = useCallback((fixture: Omit<Fixture, "id">) => {
    setLocal((s) => ({
      ...s,
      calendario: [...s.calendario, { ...fixture, id: `fixture-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }].sort(
        (a, b) => +new Date(a.data) - +new Date(b.data),
      ),
    }));
  }, []);

  const resetCareerData = useCallback(() => {
    const fresh = createNewCareerState();
    fresh.onboarded = state.onboarded;
    fresh.clube = { ...fresh.clube, nome: state.clube.nome, treinador: state.clube.treinador };
    setLocal(fresh);
  }, [state.onboarded, state.clube.nome, state.clube.treinador]);

  const deleteCareer = useCallback(() => {
    const fresh = createNewCareerState();
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(SAVE_META_KEY);
    } catch {}
    setLocal(fresh);
  }, []);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as ClubState;
      if (!parsed?.clube || !Array.isArray(parsed.jogadores) || !Array.isArray(parsed.calendario)) return false;
      setLocal(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, lastSavedAt, setState, addMessage, addDecision, addInbox, addMeeting, updateMeeting, addPlayer, updatePlayer, deletePlayer, addFixture,
    resetCareerData, deleteCareer, importJson, exportJson,
  }), [state, lastSavedAt, setState, addMessage, addDecision, addInbox, addMeeting, updateMeeting, addPlayer, updatePlayer, deletePlayer, addFixture, resetCareerData, deleteCareer, importJson, exportJson]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}

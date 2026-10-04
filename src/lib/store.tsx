import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ClubState, Decision, InboxItem, Meeting, Message, AgentId } from "./types";
import { createDemoState } from "./demo-data";

const KEY = "mundo-do-clube-v1";

type Ctx = {
  state: ClubState;
  setState: (updater: (s: ClubState) => ClubState) => void;
  addMessage: (agent: AgentId, msg: Message) => void;
  addDecision: (d: Omit<Decision, "id" | "ts"> & { id?: string; ts?: number }) => void;
  addInbox: (i: Omit<InboxItem, "id" | "ts">) => void;
  addMeeting: (m: Omit<Meeting, "id" | "ts">) => Meeting;
  resetDemo: () => void;
  deleteCareer: () => void;
  importJson: (json: string) => boolean;
  exportJson: () => string;
};

const StoreCtx = createContext<Ctx | null>(null);

function load(): ClubState {
  if (typeof window === "undefined") return createDemoState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createDemoState();
    const parsed = JSON.parse(raw) as ClubState;
    if (!parsed.clube) return createDemoState();
    return parsed;
  } catch {
    return createDemoState();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setLocal] = useState<ClubState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocal(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

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
    const meeting: Meeting = { id: `m-${Date.now()}`, ts: Date.now(), ...m };
    setLocal((s) => ({ ...s, reunioes: [meeting, ...s.reunioes] }));
    return meeting;
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = createDemoState();
    fresh.onboarded = state.onboarded;
    setLocal(fresh);
  }, [state.onboarded]);

  const deleteCareer = useCallback(() => {
    const fresh = createDemoState();
    fresh.onboarded = false;
    try { localStorage.removeItem(KEY); } catch {}
    setLocal(fresh);
  }, []);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed?.clube) return false;
      setLocal(parsed);
      return true;
    } catch { return false; }
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, setState, addMessage, addDecision, addInbox, addMeeting, resetDemo, deleteCareer, importJson, exportJson,
  }), [state, setState, addMessage, addDecision, addInbox, addMeeting, resetDemo, deleteCareer, importJson, exportJson]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}

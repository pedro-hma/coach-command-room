import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Calendar, HeartPulse, Store, Sprout,
  Gavel, Inbox, Settings, MessagesSquare, Building2, Trophy,
} from "lucide-react";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/departamentos", label: "Departamentos", icon: Building2 },
  { to: "/reunioes", label: "Sala de reuniões", icon: MessagesSquare },
  { to: "/elenco", label: "Elenco", icon: Users },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/lesoes", label: "Lesões", icon: HeartPulse },
  { to: "/mercado", label: "Mercado", icon: Store },
  { to: "/base", label: "Base", icon: Sprout },
  { to: "/decisoes", label: "Decisões", icon: Gavel },
  { to: "/inbox", label: "Caixa de entrada", icon: Inbox },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const naoLidos = state.inbox.filter((i) => !i.lido).length;
  const proximo = state.calendario.find((f) => !f.jogado);

  return (
    <div className="min-h-screen w-full flex text-foreground">
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-black">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Central do Treinador</div>
              <div className="truncate text-sm font-semibold">{state.clube.nome}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = path === n.to;
            const badge = n.to === "/inbox" && naoLidos > 0 ? naoLidos : null;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{n.label}</span>
                {badge && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Próximo jogo</div>
          {proximo ? (
            <div className="mt-1 text-sm font-semibold">{proximo.adversario}</div>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">—</div>
          )}
          <div className="text-xs text-muted-foreground">
            {state.clube.proximoJogoDias} dias • {state.clube.forma}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {state.clube.divisao} • {state.clube.temporada}
            </div>
            <h1 className="truncate text-lg font-bold md:text-xl">
              Treinador {state.clube.treinador}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Orçamento</div>
              <div className="text-sm font-semibold">
                R$ {(state.clube.orcamento / 1_000_000).toFixed(1).replace(".", ",")} mi
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Moral</div>
              <div className="text-sm font-semibold">{state.clube.moralElenco}%</div>
            </div>
          </div>
        </header>

        {/* Mobile top nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-border/60 bg-card/40 px-2 py-2">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-secondary-foreground"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function agentDot(id: keyof typeof AGENTS) {
  return AGENTS[id].emoji;
}

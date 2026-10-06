import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AGENTS } from "@/lib/agents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Painel,
  head: () => ({
    meta: [
      { title: "Central de Comando — Coach Command Room" },
      { name: "description", content: "A sala de situação da carreira: clube, elenco, agentes, decisões e acontecimentos." },
    ],
  }),
});

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function formatarDinheiro(valor: number, moeda = "EUR") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);
}

function Painel() {
  const { state: s } = useStore();
  const proximo = s.calendario.find((f) => !f.jogado);
  const ultimos = s.calendario.filter((f) => f.jogado).slice(-5).reverse();
  const lesionados = s.jogadores.filter((p) => p.lesionado);
  const jovens = s.jogadores.filter((p) => p.jovem);
  const naoLidos = s.inbox.filter((i) => !i.lido);
  const maiorAtivo = [...s.jogadores].sort((a, b) => (b.valorMercado ?? 0) - (a.valorMercado ?? 0))[0];

  const timeline = [
    ...s.decisoes.map((d) => ({ id: d.id, ts: d.ts, tipo: "decisao", titulo: d.titulo, detalhe: d.descricao })),
    ...s.inbox.map((i) => ({ id: i.id, ts: i.ts, tipo: "mensagem", titulo: i.assunto, detalhe: AGENTS[i.de].cargo })),
    ...s.calendario
      .filter((f) => f.jogado)
      .map((f) => ({ id: f.id, ts: new Date(f.data).getTime(), tipo: "jogo", titulo: `${f.casa ? s.clube.nome : f.adversario} ${f.resultado ?? ""} ${f.casa ? f.adversario : s.clube.nome}`, detalhe: f.competicao })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 via-card to-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20">{s.clube.divisao}</Badge>
              <Badge variant="secondary">Temporada {s.clube.temporada}</Badge>
              <Badge variant="outline">{s.clube.pais ?? "Carreira"}</Badge>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Sala de situação de {s.clube.treinador}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{s.clube.nome}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Seu clube não é apenas uma planilha: resultados, decisões, relações internas e dados reais formam uma linha do tempo própria desta carreira.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniKpi label="Posição" value={s.clube.posicaoLiga ? `${s.clube.posicaoLiga}º` : "—"} />
            <MiniKpi label="Pontos" value={String(s.clube.pontos ?? "—")} />
            <MiniKpi label="Moral" value={`${s.clube.moralElenco}%`} />
            <MiniKpi label="Pressão" value={`${s.clube.pressaoDiretoria ?? 0}%`} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Próximo compromisso</p>
              <h2 className="mt-1 text-2xl font-black">{proximo?.adversario ?? "A definir"}</h2>
            </div>
            <div className="rounded-2xl bg-primary/15 px-4 py-3 text-center">
              <div className="text-3xl font-black text-primary">D-{s.clube.proximoJogoDias}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">dias</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> {proximo?.competicao}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {proximo ? dataCurta.format(new Date(proximo.data)) : "—"}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {proximo?.casa ? "Em casa" : "Fora"}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link to="/departamentos"><Button variant="secondary" className="w-full">Preparar jogo</Button></Link>
            <Link to="/reunioes"><Button className="w-full">Convocar reunião</Button></Link>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pulso do clube</p>
          <div className="mt-4 space-y-4">
            <Barra label="Moral do elenco" value={s.clube.moralElenco} />
            <Barra label="Confiança da presidência" value={s.confianca.presidencia} />
            <Barra label="Pressão externa" value={s.clube.pressaoDiretoria ?? 0} invertida />
          </div>
          <div className="mt-5 flex gap-1">
            {s.clube.forma.split(" ").map((r, i) => (
              <span key={`${r}-${i}`} className={`grid h-8 flex-1 place-items-center rounded-md text-xs font-black ${r === "V" ? "bg-primary/20 text-primary" : r === "E" ? "bg-muted" : "bg-danger/20 text-danger"}`}>{r}</span>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ativos esportivos</p>
            <Badge variant="outline">dados híbridos</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat icon={Users} label="Elenco" value={`${s.jogadores.length} atletas`} />
            <Stat icon={Sparkles} label="Projetos" value={`${jovens.length} jovens`} />
            <Stat icon={AlertTriangle} label="Departamento médico" value={`${lesionados.length} fora`} />
            <Stat icon={CircleDollarSign} label="Maior ativo" value={maiorAtivo?.valorMercado ? formatarDinheiro(maiorAtivo.valorMercado, maiorAtivo.moedaValor) : "Sem valor"} />
          </div>
          {maiorAtivo && (
            <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="text-sm font-semibold">{maiorAtivo.nome}</div>
              <div className="mt-1 text-xs text-muted-foreground">{maiorAtivo.pos} · {maiorAtivo.idade} anos · contrato até {maiorAtivo.contratoAte}</div>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">Real: identidade e contrato</Badge>
                <Badge variant="outline">Save: moral {maiorAtivo.moral}</Badge>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caixa de entrada</p>
              <h3 className="mt-1 font-bold">Sua comissão está esperando respostas</h3>
            </div>
            <Badge>{naoLidos.length} não lidas</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {s.inbox.slice(0, 5).map((item) => {
              const agente = AGENTS[item.de];
              return (
                <Link key={item.id} to="/chat/$agentId" params={{ agentId: item.de }} className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition hover:border-primary/60 hover:bg-primary/5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-lg">{agente.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{item.assunto}</span>{item.prioridade === "alta" && <Badge variant="destructive">urgente</Badge>}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{agente.cargo} · {dataCurta.format(new Date(item.ts))}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Agenda do treinador</p>
          <div className="mt-4 space-y-3">
            {s.pendencias.map((p) => (
              <div key={`${p.jogadorId}-${p.tipo}`} className="flex gap-3 rounded-xl bg-muted/35 p-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.descricao}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{p.tipo}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/decisoes"><Button variant="ghost" className="mt-3 w-full">Abrir central de decisões <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-5 xl:col-span-7">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Linha do tempo da carreira</p></div>
          <div className="relative mt-5 space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
            {timeline.map((evento) => (
              <div key={`${evento.tipo}-${evento.id}`} className="relative flex gap-4 pl-0">
                <div className="z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-background bg-primary" />
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{evento.titulo}</p><Badge variant="outline" className="text-[10px]">{evento.tipo}</Badge></div>
                  <p className="mt-1 text-xs text-muted-foreground">{evento.detalhe}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Últimos resultados</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 space-y-2">
            {ultimos.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                Nenhum resultado registrado nesta carreira.
              </div>
            ) : ultimos.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border/60 p-3">
                <div>
                  <p className="text-sm font-semibold">{f.adversario}</p>
                  <p className="text-xs text-muted-foreground">{f.competicao} · {f.casa ? "Casa" : "Fora"}</p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-1.5 text-lg font-black">{f.resultado}</div>
              </div>
            ))}
          </div>
          {ultimos.length > 0 && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-2 font-semibold text-foreground"><MessageSquareText className="h-4 w-4 text-primary" /> Leitura factual</div>
              A comissão passa a ler somente resultados que foram registrados nesta carreira. Nenhum comentário de partida é pré-carregado.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return <div className="min-w-24 rounded-xl border border-border/60 bg-background/45 p-3 text-center backdrop-blur"><div className="text-xl font-black">{value}</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div></div>;
}

function Barra({ label, value, invertida = false }: { label: string; value: number; invertida?: boolean }) {
  return <div><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span className="font-semibold">{value}%</span></div><Progress value={invertida ? 100 - value : value} /></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-xl border border-border/60 bg-muted/25 p-3"><Icon className="h-4 w-4 text-primary" /><div className="mt-2 text-sm font-bold">{value}</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div></div>;
}
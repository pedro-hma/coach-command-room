import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy } from "lucide-react";

export function Onboarding() {
  const { state, setState } = useStore();
  const [nome, setNome] = useState(state.clube.nome);
  const [treinador, setTreinador] = useState(state.clube.treinador);
  const [step, setStep] = useState(0);

  function finalizar() {
    setState((s) => ({
      ...s,
      onboarded: true,
      clube: { ...s.clube, nome, treinador },
    }));
  }

  const steps = [
    {
      titulo: "Bem-vindo à Central do Treinador",
      texto:
        "Você comanda um clube inteiro conversando com seus departamentos. Cada um é um especialista com memória, opiniões e sugestões.",
    },
    {
      titulo: "Seu clube",
      texto: "Confirme o nome do clube e do treinador. Você pode alterar depois em Configurações.",
    },
    {
      titulo: "Como funciona",
      texto:
        "Fale com departamentos individualmente, chame reuniões multiagente, transforme conversas em decisões e acompanhe tudo pelo painel.",
    },
  ];

  const s = steps[step];

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="glass w-full max-w-lg rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Mundo do Clube
            </div>
            <h1 className="text-xl font-bold">Central do Treinador</h1>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">{s.titulo}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{s.texto}</p>

          {step === 1 && (
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Clube</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Treinador</label>
                <Input value={treinador} onChange={(e) => setTreinador(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Continuar</Button>
            ) : (
              <Button onClick={finalizar}>Entrar na sala de comando</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  persona: z.string(),
  contexto: z.string(),
  pergunta: z.string(),
  historico: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});

export const responderAgente = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { texto: null as string | null, erro: "sem_chave" };

    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        system: `Você é um membro da comissão técnica de um clube de futebol brasileiro, respondendo ao treinador.
${data.persona}

Regras:
- Responda SEMPRE em português do Brasil, em 1 a 3 frases curtas, tom de conversa profissional.
- Use os dados reais do clube abaixo e cite números/nomes quando fizer sentido.
- Se algum dado não existir no contexto, admita explicitamente que não tem essa informação.
- Nada de markdown, listas ou títulos. Apenas texto corrido.

DADOS DO CLUBE:
${data.contexto}`,
        messages: [
          ...data.historico.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: data.pergunta },
        ],
      });
      return { texto: text.trim(), erro: null as string | null };
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("429")) return { texto: null, erro: "limite" };
      if (msg.includes("402")) return { texto: null, erro: "creditos" };
      return { texto: null, erro: "falha" };
    }
  });

# Coach Command Room

Companion inteligente para o modo carreira do EA Sports FC. O treinador comanda o clube enquanto departamentos com personalidades próprias analisam o contexto da temporada, participam de reuniões e ajudam a transformar acontecimentos do jogo em decisões de gestão.

## Visão do produto

O objetivo não é ser apenas um chat com IA. Cada departamento deve ter responsabilidade, personalidade, nível de confiança e memória das decisões anteriores. O sistema foi pensado para funcionar como uma sala de comando do clube, reunindo comissão técnica, diretoria, departamento médico, desempenho, olheiros, base, finanças, imprensa, capitão e agente.

## Estado atual

- Dashboard e navegação da carreira
- Chat individual com departamentos
- Reuniões com múltiplos agentes e síntese final
- Contexto do clube, elenco, lesões e decisões recentes
- Dados de demonstração
- Integração server-side com o Lovable AI Gateway
- Persistência local da carreira

## Stack

- TanStack Start
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Router e React Query
- Vercel AI SDK
- Zod

## Desenvolvimento local

Requisitos: Node.js 20 ou superior e npm.

```bash
git clone https://github.com/pedro-hma/coach-command-room.git
cd coach-command-room
npm install
npm run dev
```

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
LOVABLE_API_KEY=sua_chave_do_lovable_ai_gateway
LOVABLE_AI_MODEL=google/gemini-3.6-flash
```

`LOVABLE_AI_MODEL` é opcional. A chave nunca deve ser enviada ao navegador nem versionada no GitHub.

## Scripts

```bash
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção
npm run preview   # pré-visualização do build
npm run lint      # análise estática
npm run format    # formatação do código
```

## Direção de arquitetura

A evolução do projeto deve manter quatro princípios:

1. O estado da carreira é a fonte de verdade para todas as respostas.
2. Cada agente fala apenas dentro da própria responsabilidade.
3. A IA deve admitir quando um dado não existe, sem inventar fatos da carreira.
4. Mudanças importantes devem ser feitas em branches e revisadas por pull request antes de chegar à `main`.

## Roadmap

### Fundação

- Validação e limites de entrada da IA
- Tratamento consistente de falhas e respostas vazias
- Configuração de modelo por ambiente
- Testes para contexto, decisões e regras de negócio

### Próxima camada

- Memória por departamento
- Eventos automáticos da temporada
- Caixa de entrada com prioridades
- Registro de decisões e consequências
- Importação e exportação de carreira em JSON

### Expansão

- Mercado de transferências e scouting inteligente
- Gestão de base e desenvolvimento
- Imprensa, torcida e ambiente do vestiário
- Histórico de temporadas e múltiplos clubes

## Segurança

Toda chamada de IA deve permanecer no servidor. Nunca exponha `LOVABLE_API_KEY` em componentes React, variáveis públicas ou commits. Dados fornecidos ao modelo são tratados como contexto informativo e não como instruções de sistema.

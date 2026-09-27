# Coach Command Room

Companion inteligente para transformar uma carreira no EA Sports FC 26 em uma experiência de gestão com memória, contexto e análise.

## Desenvolvimento local — sem Docker

O projeto **não exige Docker para desenvolvimento**.

### Requisitos

- Node.js 20+
- npm
- Python 3.12+
- PostgreSQL instalado localmente no Windows

O instalador oficial do PostgreSQL para Windows inclui o servidor e o pgAdmin. citeturn0search0

### 1. Banco de dados

Durante a instalação do PostgreSQL, defina uma senha para o usuário \`postgres\`.

No pgAdmin ou no SQL Shell, crie o banco:

\`\`\`sql
CREATE DATABASE coach_command_room;
\`\`\`

### 2. Backend

Abra um PowerShell na raiz do projeto:

\`\`\`powershell
cd backend

python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt

Copy-Item .env.example .env
\`\`\`

Abra \`backend/.env\` e coloque a senha real do PostgreSQL:

\`\`\`env
DATABASE_URL=postgresql+asyncpg://postgres:SUA_SENHA@localhost:5432/coach_command_room
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=troque-esta-chave-em-desenvolvimento
CORS_ORIGINS=["http://localhost:5173"]
\`\`\`

Depois:

\`\`\`powershell
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
\`\`\`

A API ficará em:

\`\`\`
http://127.0.0.1:8000
\`\`\`

Documentação interativa:

\`\`\`
http://127.0.0.1:8000/docs
\`\`\`

O FastAPI suporta execução local pelo Uvicorn, inclusive no Windows. citeturn0search2turn0search6

### 3. Frontend

Abra **outro PowerShell** na raiz:

\`\`\`powershell
npm install
npm run dev
\`\`\`

Abra:

\`\`\`
http://localhost:5173
\`\`\`

### 4. Ordem para iniciar o projeto

Sempre que quiser trabalhar no projeto:

**Terminal 1 — PostgreSQL**

O serviço do PostgreSQL deve estar iniciado no Windows.

**Terminal 2 — API**

\`\`\`powershell
cd backend
.\\.venv\\Scripts\\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
\`\`\`

**Terminal 3 — frontend**

\`\`\`powershell
npm run dev
\`\`\`

Depois acesse \`http://localhost:5173\`.

## Redis

Redis e Celery fazem parte da arquitetura planejada para tarefas em segundo plano, mas **não são necessários para abrir o frontend nem para subir a API básica local** nesta etapa.

O objetivo é não obrigar o desenvolvimento local a depender de Docker.

## Variáveis de ambiente

Nunca versione:

- \`.env\`
- chaves de API
- senhas
- tokens

O arquivo \`backend/.env.example\` serve apenas como modelo.

## Arquitetura

\`\`\`
React / TanStack Start
        ↓
FastAPI
        ↓
PostgreSQL

Redis + Celery
(opcionais durante o desenvolvimento inicial)
\`\`\`

A API é a fonte de verdade dos dados da carreira. O PostgreSQL guarda os dados persistentes e cada carreira é isolada pelo \`career_id\`.

## Estado atual

- Frontend existente da Central do Treinador
- Backend FastAPI
- Autenticação por e-mail/senha
- JWT
- Cadastro e login
- Carreiras isoladas por usuário
- Estados de carreira: CONFIGURACAO, ATIVA, ENCERRADA e ARQUIVADA
- PostgreSQL
- Migração inicial com Alembic
- CORS configurado para o frontend local
- Docker mantido apenas como opção futura, não como requisito

## Próxima camada

1. Conectar o frontend ao FastAPI.
2. Fazer Cadastro → Login → Nova carreira funcionar pela API.
3. Criar configuração do treinador.
4. Criar escolha/configuração do clube.
5. Persistir a carreira real no PostgreSQL.
6. Transformar o dashboard atual em painel da carreira real.
7. Depois avançar para elenco, calendário, mercado, finanças, diretoria, mídia, memória e análise.

## Regra central

O sistema nunca deve inventar um acontecimento como se tivesse ocorrido no FC 26.

\`\`\`
FC 26 → evento real
Fonte externa → dado de referência
Motor determinístico → cálculo/indicador
IA → interpretação contextual
\`\`\`

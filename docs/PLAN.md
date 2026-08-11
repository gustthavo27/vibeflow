# PLAN — VibeFlow CRM

> Plano de execução do projeto, dividido em milestones sequenciais. Baseado em `CLAUDE.md` e `docs/PRD.md`.
> Estratégia: **UI primeiro** (com dados mockados) para validar fluxo e experiência rapidamente, **backend depois** (Supabase, persistência real, multi-tenant, pagamento) plugando na interface já pronta. Cada milestone termina com um commit atômico e testado antes de avançar.

---

## Milestone 0 — Setup do Projeto

**Branch**: `chore/project-setup`

**Objetivo**: Preparar o esqueleto técnico do projeto (Next.js + TypeScript + Tailwind + shadcn/ui) e a estrutura de pastas definida no PRD, pronto para receber telas.

**Entregas**:
- [x] Inicializar projeto Next.js 14 (App Router) com TypeScript 5
- [x] Configurar Tailwind CSS
- [x] Instalar e configurar shadcn/ui (tema base, `components.json`)
- [x] Criar estrutura de pastas do PRD (`/app`, `/components/ui`, `/components/kanban`, `/components/leads`, `/components/dashboard`, `/lib/supabase`, `/lib/stripe`, `/lib/email`, `/docs`)
- [x] Configurar ESLint + Prettier e scripts de lint/format
- [x] Configurar `.env.example` com placeholders (Supabase, Stripe, Resend)
- [x] Criar repositório Git, `.gitignore`, README inicial
- [x] Configurar deploy de preview na Vercel (projeto vazio funcionando em produção)

**Commit final**: `chore: setup inicial do projeto Next.js com Tailwind, shadcn/ui e estrutura de pastas`

---

## Milestone 1 — UI: Shell do Dashboard

**Branch**: `feature/ui-dashboard-shell`

**Objetivo**: Construir a casca do app autenticado — sidebar, navegação, dropdown de troca de workspace — com dados mockados.

**Entregas**:
- [x] Layout `(dashboard)/[workspace]` com sidebar e área de conteúdo
- [x] Sidebar com navegação (Leads, Pipeline, Dashboard, Configurações)
- [x] Dropdown de troca de workspace (mock de lista de workspaces)
- [x] Menu de usuário (perfil, logout)
- [x] Estado vazio/skeleton de carregamento

**Commit final**: `feat: shell do dashboard com sidebar, navegação e troca de workspace`

---

## Milestone 2 — UI: Autenticação e Onboarding

**Branch**: `feature/ui-auth`

**Objetivo**: Construir as telas de login, cadastro e onboarding (sem integração real com Supabase Auth ainda — formulários funcionais com validação client-side e navegação mockada).

**Entregas**:
- [x] Tela de Login
- [x] Tela de Cadastro
- [x] Tela de Onboarding (criar workspace)
- [x] Validação de formulários (client-side)
- [x] Estados de loading/erro (mockados)
- [x] Layout `(auth)` route group

**Commit final**: `feat: telas de login, cadastro e onboarding com validação client-side`

---

## Milestone 3 — UI: Gestão de Leads e Atividades

**Branch**: `feature/ui-leads-activities`

**Objetivo**: Construir listagem, busca/filtros e página de detalhe de leads, incluindo a timeline de atividades vinculada ao lead — tudo com dados mockados.

**Entregas**:
- [x] Listagem de leads (tabela) com dados mock
- [x] Busca por nome/e-mail/empresa
- [x] Filtros por status (responsável e data ainda não implementados)
- [x] Formulário de cadastro/edição/exclusão de lead (nome, e-mail, telefone, empresa, cargo, status, responsável, valor negociado, notas)
- [x] Página de detalhe do lead (perfil completo, com edição direta)
- [x] Componente de upload de arquivos (UI, sem persistência)
- [x] Timeline cronológica de atividades no detalhe do lead (visual, somente leitura)
- [ ] Formulário de nova atividade (tipo: Ligação, E-mail, Reunião, Nota)
- [x] Exibição de autor, descrição e data por item da timeline
- [ ] Filtro por tipo de atividade

**Commit final**: `feat: listagem, filtros, detalhe de leads e timeline de atividades com dados mockados`

---

## Milestone 4 — UI: Pipeline Kanban

**Branch**: `feature/ui-pipeline-kanban`

**Objetivo**: Construir o board Kanban de vendas com drag-and-drop visual (@dnd-kit), sem persistência ainda.

**Entregas**:
- [x] Colunas por etapa (NOVO LEAD, CONTATO REALIZADO, PROPOSTA ENVIADA, NEGOCIAÇÃO, FECHADO GANHO, FECHADO PERDIDO)
- [x] Card de negócio (título, valor estimado, lead vinculado, responsável, prazo)
- [x] Drag-and-drop entre colunas com @dnd-kit (estado local em memória)
- [x] Modal/painel de criação e edição de negócio
- [x] Estados visuais por coluna (contagem, valor total)

**Commit final**: `feat: pipeline Kanban com drag-and-drop e cards de negócio (dados mockados)`

---

## Milestone 5 — UI: Dashboard de Métricas

**Branch**: `feature/ui-dashboard-metrics`

**Objetivo**: Construir os cards de métricas e o gráfico de funil com dados mockados.

**Entregas**:
- [x] Cards: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- [x] Gráfico de funil de vendas (Recharts)
- [x] Lista de negócios com prazo próximo (todos os responsáveis; filtro por usuário logado fica para o backend real)
- [x] Layout responsivo do dashboard

**Commit final**: `feat: dashboard de métricas com cards e gráfico de funil (dados mockados)`

---

## Milestone 6 — UI: Landing Page

**Branch**: `feature/ui-landing-page`

**Objetivo**: Construir a página pública de apresentação do produto, sem lógica de backend.

**Entregas**:
- [x] Seção Hero (proposta de valor, CTA principal)
- [x] Seção Funcionalidades (Kanban, Leads, Dashboard, Multi-empresa)
- [x] Seção Planos e Preços (Free vs Pro)
- [x] Seção CTA final (cadastro/login)
- [x] Layout responsivo (mobile/desktop)
- [x] Identidade visual aplicada (paleta, tipografia definidas no PRD)

**Commit final**: `feat: landing page pública com hero, funcionalidades, planos e CTA`

---

## Milestone 7 — Backend: Supabase Setup e Schema

**Branch**: `feature/backend-supabase-setup`

**Objetivo**: Configurar o Supabase (projeto, schema do banco, RLS) e os clients de acesso a dados, sem ainda plugar nas telas.

**Entregas**:
- [ ] Criar projeto Supabase e configurar variáveis de ambiente
- [ ] Modelagem do schema: `workspaces`, `workspace_members`, `leads`, `deals`, `activities`
- [ ] Políticas de Row Level Security (RLS) por workspace
- [ ] `lib/supabase/server.ts` e `lib/supabase/client.ts`
- [ ] Geração de tipos TypeScript a partir do schema Supabase
- [ ] Seed de dados de teste

**Commit final**: `feat: schema Supabase com RLS multi-tenant e clients server/browser`

---

## Milestone 8 — Backend: Autenticação Real

**Branch**: `feature/backend-auth`

**Objetivo**: Substituir os mocks de autenticação pelas chamadas reais ao Supabase Auth, conectando às telas do Milestone 2.

**Entregas**:
- [ ] Integração de login/cadastro com Supabase Auth
- [ ] Middleware/proteção de rotas autenticadas
- [ ] Fluxo real de onboarding (criação de workspace no banco)
- [ ] Sessão e logout funcionais
- [ ] Tratamento de erros de autenticação

**Commit final**: `feat: autenticação real via Supabase Auth conectada às telas de login/onboarding`

---

## Milestone 9 — Backend: Leads e Contatos

**Branch**: `feature/backend-leads`

**Objetivo**: Conectar a UI de leads (Milestone 3) a Server Actions com persistência real no Supabase.

**Entregas**:
- [ ] Server Actions: criar, listar, atualizar, excluir lead
- [ ] Busca e filtros server-side
- [ ] Upload de arquivos real (Supabase Storage) vinculado ao lead
- [ ] Validação de dados no servidor
- [ ] Testes das Server Actions

**Commit final**: `feat: CRUD de leads persistido no Supabase com upload de arquivos`

---

## Milestone 10 — Backend: Pipeline Kanban

**Branch**: `feature/backend-pipeline`

**Objetivo**: Conectar o board Kanban (Milestone 4) à persistência real, incluindo a atualização de etapa via drag-and-drop.

**Entregas**:
- [ ] Server Actions: criar, listar, atualizar (etapa/campos), excluir negócio
- [ ] Persistência da posição/etapa ao soltar o card (drag-and-drop)
- [ ] Vínculo negócio ↔ lead ↔ responsável real
- [ ] Testes das Server Actions

**Commit final**: `feat: persistência real do pipeline Kanban com atualização de etapa via drag-and-drop`

---

## Milestone 11 — Backend: Atividades e Dashboard de Métricas

**Branch**: `feature/backend-activities-metrics`

**Objetivo**: Conectar a timeline de atividades (Milestone 3) e o dashboard de métricas (Milestone 5) a dados reais.

**Entregas**:
- [ ] Server Actions: criar e listar atividades por lead
- [ ] Queries de métricas reais (total de leads, negócios abertos, valor do pipeline, taxa de conversão)
- [ ] Query do funil de vendas para o gráfico Recharts
- [ ] Query de negócios com prazo próximo por usuário

**Commit final**: `feat: atividades e métricas do dashboard com dados reais do Supabase`

---

## Milestone 12 — Multi-empresa e Colaboração

**Branch**: `feature/workspaces-collaboration`

**Objetivo**: Implementar a lógica completa de multi-workspace, convites e papéis de acesso.

**Entregas**:
- [ ] Criação de múltiplos workspaces por usuário
- [ ] Convite de colaboradores por e-mail via Resend
- [ ] Aceite de convite e vínculo ao workspace
- [ ] Papéis Admin/Membro aplicados nas Server Actions e RLS
- [ ] Troca de workspace funcional (Milestone 1) com dados reais
- [ ] Gerenciamento de colaboradores (listar, remover, alterar papel)

**Commit final**: `feat: multi-empresa com convites por e-mail, papéis de acesso e troca de workspace`

---

## Milestone 13 — Monetização (Stripe)

**Branch**: `feature/stripe-billing`

**Objetivo**: Implementar os planos Free/Pro, checkout e gestão de assinatura.

**Entregas**:
- [ ] Configuração dos produtos/preços no Stripe (Free, Pro R$49/mês)
- [ ] Checkout via Stripe Checkout
- [ ] Webhook para ativar/desativar plano automaticamente
- [ ] Customer Portal do Stripe para gerenciamento de assinatura
- [ ] Limites de plano aplicados (2 colaboradores/50 leads no Free)
- [ ] Tela de planos e upgrade dentro do app

**Commit final**: `feat: monetização via Stripe com checkout, webhooks e limites de plano`

---

## Milestone 14 — QA, Polimento e Deploy

**Branch**: `chore/release-v1`

**Objetivo**: Fechar o ciclo com testes end-to-end, ajustes finais de UX e deploy de produção.

**Entregas**:
- [ ] Revisão de todos os fluxos críticos (auth → leads → pipeline → atividades → dashboard → billing)
- [ ] Ajustes de responsividade e acessibilidade
- [ ] Configuração de variáveis de ambiente de produção (Vercel, Supabase, Stripe, Resend)
- [ ] Testes finais de RLS e isolamento multi-tenant
- [ ] Deploy de produção na Vercel
- [ ] Atualização do README com instruções de setup e deploy

**Commit final**: `chore: release v1.0 — VibeFlow CRM em produção`

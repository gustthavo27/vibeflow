# PRD — VibeFlow CRM

> Documento de referência do produto e briefing técnico. Guia todas as decisões de implementação e deve ser consultado antes de iniciar qualquer milestone.

## 1. Contexto & Problema

Pequenas e médias empresas, freelancers e times de vendas perdem oportunidades de negócio por falta de organização no processo comercial. Leads são gerenciados em planilhas, anotações soltas ou ferramentas genéricas que não oferecem visão clara do funil de vendas.

Não há registro centralizado de interações com clientes, e quando a equipe cresce, os dados ficam espalhados sem controle de acesso por empresa/time.

Soluções como HubSpot e Pipedrive existem, mas são caras ou complexas demais para quem está começando.

## 2. Solução Proposta

Construir o **VibeFlow CRM** — uma plataforma SaaS de gestão de clientes e vendas, multi-empresa, com pipeline visual Kanban, gestão completa de leads e negócios, registro de interações e integração de pagamento para monetização.

- CRM completo com cadastro de leads/contatos (nome, e-mail, telefone, empresa, cargo)
- Pipeline Kanban de vendas com drag-and-drop entre etapas (Novo Lead, Contato, Proposta, Negociação, Fechado Ganho/Perdido)
- Página de detalhe do lead com histórico completo de atividades (ligações, e-mails, reuniões, notas)
- Sistema multi-empresa: cada workspace isolado, com convite de colaboradores por e-mail
- Dashboard com métricas de vendas: total de leads, negócios abertos, valor do pipeline, taxa de conversão, gráfico de funil
- Monetização via planos de assinatura: Free (até 2 colaboradores, 50 leads) e Pro (ilimitado, R$49/mês)
- Landing page de apresentação do produto

## 3. Personas

### Dono do Negócio / Empreendedor (Admin)
Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace, convida o time, gerencia planos e possui acesso completo às funcionalidades.

### Vendedor / Colaborador (Membro)
Profissional de vendas que utiliza o CRM no dia a dia. Cadastra leads, move negócios no pipeline e registra atividades. Pode participar de múltiplos workspaces.

### Freelancer / Consultor (Admin Solo)
Profissional independente que atende vários clientes. Utiliza workspaces separados para cada cliente/projeto. Começa no plano Free e faz upgrade conforme cresce.

## 4. Requisitos Funcionais

### Autenticação
- Login e cadastro de usuários (Supabase Auth)
- Onboarding do usuário (criação/entrada em workspace no primeiro acesso)

### Gestão de Leads e Contatos
- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca e filtros (por status, responsável, data)
- Página de detalhe com perfil completo e timeline de atividades
- Upload de arquivos vinculados ao lead

### Pipeline Kanban de Vendas
- Colunas por etapa: Novo Lead, Contato Realizado, Proposta Enviada, Negociação, Fechado Ganho, Fechado Perdido
- Cards de negócios com título, valor estimado (R$), lead vinculado, responsável e prazo
- Drag-and-drop entre etapas com persistência no banco (@dnd-kit)

### Registro de Atividades
- Tipos: Ligação, E-mail, Reunião, Nota
- Campos: autor, descrição, data
- Timeline cronológica vinculada ao lead

### Dashboard de Métricas
- Cards: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- Gráfico de funil de vendas (Recharts)
- Negócios do usuário logado com prazo próximo

### Multi-empresa e Colaboração
- Criar workspaces (cada empresa/time = 1 workspace)
- Convite de colaboradores por e-mail (via Resend)
- Papéis: Admin (acesso total) e Membro (leads e negócios)
- Alternar entre workspaces via dropdown na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase
- Permissões por usuário aplicadas em toda a camada de dados

### Monetização (Stripe)
- Plano Free: até 2 colaboradores e 50 leads
- Plano Pro: colaboradores e leads ilimitados (R$49/mês)
- Checkout integrado via Stripe Checkout
- Webhook para ativar/desativar plano automaticamente
- Customer Portal do Stripe para gerenciamento de assinatura

### Landing Page
- Página pública de apresentação do VibeFlow CRM
- Seções: Hero, Funcionalidades, Planos e Preços, CTA

### Integrações (API)
- Superfície de API própria (Route Handlers) para futuras integrações externas, seguindo o mesmo modelo de autenticação/autorização por workspace

## 5. Stack Técnica

- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS + shadcn/ui
- **Backend/API**: Next.js API Routes + Server Actions (Server Components)
- **Banco de Dados + Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Pagamento**: Stripe (Checkout + Webhooks + Customer Portal)
- **E-mail transacional**: Resend
- **Drag-and-drop**: @dnd-kit
- **Gráficos**: Recharts
- **Linguagem**: TypeScript 5
- **Versionamento**: Git + GitHub
- **Deploy**: Vercel + Supabase
- **IDE**: Cursor com Claude Code no terminal

## 6. Convenções do Projeto

### Nomenclatura
- Arquivos e pastas: `kebab-case` (ex.: `lead-detail-card.tsx`, `pipeline-board/`)
- Componentes React: `PascalCase` (ex.: `LeadDetailCard`)
- Funções, variáveis e hooks: `camelCase` (ex.: `useWorkspaceStore`, `getLeadsByStatus`)
- Tipos e interfaces TypeScript: `PascalCase`, sem prefixo `I` (ex.: `Lead`, `Deal`, `WorkspaceRole`)

### Padrões de Componentes
- Server Components por padrão; usar `"use client"` apenas quando houver interatividade, estado local ou hooks de browser (drag-and-drop, formulários, dropdowns)
- Componentes de UI primitivos (shadcn/ui) ficam isolados em `components/ui` e não devem conter lógica de negócio
- Composição sobre herança: favorecer componentes pequenos e combináveis

### Acesso a Dados
- Leitura/escrita via Server Actions para mutações vindas de formulários e interações internas
- Route Handlers (`/app/api`) reservados para webhooks (Stripe) e futuras integrações externas
- Cliente Supabase diferenciado por contexto: `lib/supabase/server.ts` (Server Components/Actions) e `lib/supabase/client.ts` (Client Components)
- Toda query de dados sensível deve confiar em RLS no Supabase — nunca reimplementar checagem de workspace manualmente no client

### Commits e Git
- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- Branches de feature a partir de `main`, commits atômicos, PR obrigatório para merge

### Testes
- Testes para novas features e correções de bugs, nomeados descrevendo o comportamento esperado
- Rodar suíte de testes antes de cada commit relevante

## 7. Estrutura de Pastas

```
/app
  /(marketing)              -> landing page pública
  /(auth)                   -> login, cadastro, onboarding
  /(dashboard)/[workspace]
    /leads                  -> listagem e detalhe de leads
    /pipeline                -> board Kanban de negócios
    /settings                -> workspace, colaboradores, plano
  /api                      -> route handlers (webhooks Stripe, integrações)
/components
  /ui                        -> primitivos shadcn/ui
  /kanban                    -> board, colunas, cards
  /leads                     -> formulários, listagem, timeline
  /dashboard                 -> cards de métricas, gráfico de funil
/lib
  /supabase                  -> clients server/browser, tipos gerados
  /stripe                    -> checkout, webhooks, portal
  /email                     -> templates e envio via Resend
/docs
  PRD.md
```

## 8. Identidade Visual

**Referências**: HubSpot CRM, Pipedrive e DataCrazy.

- **HubSpot CRM** — pontos fortes: ecossistema completo e integrações abundantes. Pontos fracos: complexo para PMEs, planos caros, curva de aprendizado alta. *Insight aplicado*: simplificar a experiência focando apenas em vendas.
- **Pipedrive** — pontos fortes: UX intuitiva, pipeline Kanban referência de mercado, foco em ação. Pontos fracos: sem plano gratuito, recursos avançados caros. *Insight aplicado*: nosso pipeline Kanban se inspira no Pipedrive, mas com modelo freemium acessível.

### Direção de Design
- **Tom**: profissional, limpo, focado em ação (vender), acessível — nada da complexidade visual do HubSpot
- **Paleta**: cor de destaque única para CTAs e etapas ativas do pipeline; tons neutros de cinza para estrutura (fundos, bordas, texto secundário); cores semânticas para Fechado Ganho (verde) e Fechado Perdido (vermelho/cinza)
- **Tipografia**: hierarquia clara priorizando leitura rápida de métricas no dashboard — números grandes e destacados nos cards, labels discretos
- **Componentes**: colunas Kanban em cards com chrome mínimo, dashboard denso em dados mas arejado (grid de cards de métricas), base em shadcn/ui para consistência e velocidade de implementação

## 9. Processo / Roadmap de Milestones

1. Autenticação + Onboarding + estrutura de workspace
2. Gestão de Leads/Contatos (CRUD, busca, filtros, detalhe)
3. Pipeline Kanban (colunas, cards, drag-and-drop persistente)
4. Registro de Atividades (timeline no detalhe do lead)
5. Dashboard de Métricas (cards + gráfico de funil)
6. Multi-empresa e Colaboração (convites, papéis, RLS, troca de workspace)
7. Monetização Stripe (planos, checkout, webhooks, customer portal)
8. Landing Page pública

Cada milestone deve ser testado e validado antes de avançar para o próximo, priorizando funcionalidade core (Auth → Leads → Kanban) antes de features avançadas (multi-empresa, monetização).

# VibeFlow CRM

CRM SaaS multi-empresa com pipeline visual Kanban, gestão de leads e negócios, registro de atividades e monetização via assinatura.

Consulte [`docs/PRD.md`](./docs/PRD.md) para o briefing completo do produto e [`docs/PLAN.md`](./docs/PLAN.md) para o plano de execução por milestones.

## Stack

- **Frontend**: Next.js (App Router) + React + TypeScript 5 + Tailwind CSS + shadcn/ui
- **Backend/API**: Next.js Route Handlers + Server Actions
- **Banco de Dados + Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Pagamento**: Stripe (Checkout + Webhooks + Customer Portal)
- **E-mail transacional**: Resend
- **Drag-and-drop**: @dnd-kit
- **Gráficos**: Recharts

## Setup

```bash
npm install
cp .env.example .env.local
```

Preencha as variáveis de ambiente em `.env.local` com as credenciais de Supabase, Stripe e Resend.

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts

| Script                | Descrição                                |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Inicia o servidor de desenvolvimento      |
| `npm run build`       | Gera o build de produção                  |
| `npm run start`       | Inicia o servidor com o build de produção |
| `npm run lint`        | Roda o ESLint                             |
| `npm run format`      | Formata o código com Prettier             |
| `npm run format:check`| Verifica formatação sem alterar arquivos  |

## Estrutura de Pastas

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
  PLAN.md
```

## Deploy

O projeto está configurado para deploy contínuo na [Vercel](https://vercel.com).

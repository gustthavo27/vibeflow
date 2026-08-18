-- Monetização via Stripe: vínculo do workspace ao customer/subscription do
-- Stripe e limite de 50 leads no plano Free.

alter table workspaces
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text;

create unique index workspaces_stripe_customer_id_idx on workspaces (stripe_customer_id)
  where stripe_customer_id is not null;

-- Só o backend do webhook (service role) grava esses campos; usuários finais
-- nunca escrevem diretamente em colunas de billing.
revoke update (stripe_customer_id, stripe_subscription_id, subscription_status, plan)
  on workspaces from authenticated;

-- Aplica o limite de 50 leads do plano Free diretamente no insert, para que
-- a regra valha independente do caminho usado (Server Action, RPC, etc).
create function enforce_lead_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan text;
  lead_count int;
begin
  select plan into workspace_plan from public.workspaces where id = new.workspace_id;

  if workspace_plan = 'free' then
    select count(*) into lead_count from public.leads where workspace_id = new.workspace_id;

    if lead_count >= 50 then
      raise exception 'plan_lead_limit';
    end if;
  end if;

  return new;
end;
$$;

create trigger leads_plan_limit_trigger
  before insert on leads
  for each row
  execute function enforce_lead_plan_limit();

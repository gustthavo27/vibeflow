// Popula um workspace de teste com leads, negócios e atividades.
// Uso: npm run seed -- <email-do-usuario-ja-cadastrado>
//
// O usuário precisa já existir (via cadastro real pela UI) porque leads/deals/activities
// são vinculados a um workspace, e o workspace precisa de um owner (auth.users.id).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (via --env-file=.env.local).");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Uso: node --env-file=.env.local scripts/seed.mjs <email-do-usuario>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) throw usersError;

  const user = usersPage.users.find((u) => u.email === email);
  if (!user) {
    throw new Error(`Nenhum usuário encontrado com o e-mail ${email}. Cadastre-se pela UI primeiro.`);
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: "Workspace de Teste", slug: "workspace-de-teste", created_by: user.id })
    .select()
    .single();
  if (workspaceError) throw workspaceError;

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: user.id, role: "admin" });
  if (memberError) throw memberError;

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .insert([
      {
        workspace_id: workspace.id,
        name: "Maria Souza",
        email: "maria@empresa-a.com",
        phone: "(11) 91234-5678",
        company: "Empresa A",
        job_title: "Diretora Comercial",
        status: "proposta_enviada",
        owner_id: user.id,
        deal_value: 8500,
        notes: "Interessada no plano Pro.",
      },
      {
        workspace_id: workspace.id,
        name: "João Lima",
        email: "joao@empresa-b.com",
        phone: "(21) 99876-5432",
        company: "Empresa B",
        job_title: "CEO",
        status: "contato_realizado",
        owner_id: user.id,
        deal_value: 4200,
      },
      {
        workspace_id: workspace.id,
        name: "Ana Paula",
        email: "ana@empresa-c.com",
        company: "Empresa C",
        status: "novo",
        owner_id: user.id,
      },
    ])
    .select();
  if (leadsError) throw leadsError;

  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .insert([
      {
        workspace_id: workspace.id,
        lead_id: leads[0].id,
        title: "Plano Pro — Empresa A",
        estimated_value: 8500,
        stage: "proposta_enviada",
        owner_id: user.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
      {
        workspace_id: workspace.id,
        lead_id: leads[1].id,
        title: "Plano Free → Pro — Empresa B",
        estimated_value: 4200,
        stage: "contato_realizado",
        owner_id: user.id,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
    ])
    .select();
  if (dealsError) throw dealsError;

  const { error: activitiesError } = await supabase.from("activities").insert([
    {
      workspace_id: workspace.id,
      lead_id: leads[0].id,
      type: "email",
      description: "Enviada proposta comercial detalhada.",
      author_id: user.id,
    },
    {
      workspace_id: workspace.id,
      lead_id: leads[1].id,
      type: "ligacao",
      description: "Primeira ligação de qualificação, cliente demonstrou interesse.",
      author_id: user.id,
    },
  ]);
  if (activitiesError) throw activitiesError;

  console.log(`Seed concluído. Workspace: /${workspace.slug} (${leads.length} leads, ${deals.length} negócios)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export type MockWorkspace = {
  id: string;
  slug: string;
  name: string;
  plan: "Free" | "Pro";
};

export const mockWorkspaces: MockWorkspace[] = [
  { id: "1", slug: "acme-vendas", name: "Acme Vendas", plan: "Pro" },
  { id: "2", slug: "nova-era-consultoria", name: "Nova Era Consultoria", plan: "Free" },
  { id: "3", slug: "grupo-orbita", name: "Grupo Órbita", plan: "Free" },
];

export const mockCurrentUser = {
  name: "Bianca Duarte",
  email: "bianca@vibeflow.app",
  initials: "BD",
};

export const leadStatuses = ["Novo", "Contato", "Proposta", "Ganho", "Perdido"] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export const mockTeamMembers = ["Bianca Duarte", "Rafael Souza", "Marina Alves"];

export type Anexo = {
  id: string;
  nome: string;
  tamanhoBytes: number;
};

export type Lead = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  status: LeadStatus;
  responsavel: string;
  criadoEm: string;
  valorNegociado: number;
  notas: string;
  anexos: Anexo[];
};

export const mockLeads: Lead[] = [
  {
    id: "1",
    nome: "Juliana Ferreira",
    email: "juliana.ferreira@nortetech.com.br",
    telefone: "(11) 98221-4457",
    empresa: "Norte Tech Soluções",
    cargo: "Gerente de TI",
    status: "Proposta",
    responsavel: "Bianca Duarte",
    criadoEm: "2026-07-02",
    valorNegociado: 48000,
    notas: "Interessada no pacote enterprise. Reunião marcada para próxima semana.",
    anexos: [],
  },
  {
    id: "2",
    nome: "Carlos Eduardo Lima",
    email: "carlos.lima@grupoalvorada.com",
    telefone: "(21) 99887-3312",
    empresa: "Grupo Alvorada",
    cargo: "Diretor Comercial",
    status: "Contato",
    responsavel: "Rafael Souza",
    criadoEm: "2026-07-05",
    valorNegociado: 22000,
    notas: "Aguardando retorno sobre a proposta comercial enviada.",
    anexos: [],
  },
  {
    id: "3",
    nome: "Patrícia Gomes",
    email: "patricia.gomes@viaconsult.com.br",
    telefone: "(31) 98765-2210",
    empresa: "Via Consultoria",
    cargo: "Sócia-fundadora",
    status: "Novo",
    responsavel: "Marina Alves",
    criadoEm: "2026-07-18",
    valorNegociado: 0,
    notas: "",
    anexos: [],
  },
  {
    id: "4",
    nome: "Rodrigo Almeida",
    email: "rodrigo.almeida@construframe.com.br",
    telefone: "(41) 99123-8876",
    empresa: "ConstruFrame Engenharia",
    cargo: "Coordenador de Compras",
    status: "Ganho",
    responsavel: "Bianca Duarte",
    criadoEm: "2026-06-20",
    valorNegociado: 65000,
    notas: "Contrato assinado. Onboarding agendado com o time técnico.",
    anexos: [],
  },
  {
    id: "5",
    nome: "Fernanda Castro",
    email: "fernanda.castro@bellamoda.com.br",
    telefone: "(11) 97654-9021",
    empresa: "Bella Moda Atacado",
    cargo: "Gerente de Marketing",
    status: "Novo",
    responsavel: "Rafael Souza",
    criadoEm: "2026-07-20",
    valorNegociado: 0,
    notas: "Veio de indicação de outro cliente.",
    anexos: [],
  },
  {
    id: "6",
    nome: "Thiago Martins",
    email: "thiago.martins@agrovaledigital.com",
    telefone: "(62) 98134-5567",
    empresa: "AgroVale Digital",
    cargo: "CEO",
    status: "Proposta",
    responsavel: "Marina Alves",
    criadoEm: "2026-06-28",
    valorNegociado: 38000,
    notas: "Precisa de integração com sistema legado antes de fechar.",
    anexos: [],
  },
  {
    id: "7",
    nome: "Larissa Barbosa",
    email: "larissa.barbosa@saudeplenavida.com.br",
    telefone: "(51) 99456-7723",
    empresa: "Saúde Plena Vida",
    cargo: "Gerente Administrativa",
    status: "Perdido",
    responsavel: "Bianca Duarte",
    criadoEm: "2026-06-15",
    valorNegociado: 0,
    notas: "Optou por concorrente com preço mais baixo.",
    anexos: [],
  },
  {
    id: "8",
    nome: "André Nogueira",
    email: "andre.nogueira@portoexpress.com.br",
    telefone: "(85) 98812-3345",
    empresa: "Porto Express Logística",
    cargo: "Supervisor de Operações",
    status: "Contato",
    responsavel: "Rafael Souza",
    criadoEm: "2026-07-10",
    valorNegociado: 15000,
    notas: "",
    anexos: [],
  },
  {
    id: "9",
    nome: "Camila Ribeiro",
    email: "camila.ribeiro@edutechbrasil.com.br",
    telefone: "(11) 96543-1198",
    empresa: "EduTech Brasil",
    cargo: "Head de Produto",
    status: "Proposta",
    responsavel: "Marina Alves",
    criadoEm: "2026-07-14",
    valorNegociado: 27000,
    notas: "Lead de alta prioridade, veio de indicação da EduPrime.",
    anexos: [],
  },
  {
    id: "10",
    nome: "Bruno Cardoso",
    email: "bruno.cardoso@metalfortesp.com.br",
    telefone: "(19) 99321-4487",
    empresa: "Metal Forte SP",
    cargo: "Diretor Industrial",
    status: "Ganho",
    responsavel: "Bianca Duarte",
    criadoEm: "2026-06-08",
    valorNegociado: 52000,
    notas: "Cliente convertido, satisfeito com o tempo de implantação.",
    anexos: [],
  },
  {
    id: "11",
    nome: "Isabela Tavares",
    email: "isabela.tavares@luminacosmeticos.com.br",
    telefone: "(81) 98765-6634",
    empresa: "Lumina Cosméticos",
    cargo: "Gerente de E-commerce",
    status: "Novo",
    responsavel: "Rafael Souza",
    criadoEm: "2026-07-22",
    valorNegociado: 0,
    notas: "",
    anexos: [],
  },
  {
    id: "12",
    nome: "Gustavo Pereira",
    email: "gustavo.pereira@rotaseguraseguros.com.br",
    telefone: "(48) 99678-2245",
    empresa: "Rota Segura Seguros",
    cargo: "Analista de Novos Negócios",
    status: "Contato",
    responsavel: "Marina Alves",
    criadoEm: "2026-07-08",
    valorNegociado: 9000,
    notas: "Pediu para retornar contato depois do fechamento do trimestre.",
    anexos: [],
  },
  {
    id: "13",
    nome: "Vanessa Rocha",
    email: "vanessa.rocha@arqvivadesign.com.br",
    telefone: "(11) 95432-8871",
    empresa: "Arq Viva Design",
    cargo: "Sócia-diretora",
    status: "Perdido",
    responsavel: "Bianca Duarte",
    criadoEm: "2026-06-25",
    valorNegociado: 0,
    notas: "Sem orçamento disponível neste ano.",
    anexos: [],
  },
];

export const activityTypes = ["Ligação", "E-mail", "Reunião", "Nota"] as const;

export type ActivityType = (typeof activityTypes)[number];

export type Activity = {
  id: string;
  leadId: string;
  tipo: ActivityType;
  descricao: string;
  autor: string;
  data: string;
};

export const mockActivities: Activity[] = [
  {
    id: "a1",
    leadId: "1",
    tipo: "E-mail",
    descricao: "Envio de material institucional e proposta inicial de parceria.",
    autor: "Bianca Duarte",
    data: "2026-07-02T09:15:00",
  },
  {
    id: "a2",
    leadId: "1",
    tipo: "Ligação",
    descricao: "Contato para entender necessidades de infraestrutura de TI.",
    autor: "Bianca Duarte",
    data: "2026-07-05T14:30:00",
  },
  {
    id: "a3",
    leadId: "1",
    tipo: "Reunião",
    descricao: "Reunião de descoberta com time técnico da Norte Tech.",
    autor: "Rafael Souza",
    data: "2026-07-11T11:00:00",
  },
  {
    id: "a4",
    leadId: "1",
    tipo: "Nota",
    descricao: "Cliente sinalizou orçamento aprovado para o próximo trimestre.",
    autor: "Bianca Duarte",
    data: "2026-07-15T16:45:00",
  },
  {
    id: "a5",
    leadId: "2",
    tipo: "Ligação",
    descricao: "Primeiro contato, apresentação da VibeFlow e próximos passos.",
    autor: "Rafael Souza",
    data: "2026-07-05T10:20:00",
  },
  {
    id: "a6",
    leadId: "2",
    tipo: "E-mail",
    descricao: "Envio de proposta comercial com valores e condições.",
    autor: "Rafael Souza",
    data: "2026-07-09T08:50:00",
  },
  {
    id: "a7",
    leadId: "4",
    tipo: "Reunião",
    descricao: "Reunião de fechamento e assinatura do contrato.",
    autor: "Bianca Duarte",
    data: "2026-06-19T13:00:00",
  },
  {
    id: "a8",
    leadId: "4",
    tipo: "Nota",
    descricao: "Cliente convertido. Onboarding agendado para a próxima semana.",
    autor: "Bianca Duarte",
    data: "2026-06-20T09:00:00",
  },
  {
    id: "a9",
    leadId: "6",
    tipo: "E-mail",
    descricao: "Follow-up após demonstração do produto.",
    autor: "Marina Alves",
    data: "2026-06-30T15:10:00",
  },
  {
    id: "a10",
    leadId: "6",
    tipo: "Ligação",
    descricao: "Alinhamento sobre integração com sistema legado da AgroVale.",
    autor: "Marina Alves",
    data: "2026-07-04T17:25:00",
  },
  {
    id: "a11",
    leadId: "9",
    tipo: "Nota",
    descricao: "Lead veio de indicação da EduPrime, alta prioridade.",
    autor: "Marina Alves",
    data: "2026-07-14T10:00:00",
  },
  {
    id: "a12",
    leadId: "9",
    tipo: "Reunião",
    descricao: "Demonstração do produto para o time de produto da EduTech.",
    autor: "Marina Alves",
    data: "2026-07-18T14:00:00",
  },
];

export const dealStages = [
  "Novo Lead",
  "Contato Realizado",
  "Proposta Enviada",
  "Negociação",
  "Fechado Ganho",
  "Fechado Perdido",
] as const;

export type DealStage = (typeof dealStages)[number];

export type Deal = {
  id: string;
  titulo: string;
  valorEstimado: number;
  leadId: string;
  responsavel: string;
  prazo: string;
  etapa: DealStage;
  notas: string;
  anexos: Anexo[];
};

export const mockDeals: Deal[] = [
  {
    id: "d1",
    titulo: "Implantação CRM - Bella Moda Atacado",
    valorEstimado: 18000,
    leadId: "5",
    responsavel: "Rafael Souza",
    prazo: "2026-08-25",
    etapa: "Novo Lead",
    anexos: [],
    notas: "",
  },
  {
    id: "d2",
    titulo: "Diagnóstico Inicial - Via Consultoria",
    valorEstimado: 12000,
    leadId: "3",
    responsavel: "Marina Alves",
    prazo: "2026-08-30",
    etapa: "Novo Lead",
    anexos: [],
    notas: "",
  },
  {
    id: "d3",
    titulo: "Avaliação de Necessidades - Lumina Cosméticos",
    valorEstimado: 21000,
    leadId: "11",
    responsavel: "Rafael Souza",
    prazo: "2026-09-05",
    etapa: "Novo Lead",
    anexos: [],
    notas: "",
  },
  {
    id: "d4",
    titulo: "Expansão de Licenças - Porto Express Logística",
    valorEstimado: 15000,
    leadId: "8",
    responsavel: "Rafael Souza",
    prazo: "2026-08-05",
    etapa: "Contato Realizado",
    anexos: [],
    notas: "",
  },
  {
    id: "d5",
    titulo: "Pacote Consultoria - Rota Segura Seguros",
    valorEstimado: 9000,
    leadId: "12",
    responsavel: "Marina Alves",
    prazo: "2026-08-18",
    etapa: "Contato Realizado",
    anexos: [],
    notas: "",
  },
  {
    id: "d6",
    titulo: "Upgrade de Plano - Grupo Alvorada",
    valorEstimado: 22000,
    leadId: "2",
    responsavel: "Rafael Souza",
    prazo: "2026-08-02",
    etapa: "Contato Realizado",
    anexos: [],
    notas: "",
  },
  {
    id: "d7",
    titulo: "Proposta Enterprise - Norte Tech Soluções",
    valorEstimado: 48000,
    leadId: "1",
    responsavel: "Bianca Duarte",
    prazo: "2026-08-20",
    etapa: "Proposta Enviada",
    anexos: [],
    notas: "",
  },
  {
    id: "d8",
    titulo: "Proposta Comercial - AgroVale Digital",
    valorEstimado: 38000,
    leadId: "6",
    responsavel: "Marina Alves",
    prazo: "2026-07-28",
    etapa: "Proposta Enviada",
    anexos: [],
    notas: "",
  },
  {
    id: "d9",
    titulo: "Renovação Anual - EduTech Brasil",
    valorEstimado: 27000,
    leadId: "9",
    responsavel: "Marina Alves",
    prazo: "2026-08-22",
    etapa: "Proposta Enviada",
    anexos: [],
    notas: "",
  },
  {
    id: "d10",
    titulo: "Ajuste de Escopo - Metal Forte SP",
    valorEstimado: 60000,
    leadId: "10",
    responsavel: "Bianca Duarte",
    prazo: "2026-08-15",
    etapa: "Negociação",
    anexos: [],
    notas: "",
  },
  {
    id: "d11",
    titulo: "Negociação de Contrato - Saúde Plena Vida",
    valorEstimado: 25000,
    leadId: "7",
    responsavel: "Bianca Duarte",
    prazo: "2026-08-01",
    etapa: "Negociação",
    anexos: [],
    notas: "",
  },
  {
    id: "d12",
    titulo: "Condições Comerciais - Arq Viva Design",
    valorEstimado: 16000,
    leadId: "13",
    responsavel: "Bianca Duarte",
    prazo: "2026-08-14",
    etapa: "Negociação",
    anexos: [],
    notas: "",
  },
  {
    id: "d13",
    titulo: "Contrato Fechado - ConstruFrame Engenharia",
    valorEstimado: 65000,
    leadId: "4",
    responsavel: "Bianca Duarte",
    prazo: "2026-06-19",
    etapa: "Fechado Ganho",
    anexos: [],
    notas: "",
  },
  {
    id: "d14",
    titulo: "Assinatura Confirmada - Metal Forte SP",
    valorEstimado: 52000,
    leadId: "10",
    responsavel: "Bianca Duarte",
    prazo: "2026-06-05",
    etapa: "Fechado Ganho",
    anexos: [],
    notas: "",
  },
  {
    id: "d15",
    titulo: "Fechamento Piloto - Norte Tech Soluções",
    valorEstimado: 15000,
    leadId: "1",
    responsavel: "Bianca Duarte",
    prazo: "2026-07-30",
    etapa: "Fechado Ganho",
    anexos: [],
    notas: "",
  },
  {
    id: "d16",
    titulo: "Oportunidade Perdida - Saúde Plena Vida",
    valorEstimado: 18000,
    leadId: "7",
    responsavel: "Bianca Duarte",
    prazo: "2026-06-15",
    etapa: "Fechado Perdido",
    anexos: [],
    notas: "",
  },
  {
    id: "d17",
    titulo: "Perdido para Concorrência - Arq Viva Design",
    valorEstimado: 14000,
    leadId: "13",
    responsavel: "Bianca Duarte",
    prazo: "2026-06-25",
    etapa: "Fechado Perdido",
    anexos: [],
    notas: "",
  },
  {
    id: "d18",
    titulo: "Sem Orçamento - Rota Segura Seguros",
    valorEstimado: 9000,
    leadId: "12",
    responsavel: "Marina Alves",
    prazo: "2026-06-30",
    etapa: "Fechado Perdido",
    anexos: [],
    notas: "",
  },
];

// Tipos gerados manualmente a partir de supabase/migrations/0001_schema.sql.
// Para regenerar automaticamente após alterar o schema (requer Supabase CLI logado):
//   npx supabase gen types typescript --project-id <project-ref> > lib/supabase/types.ts

export type WorkspaceRole = "admin" | "member";

export type WorkspaceInviteStatus = "pending" | "accepted" | "revoked";

export type LeadStatus =
  | "novo"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export type DealStage =
  | "novo_lead"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export type ActivityType = "ligacao" | "email" | "reuniao" | "nota";

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "free" | "pro";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "free" | "pro";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Insert"]>;
        Relationships: [];
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          job_title: string | null;
          status: LeadStatus;
          owner_id: string | null;
          deal_value: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          job_title?: string | null;
          status?: LeadStatus;
          owner_id?: string | null;
          deal_value?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          workspace_id: string;
          lead_id: string | null;
          title: string;
          estimated_value: number;
          stage: DealStage;
          owner_id: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          lead_id?: string | null;
          title: string;
          estimated_value?: number;
          stage?: DealStage;
          owner_id?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_invites: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: WorkspaceRole;
          invited_by: string | null;
          token: string;
          status: WorkspaceInviteStatus;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: WorkspaceRole;
          invited_by?: string | null;
          token?: string;
          status?: WorkspaceInviteStatus;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_invites"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          workspace_id: string;
          lead_id: string;
          type: ActivityType;
          description: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          lead_id: string;
          type: ActivityType;
          description: string;
          author_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_workspace_with_owner: {
        Args: { workspace_name: string; workspace_slug: string };
        Returns: Database["public"]["Tables"]["workspaces"]["Row"];
      };
      list_workspace_members: {
        Args: { target_workspace_id: string };
        Returns: { user_id: string; email: string; role: WorkspaceRole }[];
      };
      create_workspace_invite: {
        Args: { target_workspace_id: string; invite_email: string; invite_role?: WorkspaceRole };
        Returns: Database["public"]["Tables"]["workspace_invites"]["Row"];
      };
      get_invite_by_token: {
        Args: { invite_token: string };
        Returns: {
          workspace_name: string;
          workspace_slug: string;
          email: string;
          role: WorkspaceRole;
          status: WorkspaceInviteStatus;
          expires_at: string;
        }[];
      };
      accept_workspace_invite: {
        Args: { invite_token: string };
        Returns: Database["public"]["Tables"]["workspace_members"]["Row"];
      };
    };
  };
}

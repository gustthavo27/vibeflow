"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, UserX } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { changeMemberRole, removeMember } from "@/lib/actions/members";
import { createInvite, revokeInvite } from "@/lib/actions/invites";
import { FREE_PLAN_MEMBER_LIMIT, WORKSPACE_ROLE_LABELS, WORKSPACE_ROLE_OPTIONS } from "@/lib/labels";
import { validateEmail } from "@/lib/validation/auth";
import type { Database, WorkspaceRole } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type WorkspaceInvite = Database["public"]["Tables"]["workspace_invites"]["Row"];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function CollaboratorsView({
  workspace,
  plan,
  members: initialMembers,
  invites: initialInvites,
  currentUserId,
  isAdmin,
}: {
  workspace: string;
  plan: "free" | "pro";
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [pageError, setPageError] = useState<string>();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviteError, setInviteError] = useState<string>();
  const [isInviting, setIsInviting] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const adminCount = members.filter((member) => member.role === "admin").length;
  const occupiedSeats = members.length + invites.length;
  const atFreeLimit = plan === "free" && occupiedSeats >= FREE_PLAN_MEMBER_LIMIT;

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(inviteEmail);
    setInviteError(emailError);
    if (emailError) return;

    setIsInviting(true);
    setPageError(undefined);
    const result = await createInvite(workspace, inviteEmail, inviteRole);
    setIsInviting(false);

    if (!result.success) {
      setInviteError(result.fieldErrors?.email);
      if (!result.fieldErrors) setPageError(result.error);
      return;
    }

    setInvites((current) => [result.data, ...current]);
    setInviteEmail("");
    setInviteRole("member");
  }

  async function handleRoleChange(member: WorkspaceMember, role: WorkspaceRole) {
    if (role === member.role) return;

    setUpdatingRoleFor(member.user_id);
    setPageError(undefined);
    const result = await changeMemberRole(workspace, member.user_id, role);
    setUpdatingRoleFor(null);

    if (!result.success) {
      setPageError(result.error);
      return;
    }

    setMembers((current) =>
      current.map((item) => (item.user_id === member.user_id ? { ...item, role } : item)),
    );
  }

  async function handleRemove(member: WorkspaceMember) {
    setIsRemoving(true);
    setPageError(undefined);
    const result = await removeMember(workspace, member.user_id);
    setIsRemoving(false);
    setMemberToRemove(null);

    if (!result.success) {
      setPageError(result.error);
      return;
    }

    setMembers((current) => current.filter((item) => item.user_id !== member.user_id));
  }

  async function handleRevoke(invite: WorkspaceInvite) {
    setRevokingId(invite.id);
    setPageError(undefined);
    const result = await revokeInvite(workspace, invite.id);
    setRevokingId(null);

    if (!result.success) {
      setPageError(result.error);
      return;
    }

    setInvites((current) => current.filter((item) => item.id !== invite.id));
  }

  return (
    <div className="flex flex-col gap-6">
      {pageError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
          {pageError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
          <CardDescription>
            {plan === "free"
              ? `Plano Free — ${occupiedSeats}/${FREE_PLAN_MEMBER_LIMIT} vagas ocupadas (membros + convites pendentes).`
              : "Plano Pro — sem limite de colaboradores."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                {isAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isSelf = member.user_id === currentUserId;
                const isLastAdmin = member.role === "admin" && adminCount <= 1;

                return (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium text-foreground">
                      {member.email}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          value={member.role}
                          disabled={isSelf && isLastAdmin ? true : updatingRoleFor === member.user_id}
                          onValueChange={(role) => handleRoleChange(member, role as WorkspaceRole)}
                        >
                          <SelectTrigger size="sm" className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKSPACE_ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {WORKSPACE_ROLE_LABELS[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{WORKSPACE_ROLE_LABELS[member.role]}</Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSelf || isLastAdmin}
                          onClick={() => setMemberToRemove(member)}
                        >
                          <UserX className="size-4" />
                          Remover
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Convidar colaborador</CardTitle>
            <CardDescription>
              Enviamos um e-mail com um link de aceite. Convites expiram em 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={handleInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <FieldGroup className="flex-1">
                <Field data-invalid={!!inviteError}>
                  <FieldLabel htmlFor="inviteEmail">E-mail do colaborador</FieldLabel>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="colega@empresa.com"
                    value={inviteEmail}
                    aria-invalid={!!inviteError}
                    disabled={atFreeLimit}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <FieldError>{inviteError}</FieldError>
                </Field>
              </FieldGroup>

              <Select
                value={inviteRole}
                disabled={atFreeLimit}
                onValueChange={(role) => setInviteRole(role as WorkspaceRole)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {WORKSPACE_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={isInviting || atFreeLimit}>
                {isInviting ? <Loader2 className="animate-spin" /> : <Mail />}
                {isInviting ? "Enviando..." : "Enviar convite"}
              </Button>
            </form>

            {atFreeLimit && (
              <p className="mt-3 text-sm text-muted-foreground">
                O plano Free permite no máximo {FREE_PLAN_MEMBER_LIMIT} membros. Faça upgrade para o
                plano Pro para convidar mais colaboradores.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes</CardTitle>
            <CardDescription>Convites enviados que ainda não foram aceitos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium text-foreground">{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{WORKSPACE_ROLE_LABELS[invite.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invite.expires_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={revokingId === invite.id}
                        onClick={() => handleRevoke(invite)}
                      >
                        {revokingId === invite.id ? "Revogando..." : "Revogar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {memberToRemove?.email} deste workspace? Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isRemoving}
              onClick={() => memberToRemove && handleRemove(memberToRemove)}
            >
              {isRemoving ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { CollaboratorsView };

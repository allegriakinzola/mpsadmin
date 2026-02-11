import { getUsers, getCurrentUserRole } from "@/app/actions/users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog } from "lucide-react";
import { redirect } from "next/navigation";
import { UsersClient } from "./client";

export default async function UsersPage() {
  const currentUserRole = await getCurrentUserRole();
  
  // Rediriger si l'utilisateur n'est pas admin
  if (currentUserRole !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const agentCount = users.filter((u) => u.role === "agent").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Créez et gérez les comptes utilisateurs de la plateforme
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{agentCount}</div>
          </CardContent>
        </Card>
      </div>

      <UsersClient users={users} />
    </div>
  );
}

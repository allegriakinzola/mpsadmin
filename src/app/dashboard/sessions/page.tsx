"use client";

import { useState, useEffect } from "react";
import { getSessions, createSession, updateSession, deleteSession } from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Pencil, Trash2, Eye, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Session = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  courses: { id: string }[];
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data as Session[]);
    setLoading(false);
  };

  const handleOpenModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name,
        description: session.description || "",
        startDate: new Date(session.startDate).toISOString().split("T")[0],
        endDate: new Date(session.endDate).toISOString().split("T")[0],
      });
    } else {
      setEditingSession(null);
      setFormData({ name: "", description: "", startDate: "", endDate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSession) {
      await updateSession(editingSession.id, {
        name: formData.name,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    } else {
      await createSession({
        name: formData.name,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    }

    setIsModalOpen(false);
    loadSessions();
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    loadSessions();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-1">Gérez vos sessions de formation</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Liste des sessions
              </CardTitle>
              <CardDescription>{sessions.length} session(s) au total</CardDescription>
            </div>
            <Badge variant="outline">{sessions.filter(s => s.isActive).length} actives</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucune session</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Commencez par créer votre première session de formation.
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Créer une session
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(session.startDate)} - {formatDate(session.endDate)}
                        </div>
                      </div>
                      <Badge variant={session.isActive ? "success" : "muted"}>
                        {session.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {session.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{session.courses.length} cours</span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/dashboard/sessions/${session.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voir les détails</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(session)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                      </Tooltip>
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Supprimer</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la session ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La session "{session.name}" et tous ses cours associés seront supprimés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Modifier la session" : "Nouvelle session"}</DialogTitle>
            <DialogDescription>
              {editingSession 
                ? "Modifiez les informations de la session ci-dessous."
                : "Remplissez les informations pour créer une nouvelle session de formation."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la session</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingSession ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

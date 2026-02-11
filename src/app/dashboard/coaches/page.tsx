"use client";

import { useState, useEffect } from "react";
import { getCoaches, createCoach, updateCoach, deleteCoach } from "@/app/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  courses: { id: string }[];
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    const data = await getCoaches();
    setCoaches(data as Coach[]);
    setLoading(false);
  };

  const handleOpenModal = (coach?: Coach) => {
    if (coach) {
      setEditingCoach(coach);
      setFormData({
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
        phone: coach.phone || "",
        specialty: coach.specialty || "",
      });
    } else {
      setEditingCoach(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", specialty: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCoach) {
      await updateCoach(editingCoach.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        specialty: formData.specialty || undefined,
      });
    } else {
      await createCoach({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        specialty: formData.specialty || undefined,
      });
    }

    setIsModalOpen(false);
    loadCoaches();
  };

  const handleDelete = async (id: string) => {
    await deleteCoach(id);
    loadCoaches();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Coachs</h1>
          <p className="text-muted-foreground mt-1">Gérez vos formateurs</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau coach
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Liste des coachs
              </CardTitle>
              <CardDescription>{coaches.length} coach(s) enregistré(s)</CardDescription>
            </div>
            <Badge variant="outline">{coaches.reduce((acc, c) => acc + c.courses.length, 0)} cours assignés</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {coaches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucun coach</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Ajoutez votre premier formateur pour commencer.
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un coach
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coach</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(coach.firstName, coach.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{coach.firstName} {coach.lastName}</p>
                          <p className="text-sm text-muted-foreground">{coach.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coach.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {coach.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {coach.specialty ? (
                        <Badge variant="secondary">{coach.specialty}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{coach.courses.length} cours</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(coach)}
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
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  disabled={coach.courses.length > 0}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              {coach.courses.length > 0 
                                ? "Impossible de supprimer (cours assignés)" 
                                : "Supprimer"
                              }
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le coach ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le coach "{coach.firstName} {coach.lastName}" sera supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(coach.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCoach ? "Modifier le coach" : "Nouveau coach"}</DialogTitle>
            <DialogDescription>
              {editingCoach 
                ? "Modifiez les informations du coach ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau formateur."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Mathématiques, Informatique..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingCoach ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

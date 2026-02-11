"use client";

import { useState, useEffect } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Eye, GraduationCap, Phone } from "lucide-react";
import Link from "next/link";

const tradingLevels = [
  { value: "debutant", label: "Débutant (je découvre)" },
  { value: "intermediaire", label: "Intermédiaire (je connais les bases)" },
  { value: "avance", label: "Avancé (en quête de stratégie gagnante)" },
  { value: "confirme", label: "Confirmé (Besoin d'approfondissement)" },
  { value: "pro", label: "Pro (Besoin de Comprendre l'actif)" },
];

const derivOptions = [
  { value: "oui_actif", label: "Oui et je Trade déjà régulièrement" },
  { value: "oui_inactif", label: "Oui mais je n'y ai pas touché depuis plus d'un mois" },
  { value: "oui_perdu", label: "Oui mais j'ai perdu les Coordonnées" },
  { value: "non", label: "Non pas encore (aidez-moi à en avoir un)" },
];

const paymentMethods = [
  { value: "crypto", label: "Crypto (USDT)" },
  { value: "mobile", label: "Transfert Mobile (M-Pesa, Orange Money, Airtel, etc.)" },
  { value: "virement", label: "Virement Bancaire" },
];

const scheduleOptions = [
  { value: "avant-midi", label: "Avant-midi (06h00 - 08h30)" },
  { value: "apres-midi", label: "Après-midi (16h30 - 19h00)" },
  { value: "samedi", label: "Séance spéciale pratique Samedi (08h00 - 10h30)" },
];

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  tradingLevel: string | null;
  hasDeriv: string | null;
  paymentMethod: string | null;
  expectations: string | null;
  preferredSchedule: string | null;
  enrollments: { id: string }[];
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    tradingLevel: "",
    hasDeriv: "",
    paymentMethod: "",
    expectations: "",
    preferredSchedule: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await getStudents();
    setStudents(data as Student[]);
    setLoading(false);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || "",
        address: student.address || "",
        tradingLevel: student.tradingLevel || "",
        hasDeriv: student.hasDeriv || "",
        paymentMethod: student.paymentMethod || "",
        expectations: student.expectations || "",
        preferredSchedule: student.preferredSchedule || "",
      });
    } else {
      setEditingStudent(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        tradingLevel: "",
        hasDeriv: "",
        paymentMethod: "",
        expectations: "",
        preferredSchedule: "",
      });
    }
    setIsModalOpen(true);
  };

  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (editingStudent) {
      await updateStudent(editingStudent.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        tradingLevel: formData.tradingLevel || undefined,
        hasDeriv: formData.hasDeriv || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        expectations: formData.expectations || undefined,
        preferredSchedule: formData.preferredSchedule || undefined,
      });
      setIsModalOpen(false);
      loadStudents();
    } else {
      const result = await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        tradingLevel: formData.tradingLevel || undefined,
        hasDeriv: formData.hasDeriv || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        expectations: formData.expectations || undefined,
        preferredSchedule: formData.preferredSchedule || undefined,
      });

      if (!result.success) {
        setFormError(result.error || "Erreur lors de la création");
        return;
      }

      setIsModalOpen(false);
      loadStudents();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteStudent(id);
    loadStudents();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
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
          <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground mt-1">Gérez vos apprenants</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel étudiant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Liste des étudiants
              </CardTitle>
              <CardDescription>{students.length} étudiant(s) enregistré(s)</CardDescription>
            </div>
            <Badge variant="outline">{students.reduce((acc, s) => acc + s.enrollments.length, 0)} inscriptions</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucun étudiant</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Ajoutez votre premier apprenant pour commencer.
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un étudiant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Inscriptions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.enrollments.length} cours</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/students/${student.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voir le profil</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(student)}
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
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Supprimer</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'étudiant ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'étudiant "{student.firstName} {student.lastName}" sera supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(student.id)}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Modifier l'étudiant" : "Nouvel étudiant"}</DialogTitle>
            <DialogDescription>
              {editingStudent 
                ? "Modifiez les informations de l'étudiant ci-dessous."
                : "Remplissez les informations pour ajouter un nouvel apprenant."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}  
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingLevel">Niveau en trading</Label>
              <NativeSelect
                id="tradingLevel"
                value={formData.tradingLevel}
                onChange={(e) => setFormData({ ...formData, tradingLevel: e.target.value })}
              >
                <option value="">Sélectionnez un niveau</option>
                {tradingLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasDeriv">Compte Deriv</Label>
              <NativeSelect
                id="hasDeriv"
                value={formData.hasDeriv}
                onChange={(e) => setFormData({ ...formData, hasDeriv: e.target.value })}
              >
                <option value="">Sélectionnez une option</option>
                {derivOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <NativeSelect
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="">Sélectionnez un mode</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredSchedule">Vacation souhaitée</Label>
              <NativeSelect
                id="preferredSchedule"
                value={formData.preferredSchedule}
                onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
              >
                <option value="">Sélectionnez une vacation</option>
                {scheduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectations">Attentes sur la formation</Label>
              <Textarea
                id="expectations"
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingStudent ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

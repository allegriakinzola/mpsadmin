"use client";

import { useState } from "react";
import { updateCourse, deleteCourse } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
};

type Course = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  price: number;
  maxStudents: number;
  sessionsPerDay: number;
  weekDays: string[];
  vacations: string[];
  startDate: Date | null;
  endDate: Date | null;
  coachId: string;
  sessionId: string;
};

const formatDateForInput = (date: Date | null) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export function CourseActionsClient({
  course,
  coaches,
}: {
  course: Course;
  coaches: Coach[];
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const weekDayOptions = [
    { value: "lundi", label: "Lundi" },
    { value: "mardi", label: "Mardi" },
    { value: "mercredi", label: "Mercredi" },
    { value: "jeudi", label: "Jeudi" },
    { value: "vendredi", label: "Vendredi" },
    { value: "samedi", label: "Samedi" },
    { value: "dimanche", label: "Dimanche" },
  ];

  const vacationOptions = [
    { value: "avant-midi", label: "Avant-midi (06h00 - 08h30)" },
    { value: "apres-midi", label: "Après-midi (16h30 - 19h00)" },
    { value: "samedi", label: "Séance pratique Samedi (08h00 - 10h30)" },
  ];

  const [formData, setFormData] = useState({
    name: course.name,
    description: course.description || "",
    imageUrl: course.imageUrl || "",
    location: course.location || "",
    price: course.price.toString(),
    maxStudents: course.maxStudents.toString(),
    sessionsPerDay: course.sessionsPerDay.toString(),
    weekDays: course.weekDays || [],
    vacations: course.vacations || [],
    startDate: formatDateForInput(course.startDate),
    endDate: formatDateForInput(course.endDate),
    coachId: course.coachId,
  });

  const toggleWeekDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day]
    }));
  };

  const toggleVacation = (vacation: string) => {
    setFormData(prev => ({
      ...prev,
      vacations: prev.vacations.includes(vacation)
        ? prev.vacations.filter(v => v !== vacation)
        : [...prev.vacations, vacation]
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.weekDays.length === 0) {
      alert("Veuillez sélectionner au moins un jour de la semaine.");
      return;
    }

    if (formData.vacations.length === 0) {
      alert("Veuillez sélectionner au moins une vacation.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    await updateCourse(course.id, {
      name: formData.name,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      location: formData.location || undefined,
      price: parseFloat(formData.price) || 0,
      maxStudents: parseInt(formData.maxStudents),
      sessionsPerDay: parseInt(formData.sessionsPerDay),
      weekDays: formData.weekDays,
      vacations: formData.vacations,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      coachId: formData.coachId,
      regenerateSchedules: true,
    });

    setIsEditModalOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteCourse(course.id);
    router.push(`/dashboard/sessions/${course.sessionId}`);
  };

  const openEditModal = () => {
    setFormData({
      name: course.name,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      location: course.location || "",
      price: course.price.toString(),
      maxStudents: course.maxStudents.toString(),
      sessionsPerDay: course.sessionsPerDay.toString(),
      weekDays: course.weekDays || [],
      vacations: course.vacations || [],
      startDate: formatDateForInput(course.startDate),
      endDate: formatDateForInput(course.endDate),
      coachId: course.coachId,
    });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={openEditModal}>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le cours ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le cours &quot;{course.name}&quot; et toutes ses inscriptions seront supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le cours</DialogTitle>
            <DialogDescription>
              Modifiez les informations du cours ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du cours *</Label>
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
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coachId">Coach *</Label>
                <NativeSelect
                  id="coachId"
                  value={formData.coachId}
                  onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Salle A101 ou En ligne"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix de la formation (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: 250"
                required
              />
              <p className="text-xs text-muted-foreground">
                1ère tranche: {Math.round(parseFloat(formData.price || "0") * 0.4)} USD (40%) | 
                2ème tranche: {Math.round(parseFloat(formData.price || "0") * 0.6)} USD (60%)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Capacité max</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionsPerDay">Séances/jour</Label>
                <Input
                  id="sessionsPerDay"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.sessionsPerDay}
                  onChange={(e) => setFormData({ ...formData, sessionsPerDay: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jours de la semaine *</Label>
              <div className="flex flex-wrap gap-2">
                {weekDayOptions.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.weekDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWeekDay(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vacations disponibles *</Label>
              <div className="flex flex-wrap gap-2">
                {vacationOptions.map((vacation) => (
                  <Button
                    key={vacation.value}
                    type="button"
                    variant={formData.vacations.includes(vacation.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleVacation(vacation.value)}
                    className="text-xs"
                  >
                    {vacation.label}
                  </Button>
                ))}
              </div>
            </div>

            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
};

type Schedule = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
};

type Course = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  maxStudents: number;
  coachId: string;
  sessionId: string;
  schedules: Schedule[];
};

type ScheduleInput = {
  date: string;
  startTime: string;
  endTime: string;
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

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const formatTimeForInput = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState({
    name: course.name,
    description: course.description || "",
    imageUrl: course.imageUrl || "",
    location: course.location || "",
    maxStudents: course.maxStudents.toString(),
    coachId: course.coachId,
  });

  const [schedules, setSchedules] = useState<ScheduleInput[]>(
    course.schedules.map((s) => ({
      date: formatDateForInput(s.date),
      startTime: formatTimeForInput(s.startTime),
      endTime: formatTimeForInput(s.endTime),
    }))
  );

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", startTime: "09:00", endTime: "10:00" }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof ScheduleInput, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const schedulesData = schedules
      .filter((s) => s.date && s.startTime && s.endTime)
      .map((s) => ({
        date: new Date(s.date),
        startTime: new Date(`${s.date}T${s.startTime}:00`),
        endTime: new Date(`${s.date}T${s.endTime}:00`),
      }));

    await updateCourse(course.id, {
      name: formData.name,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      location: formData.location || undefined,
      maxStudents: parseInt(formData.maxStudents),
      coachId: formData.coachId,
      schedules: schedulesData,
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
      maxStudents: course.maxStudents.toString(),
      coachId: course.coachId,
    });
    setSchedules(
      course.schedules.map((s) => ({
        date: formatDateForInput(s.date),
        startTime: formatTimeForInput(s.startTime),
        endTime: formatTimeForInput(s.endTime),
      }))
    );
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
              <Label htmlFor="maxStudents">Nombre max d&apos;étudiants</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              />
            </div>

            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dates et horaires</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSchedule}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une date
                </Button>
              </div>

              <div className="space-y-3">
                {schedules.map((schedule, index) => (
                  <div key={index} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={schedule.date}
                        onChange={(e) => updateSchedule(index, "date", e.target.value)}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Début</Label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateSchedule(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSchedule(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune séance programmée. Cliquez sur &quot;Ajouter une date&quot; pour en créer.
                  </p>
                )}
              </div>
            </div>

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

"use client";

import { useState } from "react";
import { createCourse, deleteCourse } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Eye, MapPin, Users, Calendar, Clock, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  coach: Coach;
  enrollments: { id: string }[];
  schedules: Schedule[];
};

type Session = {
  id: string;
  name: string;
  courses: Course[];
};

type ScheduleInput = {
  date: string;
  startTime: string;
  endTime: string;
};

export function SessionCoursesClient({
  session,
  coaches,
}: {
  session: Session;
  coaches: Coach[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    location: "",
    maxStudents: "30",
    coachId: "",
  });

  const [schedules, setSchedules] = useState<ScheduleInput[]>([
    { date: "", startTime: "09:00", endTime: "10:00" }
  ]);

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", startTime: "09:00", endTime: "10:00" }]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, field: keyof ScheduleInput, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schedulesData = schedules
      .filter(s => s.date && s.startTime && s.endTime)
      .map(s => {
        const date = new Date(s.date);
        
        const startTime = new Date(s.date);
        const [startHour, startMin] = s.startTime.split(":");
        startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

        const endTime = new Date(s.date);
        const [endHour, endMin] = s.endTime.split(":");
        endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

        return { date, startTime, endTime };
      });

    if (schedulesData.length === 0) {
      alert("Veuillez ajouter au moins une date de cours.");
      return;
    }

    await createCourse({
      name: formData.name,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      location: formData.location || undefined,
      maxStudents: parseInt(formData.maxStudents),
      sessionId: session.id,
      coachId: formData.coachId,
      schedules: schedulesData,
    });

    setIsModalOpen(false);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      location: "",
      maxStudents: "30",
      coachId: "",
    });
    setSchedules([{ date: "", startTime: "09:00", endTime: "10:00" }]);
    router.refresh();
  };

  const handleDelete = async (courseId: string) => {
    await deleteCourse(courseId);
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cours de la session</CardTitle>
              <CardDescription>{session.courses.length} cours</CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)} disabled={coaches.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un cours
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {coaches.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-amber-700 text-sm">
                Vous devez d&apos;abord créer des coachs avant de pouvoir ajouter des cours.
              </p>
            </div>
          )}
          {session.courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucun cours</h3>
              <p className="text-muted-foreground mt-1">
                Ajoutez des cours à cette session.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {session.courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {course.imageUrl ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={course.imageUrl}
                        alt={course.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{course.name}</h3>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {course.enrollments.length}/{course.maxStudents}
                      </Badge>
                    </div>
                    
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{course.location || "Non défini"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.coach.firstName} {course.coach.lastName}</span>
                      </div>
                      {course.schedules.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{course.schedules.length} séance(s)</span>
                        </div>
                      )}
                    </div>

                    {course.schedules.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Prochaines dates :</p>
                        <div className="space-y-1">
                          {course.schedules.slice(0, 2).map((schedule) => (
                            <div key={schedule.id} className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-primary" />
                              <span>{formatDate(schedule.date)}</span>
                              <span className="text-muted-foreground">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </span>
                            </div>
                          ))}
                          {course.schedules.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{course.schedules.length - 2} autres</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/dashboard/courses/${course.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voir les détails du cours</TooltipContent>
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
                            <AlertDialogTitle>Supprimer le cours ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le cours "{course.name}" et toutes ses inscriptions seront supprimés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(course.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un cours</DialogTitle>
            <DialogDescription>
              Remplissez les informations du cours et ajoutez les dates de formation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="En ligne, Salle A, etc."
                />
              </div>
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
            </div>

            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dates et horaires *</Label>
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
                        required
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Début</Label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateSchedule(index, "startTime", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                        required
                      />
                    </div>
                    {schedules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSchedule(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le cours</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

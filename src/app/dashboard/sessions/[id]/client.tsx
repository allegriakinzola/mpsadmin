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
    price: "0",
    maxStudents: "30",
    coachId: "",
    sessionsPerDay: "1",
    weekDays: [] as string[],
    vacations: [] as string[],
    startDate: "",
    endDate: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.vacations.length === 0) {
      alert("Veuillez sélectionner au moins une vacation.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    await createCourse({
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
      sessionId: session.id,
      coachId: formData.coachId,
    });

    setIsModalOpen(false);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      location: "",
      price: "0",
      maxStudents: "30",
      coachId: "",
      sessionsPerDay: "1",
      weekDays: [],
      vacations: [],
      startDate: "",
      endDate: "",
    });
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

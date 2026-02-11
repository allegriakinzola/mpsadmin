import { getCourse } from "@/app/actions/courses";
import { getStudents } from "@/app/actions/students";
import { getCoaches } from "@/app/actions/coaches";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { CourseEnrollmentsClient } from "./client";
import { CourseActionsClient } from "./course-actions";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, MapPin, User, Users, BookOpen, Calendar, Image as ImageIcon } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, students, coaches] = await Promise.all([
    getCourse(id),
    getStudents(),
    getCoaches(),
  ]);

  if (!course) {
    notFound();
  }

  const enrollmentProgress = (course.enrollments.length / course.maxStudents) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {course.schedules.length} séance(s) programmée(s)
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2 hidden sm:flex">
          {course.enrollments.length}/{course.maxStudents} inscrits
        </Badge>
      </div>

      <CourseActionsClient course={course} coaches={coaches} />

      {course.imageUrl && (
        <div className="relative h-64 w-full rounded-lg overflow-hidden">
          <Image
            src={course.imageUrl}
            alt={course.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session</p>
                <Link href={`/dashboard/sessions/${course.session.id}`} className="font-medium text-primary hover:underline">
                  {course.session.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coach</p>
                <p className="font-medium">{course.coach.firstName} {course.coach.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{course.location || "Non défini"}</p>
              </div>
            </div>
            {course.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{course.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Capacité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Étudiants inscrits</span>
                <span className="text-2xl font-bold text-primary">{course.enrollments.length} / {course.maxStudents}</span>
              </div>
              <Progress value={enrollmentProgress} className="h-3" />
              <div className="flex justify-between text-sm">
                <Badge variant={enrollmentProgress >= 100 ? "destructive" : "success"}>
                  {course.maxStudents - course.enrollments.length} places disponibles
                </Badge>
                <span className="text-muted-foreground">{enrollmentProgress.toFixed(0)}% rempli</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Dates des séances
              </CardTitle>
              <CardDescription>{course.schedules.length} séance(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {course.schedules.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune séance programmée.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {course.schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{formatDate(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <CourseEnrollmentsClient course={course} allStudents={students} />
    </div>
  );
}

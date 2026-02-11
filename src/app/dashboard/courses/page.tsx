"use client";

import { useState, useEffect } from "react";
import { getCourses } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, BookOpen, Info, MapPin, Users, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import Image from "next/image";

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
  session: { id: string; name: string };
  coach: { id: string; firstName: string; lastName: string };
  enrollments: { id: string }[];
  schedules: Schedule[];
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data as Course[]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Cours</h1>
          <p className="text-muted-foreground mt-1">Tous les cours de vos sessions</p>
        </div>
        <Alert className="w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pour créer un cours, allez dans une session
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Liste des cours
              </CardTitle>
              <CardDescription>{courses.length} cours au total</CardDescription>
            </div>
            <Badge variant="outline">
              {courses.reduce((acc, c) => acc + c.enrollments.length, 0)} inscriptions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucun cours</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Créez d'abord une session puis ajoutez-y des cours.
              </p>
              <Button asChild>
                <Link href="/dashboard/sessions">Voir les sessions</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
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
                        <BookOpen className="h-4 w-4" />
                        <Link 
                          href={`/dashboard/sessions/${course.session.id}`}
                          className="text-primary hover:underline"
                        >
                          {course.session.name}
                        </Link>
                      </div>
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

                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

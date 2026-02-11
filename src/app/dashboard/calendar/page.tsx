import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime, getDayName } from "@/lib/utils";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users, BookOpen } from "lucide-react";

type Schedule = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
};

type CalendarCourse = {
  id: string;
  name: string;
  location: string | null;
  coach: { firstName: string; lastName: string };
  enrollments: { id: string }[];
  schedules: Schedule[];
};

type CalendarSession = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  courses: CalendarCourse[];
};

async function getCalendarData() {
  const sessions = await prisma.courseSession.findMany({
    where: { isActive: true },
    include: {
      courses: {
        include: {
          coach: true,
          enrollments: true,
          schedules: {
            orderBy: { date: "asc" },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return sessions;
}

export default async function CalendarPage() {
  const sessions = await getCalendarData();

  const allEvents: {
    date: Date;
    schedule: {
      startTime: Date;
      endTime: Date;
    };
    course: {
      id: string;
      name: string;
      location: string | null;
    };
    coach: { firstName: string; lastName: string };
    session: { name: string };
    enrollmentCount: number;
  }[] = [];

  sessions.forEach((session) => {
    session.courses.forEach((course) => {
      course.schedules.forEach((schedule) => {
        allEvents.push({
          date: schedule.date,
          schedule: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },
          course: {
            id: course.id,
            name: course.name,
            location: course.location,
          },
          coach: course.coach,
          session: { name: session.name },
          enrollmentCount: course.enrollments.length,
        });
      });
    });
  });

  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupedByDate = allEvents.reduce((acc, event) => {
    const dateKey = new Date(event.date).toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof allEvents>);

  const upcomingDates = Object.keys(groupedByDate)
    .filter((dateKey) => new Date(dateKey) >= new Date(new Date().toISOString().split("T")[0]))
    .slice(0, 14);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendrier des cours</h1>
          <p className="text-muted-foreground mt-1">Planning de vos formations</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          <CalendarDays className="h-4 w-4 mr-2" />
          14 prochains jours
        </Badge>
      </div>

      {upcomingDates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucun cours programmé</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Créez des sessions et ajoutez-y des cours.
              </p>
              <Button asChild>
                <Link href="/dashboard/sessions">Voir les sessions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingDates.map((dateKey) => {
            const events = groupedByDate[dateKey];
            const date = new Date(dateKey);

            return (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {getDayName(date.getDay())} {formatDate(date)}
                  </CardTitle>
                  <CardDescription>{events.length} cours prévu(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event, idx) => (
                      <div
                        key={`${event.course.id}-${idx}`}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm font-medium text-primary">
                            <Clock className="h-4 w-4" />
                            {formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div>
                            <Link
                              href={`/dashboard/courses/${event.course.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {event.course.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {event.session.name} • {event.coach.firstName} {event.coach.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {event.course.location && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.course.location}
                            </Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.enrollmentCount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Vue d'ensemble par session
          </CardTitle>
          <CardDescription>{sessions.length} session(s) active(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune session active.
            </p>
          ) : (
            <div className="space-y-6">
              {sessions.map((session) => (
                <div key={session.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Link
                        href={`/dashboard/sessions/${session.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {session.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.startDate)} - {formatDate(session.endDate)}
                      </p>
                    </div>
                    <Badge variant="outline">{session.courses.length} cours</Badge>
                  </div>
                  {session.courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun cours dans cette session.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {session.courses.map((course) => (
                        <Card key={course.id} className="p-3">
                          <Link
                            href={`/dashboard/courses/${course.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {course.name}
                          </Link>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <CalendarDays className="h-3 w-3" />
                            {course.schedules.length} séance(s)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.coach.firstName} {course.coach.lastName}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

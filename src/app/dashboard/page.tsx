import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar, BookOpen, Users, GraduationCap, TrendingUp, ArrowRight, Plus, ClipboardList, UserPlus, CalendarDays } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [sessionsCount, coursesCount, coachesCount, studentsCount, enrollmentsCount] = await Promise.all([
    prisma.courseSession.count(),
    prisma.course.count(),
    prisma.coach.count(),
    prisma.student.count(),
    prisma.enrollment.count(),
  ]);

  return { sessionsCount, coursesCount, coachesCount, studentsCount, enrollmentsCount };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Sessions",
      value: stats.sessionsCount,
      icon: Calendar,
      href: "/dashboard/sessions",
      gradient: "from-red-500 to-red-600",
    },
    {
      title: "Cours",
      value: stats.coursesCount,
      icon: BookOpen,
      href: "/dashboard/courses",
      gradient: "from-red-600 to-red-700",
    },
    {
      title: "Coachs",
      value: stats.coachesCount,
      icon: Users,
      href: "/dashboard/coaches",
      gradient: "from-red-700 to-red-800",
    },
    {
      title: "Étudiants",
      value: stats.studentsCount,
      icon: GraduationCap,
      href: "/dashboard/students",
      gradient: "from-red-500 to-red-700",
    },
  ];

  const maxCapacity = 100;
  const enrollmentProgress = Math.min((stats.enrollmentsCount / maxCapacity) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur MPS Admin</p>
        </div>
        <Badge variant="default" className="px-4 py-2 text-sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          {stats.enrollmentsCount} inscriptions
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-xl p-2.5 bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                  Voir les détails <ArrowRight className="h-3 w-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Progression des inscriptions</CardTitle>
            <CardDescription>Objectif : {maxCapacity} inscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Inscriptions actuelles</span>
              <span className="font-semibold">{stats.enrollmentsCount} / {maxCapacity}</span>
            </div>
            <Progress value={enrollmentProgress} className="h-3" />
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="success">{stats.studentsCount} étudiants</Badge>
              <Badge variant="info">{stats.coursesCount} cours</Badge>
              <Badge variant="muted">{stats.coachesCount} coachs</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/sessions">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle session
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/students">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un étudiant
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/evaluations">
                <ClipboardList className="h-4 w-4 mr-2" />
                Voir les évaluations
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/calendar">
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendrier des cours
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Sessions de formation</CardTitle>
              <Badge variant="outline">{stats.sessionsCount} actives</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez vos sessions de cours, planifiez les horaires et assignez les coachs.
            </p>
            <Button asChild>
              <Link href="/dashboard/sessions">
                Gérer les sessions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Gestion des cours</CardTitle>
              <Badge variant="outline">{stats.coursesCount} cours</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Créez des cours, inscrivez des étudiants et suivez leur progression.
            </p>
            <Button asChild>
              <Link href="/dashboard/courses">
                Gérer les cours
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

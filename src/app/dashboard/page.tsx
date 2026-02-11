import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, BookOpen, Users, GraduationCap, TrendingUp, ArrowRight, Plus, ClipboardList, UserPlus, CalendarDays, CreditCard, CheckCircle, XCircle, Award } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [sessionsCount, coursesCount, coachesCount, studentsCount, enrollmentsCount, paidEnrollments, unpaidEnrollments] = await Promise.all([
    prisma.courseSession.count(),
    prisma.course.count(),
    prisma.coach.count(),
    prisma.student.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { isPaid: true } }),
    prisma.enrollment.count({ where: { isPaid: false } }),
  ]);

  // Cours avec le plus d'inscriptions payées
  const topPaidCourses = await prisma.course.findMany({
    include: {
      session: true,
      coach: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
      enrollments: {
        where: { isPaid: true },
      },
    },
    orderBy: {
      enrollments: { _count: "desc" },
    },
    take: 5,
  });

  // Étudiants ayant payé plusieurs formations
  const studentsWithMultiplePaid = await prisma.student.findMany({
    where: {
      enrollments: {
        some: { isPaid: true },
      },
    },
    include: {
      enrollments: {
        where: { isPaid: true },
        include: {
          course: true,
        },
      },
    },
  });

  const topStudents = studentsWithMultiplePaid
    .filter((s) => s.enrollments.length > 1)
    .sort((a, b) => b.enrollments.length - a.enrollments.length)
    .slice(0, 5);

  return { 
    sessionsCount, 
    coursesCount, 
    coachesCount, 
    studentsCount, 
    enrollmentsCount,
    paidEnrollments,
    unpaidEnrollments,
    topPaidCourses,
    topStudents,
  };
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

  const paidGoal = 100; // Objectif d'inscriptions payées
  const paidProgress = Math.min((stats.paidEnrollments / paidGoal) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur MPS Admin</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="px-4 py-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            {stats.enrollmentsCount} inscriptions
          </Badge>
          <Badge variant="success" className="px-4 py-2 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            {stats.paidEnrollments} payés
          </Badge>
          <Badge variant="destructive" className="px-4 py-2 text-sm">
            <XCircle className="h-4 w-4 mr-2" />
            {stats.unpaidEnrollments} non payés
          </Badge>
        </div>
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
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Progression des paiements
            </CardTitle>
            <CardDescription>Objectif : {paidGoal} inscriptions payées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Inscriptions payées</span>
              <span className="font-semibold text-green-600">{stats.paidEnrollments} / {paidGoal}</span>
            </div>
            <Progress value={paidProgress} className="h-3" />
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="success">{stats.paidEnrollments} payés</Badge>
              <Badge variant="destructive">{stats.unpaidEnrollments} non payés</Badge>
              <Badge variant="outline">{stats.enrollmentsCount} total</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.paidEnrollments}</p>
                <p className="text-xs text-muted-foreground">Places confirmées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats.unpaidEnrollments}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{paidGoal - stats.paidEnrollments > 0 ? paidGoal - stats.paidEnrollments : 0}</p>
                <p className="text-xs text-muted-foreground">Places restantes</p>
              </div>
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

      {/* Statistiques de paiement */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Top cours (inscriptions payées)
              </CardTitle>
              <Badge variant="success">{stats.paidEnrollments} payés</Badge>
            </div>
            <CardDescription>Formations ayant reçu le plus d&apos;inscriptions payées</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPaidCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune inscription payée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cours</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead className="text-center">Payés</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topPaidCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/courses/${course.id}`} className="hover:underline text-primary">
                          {course.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{course.session.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success">{course.enrollments.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{course._count.enrollments}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Étudiants multi-formations
              </CardTitle>
              <Badge variant="info">{stats.topStudents.length} étudiants</Badge>
            </div>
            <CardDescription>Étudiants ayant payé plusieurs formations</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topStudents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun étudiant avec plusieurs formations payées</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="text-center">Formations payées</TableHead>
                    <TableHead>Cours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/students/${student.id}`} className="hover:underline text-primary">
                          {student.firstName} {student.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success">{student.enrollments.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.enrollments.slice(0, 3).map((e) => (
                            <Badge key={e.id} variant="outline" className="text-xs">
                              {e.course.name}
                            </Badge>
                          ))}
                          {student.enrollments.length > 3 && (
                            <Badge variant="muted" className="text-xs">
                              +{student.enrollments.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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

import { getStudent } from "@/app/actions/students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, BookOpen, ClipboardList, GraduationCap, TrendingUp, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { StudentEnrollmentsClient } from "./client";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) {
    notFound();
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const evaluationsCount = student.enrollments.filter((e) => e.evaluation).length;
  const paidEnrollments = student.enrollments.filter((e) => e.isPaid);
  const unpaidEnrollments = student.enrollments.filter((e) => !e.isPaid);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(student.firstName, student.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {student.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="text-base px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-1" />
            {paidEnrollments.length} payé(s)
          </Badge>
          {unpaidEnrollments.length > 0 && (
            <Badge variant="destructive" className="text-base px-4 py-2">
              <XCircle className="h-4 w-4 mr-1" />
              {unpaidEnrollments.length} non payé(s)
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-primary" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{student.phone || "Non renseigné"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{student.address || "Non renseignée"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Profil Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Niveau</span>
              </div>
              <Badge variant="outline">{student.tradingLevel || "Non renseigné"}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Paiement</span>
              </div>
              <Badge variant="outline">{student.paymentMethod || "Non renseigné"}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Vacation</span>
              </div>
              <Badge variant="outline">{student.preferredSchedule || "Non renseignée"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résumé des paiements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Résumé des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cours payés */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                Cours payés ({paidEnrollments.length})
              </div>
              {paidEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-6">Aucun cours payé</p>
              ) : (
                <div className="space-y-1 pl-6">
                  {paidEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <Link href={`/dashboard/courses/${e.course.id}`} className="text-primary hover:underline font-medium">
                        {e.course.name}
                      </Link>
                      <Badge variant="success" className="text-xs">Payé</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cours non payés */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <XCircle className="h-4 w-4" />
                Cours non payés ({unpaidEnrollments.length})
              </div>
              {unpaidEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-6">Tous les cours sont payés</p>
              ) : (
                <div className="space-y-1 pl-6">
                  {unpaidEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <Link href={`/dashboard/courses/${e.course.id}`} className="text-primary hover:underline font-medium">
                        {e.course.name}
                      </Link>
                      <Badge variant="destructive" className="text-xs">Non payé</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <StudentEnrollmentsClient student={student} />
    </div>
  );
}

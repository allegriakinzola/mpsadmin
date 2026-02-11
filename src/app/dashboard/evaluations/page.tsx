"use client";

import { useState, useEffect } from "react";
import { getEvaluations } from "@/app/actions/evaluations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Evaluation = {
  id: string;
  grade: number | null;
  observation: string | null;
  evaluatedAt: Date;
  enrollment: {
    id: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
    course: {
      id: string;
      name: string;
      session: { name: string };
      coach: { firstName: string; lastName: string };
    };
  };
};

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    const data = await getEvaluations();
    setEvaluations(data as Evaluation[]);
    setLoading(false);
  };

  const averageGrade = evaluations.length > 0
    ? evaluations.filter(e => e.grade !== null).reduce((acc, e) => acc + (e.grade || 0), 0) / evaluations.filter(e => e.grade !== null).length
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
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
          <h1 className="text-3xl font-bold tracking-tight">Évaluations</h1>
          <p className="text-muted-foreground mt-1">Suivi des notes et observations</p>
        </div>
        <Alert className="w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Évaluez depuis la page détail d'un cours
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Liste des évaluations
              </CardTitle>
              <CardDescription>{evaluations.length} évaluation(s) enregistrée(s)</CardDescription>
            </div>
            {evaluations.length > 0 && (
              <Badge variant="outline">Moyenne : {averageGrade.toFixed(1)}/20</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Aucune évaluation</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Allez sur un cours pour évaluer les étudiants inscrits.
              </p>
              <Button asChild>
                <Link href="/dashboard/courses">Voir les cours</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Coach</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Observation</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/students/${evaluation.enrollment.student.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {evaluation.enrollment.student.firstName}{" "}
                        {evaluation.enrollment.student.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/courses/${evaluation.enrollment.course.id}`}
                        className="text-primary hover:underline"
                      >
                        {evaluation.enrollment.course.name}
                      </Link>
                    </TableCell>
                    <TableCell>{evaluation.enrollment.course.session.name}</TableCell>
                    <TableCell>
                      {evaluation.enrollment.course.coach.firstName}{" "}
                      {evaluation.enrollment.course.coach.lastName}
                    </TableCell>
                    <TableCell>
                      {evaluation.grade !== null ? (
                        <Badge
                          variant={
                            evaluation.grade >= 16
                              ? "success"
                              : evaluation.grade >= 12
                              ? "info"
                              : evaluation.grade >= 10
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {evaluation.grade}/20
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {evaluation.observation || "-"}
                    </TableCell>
                    <TableCell>{formatDate(evaluation.evaluatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

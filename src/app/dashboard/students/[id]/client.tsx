"use client";

import { useState } from "react";
import { createOrUpdateEvaluation } from "@/app/actions/evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Clock, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

type Schedule = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
};

type StudentEnrollment = {
  id: string;
  status: string;
  course: {
    id: string;
    name: string;
    location: string | null;
    session: { name: string };
    coach: { firstName: string; lastName: string };
    schedules: Schedule[];
  };
  evaluation: { id: string; grade: number | null; observation: string | null } | null;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  enrollments: StudentEnrollment[];
};

export function StudentEnrollmentsClient({ student }: { student: Student }) {
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentEnrollment | null>(null);
  const [evalData, setEvalData] = useState({ grade: "", observation: "" });
  const router = useRouter();

  const openEvalModal = (enrollment: StudentEnrollment) => {
    setSelectedEnrollment(enrollment);
    setEvalData({
      grade: enrollment.evaluation?.grade?.toString() || "",
      observation: enrollment.evaluation?.observation || "",
    });
    setIsEvalModalOpen(true);
  };

  const handleEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    await createOrUpdateEvaluation({
      enrollmentId: selectedEnrollment.id,
      grade: evalData.grade ? parseFloat(evalData.grade) : undefined,
      observation: evalData.observation || undefined,
    });

    setIsEvalModalOpen(false);
    setSelectedEnrollment(null);
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Cours et évaluations
              </CardTitle>
              <CardDescription>{student.enrollments.length} inscription(s)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {student.enrollments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Cet étudiant n&apos;est inscrit à aucun cours.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Coach</TableHead>
                  <TableHead>Séances</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Observation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/courses/${enrollment.course.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {enrollment.course.name}
                      </Link>
                    </TableCell>
                    <TableCell>{enrollment.course.session.name}</TableCell>
                    <TableCell>
                      {enrollment.course.coach.firstName} {enrollment.course.coach.lastName}
                    </TableCell>
                    <TableCell>
                      {enrollment.course.schedules.length > 0 ? (
                        <div className="space-y-1">
                          {enrollment.course.schedules.slice(0, 2).map((schedule) => (
                            <div key={schedule.id} className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(schedule.date)}</span>
                            </div>
                          ))}
                          {enrollment.course.schedules.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{enrollment.course.schedules.length - 2} autres
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.status === "active"
                            ? "success"
                            : enrollment.status === "completed"
                            ? "info"
                            : "muted"
                        }
                      >
                        {enrollment.status === "active"
                          ? "Actif"
                          : enrollment.status === "completed"
                          ? "Terminé"
                          : "Abandonné"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {enrollment.evaluation?.grade !== null && enrollment.evaluation?.grade !== undefined ? (
                        <Badge
                          variant={
                            enrollment.evaluation.grade >= 16
                              ? "success"
                              : enrollment.evaluation.grade >= 12
                              ? "info"
                              : enrollment.evaluation.grade >= 10
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {enrollment.evaluation.grade}/20
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {enrollment.evaluation?.observation || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEvalModal(enrollment)}
                          >
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {enrollment.evaluation ? "Modifier l'évaluation" : "Évaluer"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Évaluer {student.firstName} {student.lastName}
            </DialogTitle>
            <DialogDescription>
              Cours : {selectedEnrollment?.course.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEvaluation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Note (sur 20)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={evalData.grade}
                onChange={(e) => setEvalData({ ...evalData, grade: e.target.value })}
                placeholder="Ex: 15.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observation">Observation / Appréciation</Label>
              <Textarea
                id="observation"
                value={evalData.observation}
                onChange={(e) =>
                  setEvalData({ ...evalData, observation: e.target.value })
                }
                placeholder="Ex: Excellent travail, participation active..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEvalModalOpen(false)}
              >
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

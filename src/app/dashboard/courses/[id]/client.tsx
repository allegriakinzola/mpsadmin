"use client";

import { useState } from "react";
import { enrollStudent, unenrollStudent } from "@/app/actions/enrollments";
import { createOrUpdateEvaluation } from "@/app/actions/evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Evaluation = {
  id: string;
  grade: number | null;
  observation: string | null;
};

type Enrollment = {
  id: string;
  student: Student;
  status: string;
  evaluation: Evaluation | null;
};

type Course = {
  id: string;
  name: string;
  maxStudents: number;
  enrollments: Enrollment[];
};

export function CourseEnrollmentsClient({
  course,
  allStudents,
}: {
  course: Course;
  allStudents: Student[];
}) {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [evalData, setEvalData] = useState({ grade: "", observation: "" });
  const router = useRouter();

  const enrolledStudentIds = course.enrollments.map((e) => e.student.id);
  const availableStudents = allStudents.filter(
    (s) => !enrolledStudentIds.includes(s.id)
  );

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      await enrollStudent({
        studentId: selectedStudentId,
        courseId: course.id,
      });
      setIsEnrollModalOpen(false);
      setSelectedStudentId("");
      router.refresh();
    } catch (error) {
      alert("Erreur lors de l'inscription");
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir désinscrire cet étudiant ?")) {
      await unenrollStudent(enrollmentId);
      router.refresh();
    }
  };

  const openEvalModal = (enrollment: Enrollment) => {
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
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-gray-800">Étudiants inscrits</CardTitle>
          <Button
            onClick={() => setIsEnrollModalOpen(true)}
            disabled={availableStudents.length === 0 || course.enrollments.length >= course.maxStudents}
            className="shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Inscrire un étudiant
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {availableStudents.length === 0 && course.enrollments.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-700 text-sm">
                Vous devez d&apos;abord créer des étudiants avant de pouvoir les inscrire.
              </p>
            </div>
          )}
          {course.enrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun étudiant inscrit à ce cours.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Observation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                    </TableCell>
                    <TableCell>{enrollment.student.email}</TableCell>
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
                      {enrollment.evaluation?.grade !== null
                        ? enrollment.evaluation?.grade
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {enrollment.evaluation?.observation || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEvalModal(enrollment)}
                          title="Évaluer"
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnenroll(enrollment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscrire un étudiant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Étudiant</Label>
              <NativeSelect
                id="studentId"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">Sélectionner un étudiant</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEnrollModalOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Inscrire</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Évaluer {selectedEnrollment?.student.firstName} {selectedEnrollment?.student.lastName}</DialogTitle>
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

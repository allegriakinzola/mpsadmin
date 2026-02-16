"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEnrollments() {
  return prisma.enrollment.findMany({
    include: {
      student: true,
      course: {
        include: {
          session: true,
          coach: true,
        },
      },
      evaluation: true,
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function enrollStudent(data: { studentId: string; courseId: string; vacation?: string }) {
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: data.studentId,
        courseId: data.courseId,
      },
    },
  });

  if (existing) {
    throw new Error("L'étudiant est déjà inscrit à ce cours");
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      courseId: data.courseId,
      vacation: data.vacation,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/courses/${data.courseId}`);
  revalidatePath(`/dashboard/students/${data.studentId}`);
  return enrollment;
}

export async function unenrollStudent(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });

  await prisma.enrollment.delete({
    where: { id: enrollmentId },
  });

  if (enrollment) {
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/courses/${enrollment.courseId}`);
    revalidatePath(`/dashboard/students/${enrollment.studentId}`);
  }
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: string
) {
  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
  });
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  return enrollment;
}

export async function markFirstInstallmentPaid(enrollmentId: string, recordedBy?: string) {
  const current = await prisma.enrollment.findUnique({ 
    where: { id: enrollmentId },
    include: { course: true, student: true },
  });
  if (!current) throw new Error("Inscription non trouvée");

  const paidSecond = current.paidSecondInstallment;
  const isFullyPaid = paidSecond; // Si 2ème tranche déjà payée, alors totalité payée
  
  // Calculer le montant de la 1ère tranche (40% du prix, arrondi)
  const firstInstallmentAmount = Math.round(current.course.price * 0.4);

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { 
      paidFirstInstallment: true,
      paidFirstInstallmentAt: new Date(),
      firstInstallmentAmount: firstInstallmentAmount,
      isPaid: isFullyPaid,
      paidAt: isFullyPaid ? new Date() : null,
    },
  });

  // Enregistrer dans la trésorerie
  await prisma.treasuryEntry.create({
    data: {
      enrollmentId,
      amount: firstInstallmentAmount,
      type: "income",
      category: "first_installment",
      description: `1ère tranche - ${current.course.name} - ${current.student.firstName} ${current.student.lastName}`,
      paymentMethod: "cash",
      recordedBy,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/treasury");
  return enrollment;
}

export async function markFirstInstallmentUnpaid(enrollmentId: string) {
  // Supprimer l'entrée de trésorerie correspondante
  await prisma.treasuryEntry.deleteMany({
    where: {
      enrollmentId,
      category: "first_installment",
    },
  });

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { 
      paidFirstInstallment: false,
      paidFirstInstallmentAt: null,
      firstInstallmentAmount: null,
      isPaid: false,
      paidAt: null,
    },
  });
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/treasury");
  return enrollment;
}

export async function markSecondInstallmentPaid(enrollmentId: string, recordedBy?: string) {
  const current = await prisma.enrollment.findUnique({ 
    where: { id: enrollmentId },
    include: { course: true, student: true },
  });
  if (!current) throw new Error("Inscription non trouvée");

  const paidFirst = current.paidFirstInstallment;
  const isFullyPaid = paidFirst; // Si 1ère tranche déjà payée, alors totalité payée
  
  // Calculer le montant de la 2ème tranche (60% du prix, arrondi)
  const secondInstallmentAmount = Math.round(current.course.price * 0.6);

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { 
      paidSecondInstallment: true,
      paidSecondInstallmentAt: new Date(),
      secondInstallmentAmount: secondInstallmentAmount,
      isPaid: isFullyPaid,
      paidAt: isFullyPaid ? new Date() : null,
    },
  });

  // Enregistrer dans la trésorerie
  await prisma.treasuryEntry.create({
    data: {
      enrollmentId,
      amount: secondInstallmentAmount,
      type: "income",
      category: "second_installment",
      description: `2ème tranche - ${current.course.name} - ${current.student.firstName} ${current.student.lastName}`,
      paymentMethod: "cash",
      recordedBy,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/treasury");
  return enrollment;
}

export async function markSecondInstallmentUnpaid(enrollmentId: string) {
  // Supprimer l'entrée de trésorerie correspondante
  await prisma.treasuryEntry.deleteMany({
    where: {
      enrollmentId,
      category: "second_installment",
    },
  });

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { 
      paidSecondInstallment: false,
      paidSecondInstallmentAt: null,
      secondInstallmentAmount: null,
      isPaid: false,
      paidAt: null,
    },
  });
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/treasury");
  return enrollment;
}

export async function getPaymentStats() {
  const [totalEnrollments, paidEnrollments, unpaidEnrollments] = await Promise.all([
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { isPaid: true } }),
    prisma.enrollment.count({ where: { isPaid: false } }),
  ]);

  // Cours avec le plus d'inscriptions payées
  const coursesWithPaidEnrollments = await prisma.course.findMany({
    include: {
      session: true,
      coach: true,
      enrollments: {
        where: { isPaid: true },
        include: { student: true },
      },
      _count: {
        select: {
          enrollments: { where: { isPaid: true } },
        },
      },
    },
    orderBy: {
      enrollments: { _count: "desc" },
    },
    take: 5,
  });

  // Étudiants ayant payé plusieurs formations
  const studentsWithMultiplePaidCourses = await prisma.student.findMany({
    where: {
      enrollments: {
        some: { isPaid: true },
      },
    },
    include: {
      enrollments: {
        where: { isPaid: true },
        include: {
          course: {
            include: { session: true },
          },
        },
      },
    },
  });

  const studentsWithMultiplePaid = studentsWithMultiplePaidCourses
    .filter((s) => s.enrollments.length > 1)
    .sort((a, b) => b.enrollments.length - a.enrollments.length);

  return {
    totalEnrollments,
    paidEnrollments,
    unpaidEnrollments,
    coursesWithPaidEnrollments,
    studentsWithMultiplePaid,
  };
}

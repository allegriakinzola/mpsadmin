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

export async function enrollStudent(data: { studentId: string; courseId: string }) {
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

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvaluations() {
  return prisma.evaluation.findMany({
    include: {
      enrollment: {
        include: {
          student: true,
          course: {
            include: {
              session: true,
              coach: true,
            },
          },
        },
      },
    },
    orderBy: { evaluatedAt: "desc" },
  });
}

export async function getEvaluation(id: string) {
  return prisma.evaluation.findUnique({
    where: { id },
    include: {
      enrollment: {
        include: {
          student: true,
          course: {
            include: {
              session: true,
              coach: true,
            },
          },
        },
      },
    },
  });
}

export async function createOrUpdateEvaluation(data: {
  enrollmentId: string;
  grade?: number;
  observation?: string;
}) {
  const existing = await prisma.evaluation.findUnique({
    where: { enrollmentId: data.enrollmentId },
  });

  let evaluation;
  if (existing) {
    evaluation = await prisma.evaluation.update({
      where: { id: existing.id },
      data: {
        grade: data.grade,
        observation: data.observation,
      },
    });
  } else {
    evaluation = await prisma.evaluation.create({
      data: {
        enrollmentId: data.enrollmentId,
        grade: data.grade,
        observation: data.observation,
      },
    });
  }

  revalidatePath("/dashboard/evaluations");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/students");
  return evaluation;
}

export async function deleteEvaluation(id: string) {
  await prisma.evaluation.delete({
    where: { id },
  });
  revalidatePath("/dashboard/evaluations");
}

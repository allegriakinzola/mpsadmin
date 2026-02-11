"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSessions() {
  return prisma.courseSession.findMany({
    include: {
      courses: true,
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getSession(id: string) {
  return prisma.courseSession.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          coach: true,
          enrollments: {
            include: {
              student: true,
            },
          },
          schedules: {
            orderBy: { date: "asc" },
          },
        },
      },
    },
  });
}

export async function createSession(data: {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}) {
  const session = await prisma.courseSession.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
  revalidatePath("/dashboard/sessions");
  return session;
}

export async function updateSession(
  id: string,
  data: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }
) {
  const session = await prisma.courseSession.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${id}`);
  return session;
}

export async function deleteSession(id: string) {
  await prisma.courseSession.delete({
    where: { id },
  });
  revalidatePath("/dashboard/sessions");
}

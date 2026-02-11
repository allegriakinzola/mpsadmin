"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCoaches() {
  return prisma.coach.findMany({
    include: {
      courses: true,
    },
    orderBy: { lastName: "asc" },
  });
}

export async function getCoach(id: string) {
  return prisma.coach.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          session: true,
          enrollments: true,
        },
      },
    },
  });
}

export async function createCoach(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty?: string;
}) {
  const coach = await prisma.coach.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      specialty: data.specialty,
    },
  });
  revalidatePath("/dashboard/coaches");
  return coach;
}

export async function updateCoach(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialty?: string;
  }
) {
  const coach = await prisma.coach.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/coaches");
  revalidatePath(`/dashboard/coaches/${id}`);
  return coach;
}

export async function deleteCoach(id: string) {
  await prisma.coach.delete({
    where: { id },
  });
  revalidatePath("/dashboard/coaches");
}

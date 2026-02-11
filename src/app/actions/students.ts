"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudents() {
  return prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { lastName: "asc" },
  });
}

export async function getStudent(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              session: true,
              coach: true,
              schedules: {
                orderBy: { date: "asc" },
              },
            },
          },
          evaluation: true,
        },
      },
    },
  });
}

export async function createStudent(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  tradingLevel?: string;
  hasDeriv?: string;
  paymentMethod?: string;
  expectations?: string;
  preferredSchedule?: string;
}) {
  const student = await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      tradingLevel: data.tradingLevel,
      hasDeriv: data.hasDeriv,
      paymentMethod: data.paymentMethod,
      expectations: data.expectations,
      preferredSchedule: data.preferredSchedule,
    },
  });
  revalidatePath("/dashboard/students");
  return student;
}

export async function updateStudent(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    tradingLevel?: string;
    hasDeriv?: string;
    paymentMethod?: string;
    expectations?: string;
    preferredSchedule?: string;
  }
) {
  const student = await prisma.student.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  return student;
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({
    where: { id },
  });
  revalidatePath("/dashboard/students");
}

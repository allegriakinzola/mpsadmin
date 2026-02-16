"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTreasuryEntries(filters?: {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  category?: string;
}) {
  const where: any = {};

  if (filters?.startDate) {
    where.createdAt = { ...where.createdAt, gte: filters.startDate };
  }
  if (filters?.endDate) {
    where.createdAt = { ...where.createdAt, lte: filters.endDate };
  }
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.category) {
    where.category = filters.category;
  }

  return prisma.treasuryEntry.findMany({
    where,
    include: {
      enrollment: {
        include: {
          student: true,
          course: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTreasuryStats() {
  // Total des entrées (revenus)
  const totalIncome = await prisma.treasuryEntry.aggregate({
    where: { type: "income" },
    _sum: { amount: true },
  });

  // Total des sorties (dépenses)
  const totalExpense = await prisma.treasuryEntry.aggregate({
    where: { type: "expense" },
    _sum: { amount: true },
  });

  // Revenus par catégorie
  const incomeByCategory = await prisma.treasuryEntry.groupBy({
    by: ["category"],
    where: { type: "income" },
    _sum: { amount: true },
    _count: true,
  });

  // Revenus du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyIncome = await prisma.treasuryEntry.aggregate({
    where: {
      type: "income",
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
  });

  // Revenus de la semaine en cours
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyIncome = await prisma.treasuryEntry.aggregate({
    where: {
      type: "income",
      createdAt: { gte: startOfWeek },
    },
    _sum: { amount: true },
  });

  // Revenus d'aujourd'hui
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyIncome = await prisma.treasuryEntry.aggregate({
    where: {
      type: "income",
      createdAt: { gte: startOfDay },
    },
    _sum: { amount: true },
  });

  // Nombre total de transactions
  const totalTransactions = await prisma.treasuryEntry.count();

  // Dernières transactions
  const recentTransactions = await prisma.treasuryEntry.findMany({
    take: 10,
    include: {
      enrollment: {
        include: {
          student: true,
          course: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    totalIncome: totalIncome._sum.amount || 0,
    totalExpense: totalExpense._sum.amount || 0,
    balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
    monthlyIncome: monthlyIncome._sum.amount || 0,
    weeklyIncome: weeklyIncome._sum.amount || 0,
    dailyIncome: dailyIncome._sum.amount || 0,
    totalTransactions,
    incomeByCategory,
    recentTransactions,
  };
}

export async function createTreasuryEntry(data: {
  enrollmentId?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  paymentMethod?: string;
  reference?: string;
  recordedBy?: string;
}) {
  const entry = await prisma.treasuryEntry.create({
    data: {
      enrollmentId: data.enrollmentId || "",
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      recordedBy: data.recordedBy,
    },
  });

  revalidatePath("/dashboard/treasury");
  return entry;
}

export async function deleteTreasuryEntry(id: string) {
  await prisma.treasuryEntry.delete({
    where: { id },
  });

  revalidatePath("/dashboard/treasury");
}

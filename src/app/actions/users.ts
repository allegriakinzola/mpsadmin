"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  
  return dbUser?.role === "admin";
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  return users;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    throw new Error("Seuls les administrateurs peuvent créer des utilisateurs");
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà");
  }

  // Hasher le mot de passe
  const hashedPassword = await hash(data.password, 12);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role || "admin",
      emailVerified: true,
      accounts: {
        create: {
          accountId: data.email,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  revalidatePath("/dashboard/users");
  return user;
}

export async function updateUserRole(userId: string, role: string) {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    throw new Error("Seuls les administrateurs peuvent modifier les rôles");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/dashboard/users");
  return user;
}

export async function deleteUser(userId: string) {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    throw new Error("Seuls les administrateurs peuvent supprimer des utilisateurs");
  }

  // Empêcher la suppression de son propre compte
  const currentUser = await getCurrentUser();
  if (currentUser?.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/users");
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  
  return dbUser?.role;
}

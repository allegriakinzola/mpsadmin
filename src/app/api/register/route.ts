"use server";

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      tradingLevel,
      hasDeriv,
      paymentMethod,
      expectations,
      preferredSchedule,
    } = body;

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Les champs nom, prénom, email et téléphone sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Un étudiant avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Créer l'étudiant
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        tradingLevel,
        hasDeriv,
        paymentMethod,
        expectations,
        preferredSchedule,
      },
    });

    return NextResponse.json(
      { message: "Inscription réussie", student },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}

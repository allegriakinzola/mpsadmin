import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleCors, withCors } from "@/lib/cors";
import { sendWelcomeEmail } from "@/lib/email";

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
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
      return withCors(
        NextResponse.json(
          { error: "Les champs nom, prénom, email et téléphone sont obligatoires" },
          { status: 400 }
        ),
        request
      );
    }

    // Vérifier si l'email existe déjà
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return withCors(
        NextResponse.json(
          { error: "Un étudiant avec cet email existe déjà" },
          { status: 409 }
        ),
        request
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

    // Envoyer l'email de bienvenue
    await sendWelcomeEmail({
      firstName,
      lastName,
      email,
    });

    return withCors(
      NextResponse.json(
        { message: "Inscription réussie", student },
        { status: 201 }
      ),
      request
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return withCors(
      NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      ),
      request
    );
  }
}

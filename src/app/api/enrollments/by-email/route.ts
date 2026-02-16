import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise" },
        { status: 400 }
      );
    }

    // Rechercher l'étudiant par email ou téléphone (insensible à la casse)
    const student = await prisma.student.findFirst({
      where: { 
        OR: [
          {
            email: {
              equals: email,
              mode: "insensitive",
            }
          },
          {
            phone: {
              equals: email,
              mode: "insensitive",
            }
          }
        ]
      },
    });

    console.log("Searching for:", email, "Found student:", student?.id, student?.email);

    if (!student) {
      // Lister tous les étudiants pour debug
      const allStudents = await prisma.student.findMany({
        select: { id: true, email: true, firstName: true, lastName: true },
        take: 10,
      });
      console.log("Available students:", allStudents);
      
      return NextResponse.json(
        { enrollments: [] },
        { status: 200 }
      );
    }

    // Récupérer les inscriptions de l'étudiant
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    console.log("Found enrollments:", enrollments.length, "for student:", student.id);

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Error fetching enrollments by email:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la recherche" },
      { status: 500 }
    );
  }
}

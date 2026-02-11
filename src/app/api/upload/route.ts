import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }

    // Limiter la taille à 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux. Maximum 5MB." },
        { status: 400 }
      );
    }

    // Créer le dossier uploads si nécessaire
    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const fileName = `course-${timestamp}-${randomString}.${extension}`;

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retourner l'URL relative de l'image
    const imageUrl = `/uploads/courses/${fileName}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializePayment, getPaymentRedirectUrl } from "@/lib/easypay";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, installment, amount, currency = "USD" } = body;

    if (!enrollmentId || !installment || !amount) {
      return NextResponse.json(
        { error: "enrollmentId, installment et amount sont requis" },
        { status: 400 }
      );
    }

    if (installment !== 1 && installment !== 2) {
      return NextResponse.json(
        { error: "installment doit être 1 ou 2" },
        { status: 400 }
      );
    }

    // Récupérer l'inscription avec l'étudiant et le cours
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        course: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Inscription non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la tranche n'est pas déjà payée
    if (installment === 1 && enrollment.paidFirstInstallment) {
      return NextResponse.json(
        { error: "La première tranche est déjà payée" },
        { status: 400 }
      );
    }

    if (installment === 2 && enrollment.paidSecondInstallment) {
      return NextResponse.json(
        { error: "La deuxième tranche est déjà payée" },
        { status: 400 }
      );
    }

    // Générer une référence unique pour la commande
    const orderRef = `MPS-${nanoid(6).toUpperCase()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Créer l'enregistrement de paiement
    const payment = await prisma.payment.create({
      data: {
        enrollmentId,
        orderRef,
        amount,
        currency,
        installment,
        status: "pending",
        description: `Paiement tranche ${installment} - ${enrollment.course.name}`,
        customerName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        customerEmail: enrollment.student.email,
      },
    });

    // Initialiser le paiement sur EasyPay
    const easypayResponse = await initializePayment({
      orderRef,
      amount,
      currency: currency as "USD" | "CDF",
      description: `Paiement tranche ${installment} - ${enrollment.course.name}`,
      customerName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      customerEmail: enrollment.student.email,
      successUrl: `${appUrl}/payment/success?orderRef=${orderRef}`,
      errorUrl: `${appUrl}/payment/error?orderRef=${orderRef}`,
      cancelUrl: `${appUrl}/payment/cancel?orderRef=${orderRef}`,
      language: "FR",
      channels: ["CREDIT CARD", "MOBILE MONEY"],
    });

    if (easypayResponse.code !== 1 || !easypayResponse.reference) {
      // Mettre à jour le statut en échec
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: easypayResponse.message || "Erreur lors de l'initialisation du paiement" },
        { status: 500 }
      );
    }

    // Mettre à jour avec la référence EasyPay
    await prisma.payment.update({
      where: { id: payment.id },
      data: { easypayRef: easypayResponse.reference },
    });

    // Retourner l'URL de redirection
    const redirectUrl = getPaymentRedirectUrl(easypayResponse.reference);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      orderRef,
      redirectUrl,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'initialisation du paiement" },
      { status: 500 }
    );
  }
}

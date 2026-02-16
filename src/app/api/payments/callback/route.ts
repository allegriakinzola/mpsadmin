import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Route IPN (Instant Payment Notification) pour recevoir les notifications d'EasyPay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("EasyPay IPN received:", JSON.stringify(body, null, 2));

    const { order_ref, reference, status, channel, payment_reference } = body;

    if (!order_ref) {
      return NextResponse.json({ error: "order_ref manquant" }, { status: 400 });
    }

    // Récupérer le paiement par orderRef
    const payment = await prisma.payment.findUnique({
      where: { orderRef: order_ref },
    });

    if (!payment) {
      console.error("Payment not found for order_ref:", order_ref);
      return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 });
    }

    // Déterminer le nouveau statut
    let newStatus = payment.status;
    if (status === "SUCCESS" || status === "COMPLETED") {
      newStatus = "success";
    } else if (status === "FAILED") {
      newStatus = "failed";
    } else if (status === "CANCELLED") {
      newStatus = "cancelled";
    }

    // Mettre à jour le paiement
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        easypayRef: reference || payment.easypayRef,
        channel: channel || payment.channel,
        paymentRef: payment_reference || payment.paymentRef,
        paidAt: newStatus === "success" ? new Date() : payment.paidAt,
      },
    });

    // Si le paiement est réussi, mettre à jour l'inscription
    if (newStatus === "success") {
      if (payment.installment === 1) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: {
            paidFirstInstallment: true,
            paidFirstInstallmentAt: new Date(),
          },
        });
      } else if (payment.installment === 2) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: payment.enrollmentId },
        });

        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: {
            paidSecondInstallment: true,
            paidSecondInstallmentAt: new Date(),
            isPaid: enrollment?.paidFirstInstallment ? true : false,
            paidAt: enrollment?.paidFirstInstallment ? new Date() : null,
          },
        });
      }

      // Vérifier si les deux tranches sont maintenant payées
      const finalEnrollment = await prisma.enrollment.findUnique({
        where: { id: payment.enrollmentId },
      });

      if (finalEnrollment?.paidFirstInstallment && finalEnrollment?.paidSecondInstallment && !finalEnrollment?.isPaid) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: {
            isPaid: true,
            paidAt: new Date(),
          },
        });
      }
    }

    console.log("Payment updated:", updatedPayment.id, "Status:", newStatus);

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("IPN callback error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement de la notification" },
      { status: 500 }
    );
  }
}

// Support GET pour les tests
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "EasyPay IPN endpoint is active" });
}

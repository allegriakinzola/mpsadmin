import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/easypay";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderRef = searchParams.get("orderRef");

    if (!orderRef) {
      return NextResponse.json(
        { error: "orderRef est requis" },
        { status: 400 }
      );
    }

    // Récupérer le paiement
    const payment = await prisma.payment.findUnique({
      where: { orderRef },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Paiement non trouvé" },
        { status: 404 }
      );
    }

    // Si le paiement est déjà finalisé, retourner le statut
    if (payment.status === "success" || payment.status === "failed" || payment.status === "cancelled") {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          orderRef: payment.orderRef,
          amount: payment.amount,
          currency: payment.currency,
          installment: payment.installment,
          status: payment.status,
          paidAt: payment.paidAt,
        },
      });
    }

    // Vérifier le statut sur EasyPay si on a une référence
    if (payment.easypayRef) {
      try {
        const easypayStatus = await checkPaymentStatus(payment.easypayRef);
        
        if (easypayStatus.payment?.status === "SUCCESS" || easypayStatus.payment?.status === "COMPLETED") {
          // Mettre à jour le paiement comme réussi
          const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "success",
              channel: easypayStatus.payment.channel,
              paymentRef: easypayStatus.payment.reference,
              paidAt: new Date(),
            },
          });

          // Mettre à jour l'inscription
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
                // Si les deux tranches sont payées, marquer comme totalement payé
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

          return NextResponse.json({
            success: true,
            payment: {
              id: updatedPayment.id,
              orderRef: updatedPayment.orderRef,
              amount: updatedPayment.amount,
              currency: updatedPayment.currency,
              installment: updatedPayment.installment,
              status: "success",
              paidAt: updatedPayment.paidAt,
            },
          });
        } else if (easypayStatus.payment?.status === "FAILED") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          });

          return NextResponse.json({
            success: true,
            payment: {
              id: payment.id,
              orderRef: payment.orderRef,
              status: "failed",
            },
          });
        }
      } catch (error) {
        console.error("Error checking EasyPay status:", error);
      }
    }

    // Retourner le statut actuel
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderRef: payment.orderRef,
        amount: payment.amount,
        currency: payment.currency,
        installment: payment.installment,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification du statut" },
      { status: 500 }
    );
  }
}

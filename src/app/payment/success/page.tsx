import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/lib/prisma";

async function PaymentDetails({ orderRef }: { orderRef: string }) {
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
    return (
      <p className="text-muted-foreground">
        Détails du paiement non disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Référence</p>
          <p className="font-medium">{payment.orderRef}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Montant</p>
          <p className="font-medium">{payment.amount} {payment.currency}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Cours</p>
          <p className="font-medium">{payment.enrollment.course.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Tranche</p>
          <p className="font-medium">{payment.installment === 1 ? "1ère tranche" : "2ème tranche"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Étudiant</p>
          <p className="font-medium">{payment.enrollment.student.firstName} {payment.enrollment.student.lastName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Statut</p>
          <p className="font-medium text-green-600">Payé</p>
        </div>
      </div>
    </div>
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Paiement réussi !</CardTitle>
          <CardDescription>
            Votre paiement a été effectué avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderRef && (
            <Suspense fallback={<p>Chargement des détails...</p>}>
              <PaymentDetails orderRef={orderRef} />
            </Suspense>
          )}
          
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard">
                Retour au tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

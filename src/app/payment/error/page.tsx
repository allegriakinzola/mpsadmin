import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Échec du paiement</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du traitement de votre paiement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderRef && (
            <p className="text-sm text-muted-foreground">
              Référence: {orderRef}
            </p>
          )}
          
          <p className="text-sm text-gray-600">
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
          
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

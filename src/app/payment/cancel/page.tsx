import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-700">Paiement annulé</CardTitle>
          <CardDescription>
            Vous avez annulé le processus de paiement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderRef && (
            <p className="text-sm text-muted-foreground">
              Référence: {orderRef}
            </p>
          )}
          
          <p className="text-sm text-gray-600">
            Vous pouvez réessayer le paiement à tout moment depuis votre espace.
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

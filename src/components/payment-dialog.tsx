"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  studentName: string;
  courseName: string;
  installment: 1 | 2;
}

export function PaymentDialog({
  open,
  onOpenChange,
  enrollmentId,
  studentName,
  courseName,
  installment,
}: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "CDF">("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId,
          installment,
          amount: parseFloat(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'initialisation du paiement");
      }

      // Rediriger vers la page de paiement EasyPay
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement en ligne
          </DialogTitle>
          <DialogDescription>
            {installment === 1 ? "Première tranche" : "Deuxième tranche"} - {courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Étudiant:</span>{" "}
              <span className="font-medium">{studentName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Cours:</span>{" "}
              <span className="font-medium">{courseName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Tranche:</span>{" "}
              <span className="font-medium">
                {installment === 1 ? "1ère tranche" : "2ème tranche"}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <NativeSelect
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "CDF")}
              >
                <option value="USD">USD</option>
                <option value="CDF">CDF</option>
              </NativeSelect>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Payer maintenant
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

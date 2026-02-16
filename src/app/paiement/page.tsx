"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { CreditCard, Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Enrollment = {
  id: string;
  paidFirstInstallment: boolean;
  paidSecondInstallment: boolean;
  isPaid: boolean;
  course: {
    id: string;
    name: string;
    price: number;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function PaiementPage() {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "CDF">("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [searchDone, setSearchDone] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSearching(true);
    setError("");
    setEnrollments([]);
    setSelectedEnrollment(null);
    setSearchDone(false);

    try {
      const response = await fetch(`/api/enrollments/by-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la recherche");
      }

      setEnrollments(data.enrollments || []);
      setSearchDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    // Déterminer automatiquement quelle tranche payer et le montant
    if (!enrollment.paidFirstInstallment) {
      setSelectedInstallment(1);
      setAmount(Math.round(enrollment.course.price * 0.4).toString());
    } else if (!enrollment.paidSecondInstallment) {
      setSelectedInstallment(2);
      setAmount(Math.round(enrollment.course.price * 0.6).toString());
    }
  };

  // Calculer le montant de la tranche sélectionnée
  const getInstallmentAmount = (installment: 1 | 2) => {
    if (!selectedEnrollment) return 0;
    return installment === 1 
      ? Math.round(selectedEnrollment.course.price * 0.4)
      : Math.round(selectedEnrollment.course.price * 0.6);
  };

  const handlePayment = async () => {
    if (!selectedEnrollment || !amount || parseFloat(amount) <= 0) {
      setError("Veuillez sélectionner une inscription et entrer un montant valide");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment.id,
          installment: selectedInstallment,
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
      setIsProcessing(false);
    }
  };

  const getInstallmentOptions = () => {
    if (!selectedEnrollment) return [];
    
    const options = [];
    if (!selectedEnrollment.paidFirstInstallment) {
      const amount = Math.round(selectedEnrollment.course.price * 0.4);
      options.push({ value: 1, label: `1ère tranche - ${amount} USD (40%)` });
    }
    if (!selectedEnrollment.paidSecondInstallment) {
      const amount = Math.round(selectedEnrollment.course.price * 0.6);
      options.push({ value: 2, label: `2ème tranche - ${amount} USD (60%)` });
    }
    return options;
  };

  // Mettre à jour le montant quand la tranche change
  const handleInstallmentChange = (installment: 1 | 2) => {
    setSelectedInstallment(installment);
    setAmount(getInstallmentAmount(installment).toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MPS Trading Academy</h1>
          <p className="text-gray-600">Paiement de la formation</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paiement en ligne
            </CardTitle>
            <CardDescription>
              Recherchez votre inscription avec votre adresse email pour effectuer le paiement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {searchDone && enrollments.length === 0 && (
              <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Aucune inscription trouvée pour cette adresse email.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Veuillez d&apos;abord vous inscrire sur la page d&apos;inscription.
                </p>
              </div>
            )}

            {enrollments.length > 0 && (
              <div className="mt-6 space-y-4">
                <Label>Sélectionnez votre inscription</Label>
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      onClick={() => !enrollment.isPaid && handleSelectEnrollment(enrollment)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        enrollment.isPaid
                          ? "bg-green-50 border-green-200 cursor-not-allowed"
                          : selectedEnrollment?.id === enrollment.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{enrollment.course.name}</p>
                          <p className="text-sm text-gray-500">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {enrollment.isPaid ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Payé intégralement ({enrollment.course.price} USD)
                            </Badge>
                          ) : (
                            <>
                              <Badge variant={enrollment.paidFirstInstallment ? "success" : "destructive"}>
                                1ère tranche ({Math.round(enrollment.course.price * 0.4)} USD): {enrollment.paidFirstInstallment ? "Payée" : "Non payée"}
                              </Badge>
                              <Badge variant={enrollment.paidSecondInstallment ? "success" : "destructive"}>
                                2ème tranche ({Math.round(enrollment.course.price * 0.6)} USD): {enrollment.paidSecondInstallment ? "Payée" : "Non payée"}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEnrollment && !selectedEnrollment.isPaid && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <h3 className="font-medium">Détails du paiement</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Cours:</span>{" "}
                    <span className="font-medium">{selectedEnrollment.course.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Étudiant:</span>{" "}
                    <span className="font-medium">
                      {selectedEnrollment.student.firstName} {selectedEnrollment.student.lastName}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment">Tranche à payer</Label>
                  <NativeSelect
                    id="installment"
                    value={selectedInstallment}
                    onChange={(e) => handleInstallmentChange(parseInt(e.target.value) as 1 | 2)}
                  >
                    {getInstallmentOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant à payer (USD)</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{amount} USD</p>
                    <p className="text-xs text-blue-600">
                      {selectedInstallment === 1 ? "40%" : "60%"} du prix total ({selectedEnrollment?.course.price} USD)
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full" 
                  disabled={isProcessing || !amount}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payer {amount ? `${amount} ${currency}` : ""}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Paiement sécurisé via EasyPay</p>
          <p className="mt-1">Cartes bancaires et Mobile Money acceptés</p>
        </div>
      </div>
    </div>
  );
}

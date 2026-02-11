"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { CheckCircle, Loader2 } from "lucide-react";

const tradingLevels = [
  { value: "debutant", label: "Débutant (je découvre)" },
  { value: "intermediaire", label: "Intermédiaire (je connais les bases)" },
  { value: "avance", label: "Avancé (en quête de stratégie gagnante)" },
  { value: "confirme", label: "Confirmé (Besoin d'approfondissement)" },
  { value: "pro", label: "Pro (Besoin de Comprendre l'actif)" },
];

const derivOptions = [
  { value: "oui_actif", label: "Oui et je Trade déjà régulièrement" },
  { value: "oui_inactif", label: "Oui mais je n'y ai pas touché depuis plus d'un mois" },
  { value: "oui_perdu", label: "Oui mais j'ai perdu les Coordonnées" },
  { value: "non", label: "Non pas encore (aidez-moi à en avoir un)" },
];

const paymentMethods = [
  { value: "crypto", label: "Crypto (USDT)" },
  { value: "mobile", label: "Transfert Mobile (M-Pesa, Orange Money, Airtel, etc.)" },
  { value: "virement", label: "Virement Bancaire" },
];

const scheduleOptions = [
  { value: "avant-midi", label: "Avant-midi (06h00 - 08h30)" },
  { value: "apres-midi", label: "Après-midi (16h30 - 19h00)" },
  { value: "samedi", label: "Séance spéciale pratique Samedi (08h00 - 10h30)" },
];

export default function InscriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    tradingLevel: "",
    hasDeriv: "",
    paymentMethod: "",
    expectations: "",
    preferredSchedule: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h2>
              <p className="text-gray-600 mb-6">
                Merci pour votre inscription. Nous vous contacterons bientôt avec les détails de la formation.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Nouvelle inscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MPS Trading Academy</h1>
          <p className="text-gray-600">Formulaire d&apos;inscription à la formation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour vous inscrire à notre formation trading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+243 XXX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Votre adresse complète"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingLevel">Quel est votre niveau actuel en trading ? *</Label>
                <NativeSelect
                  id="tradingLevel"
                  value={formData.tradingLevel}
                  onChange={(e) => setFormData({ ...formData, tradingLevel: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez votre niveau</option>
                  {tradingLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hasDeriv">Possédez-vous déjà un compte sur le Broker Deriv ? *</Label>
                <NativeSelect
                  id="hasDeriv"
                  value={formData.hasDeriv}
                  onChange={(e) => setFormData({ ...formData, hasDeriv: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez une option</option>
                  {derivOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Mode de paiement souhaité *</Label>
                <NativeSelect
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un mode de paiement</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredSchedule">Quelle vacation souhaitez-vous ? *</Label>
                <NativeSelect
                  id="preferredSchedule"
                  value={formData.preferredSchedule}
                  onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez une vacation</option>
                  {scheduleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectations">Quelles sont vos attentes sur cette formation ?</Label>
                <Textarea
                  id="expectations"
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  placeholder="Décrivez vos objectifs et attentes..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

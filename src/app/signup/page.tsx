"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Erreur lors de l'inscription");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-4 py-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl"></div>
        <Card className="relative w-full border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Créer un compte</CardTitle>
            <CardDescription className="text-gray-500">
              Inscrivez-vous en tant qu&apos;administrateur
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
                {loading ? "Inscription..." : "S'inscrire"}
              </Button>
              <p className="text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
                ← Retour à l'accueil
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

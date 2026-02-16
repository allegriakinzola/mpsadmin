import { getTreasuryStats, getTreasuryEntries } from "@/app/actions/treasury";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const categoryLabels: Record<string, string> = {
  first_installment: "1ère tranche",
  second_installment: "2ème tranche",
  full_payment: "Paiement complet",
  refund: "Remboursement",
  other: "Autre",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default async function TreasuryPage() {
  const stats = await getTreasuryStats();
  const entries = await getTreasuryEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trésorerie</h1>
        <p className="text-muted-foreground">
          Suivi des entrées et sorties financières
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Solde total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.balance)}</div>
            <p className="text-xs text-green-600">
              {stats.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">Revenus du mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.weeklyIncome)}</div>
            <p className="text-xs text-muted-foreground">Revenus de la semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.dailyIncome)}</div>
            <p className="text-xs text-muted-foreground">Revenus du jour</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
            <CardDescription>Revenus par type de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.incomeByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryLabels[cat.category] || cat.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({cat._count} paiements)
                    </span>
                  </div>
                  <span className="font-medium text-green-600">
                    {formatCurrency(cat._sum.amount || 0)}
                  </span>
                </div>
              ))}
              {stats.incomeByCategory.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
            <CardDescription>Vue d&apos;ensemble financière</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Total des entrées</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Total des sorties</span>
                </div>
                <span className="font-bold text-red-600">
                  {formatCurrency(stats.totalExpense)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Solde net</span>
                </div>
                <span className="font-bold text-blue-600">
                  {formatCurrency(stats.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
          <CardDescription>
            Toutes les entrées et sorties financières
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune transaction enregistrée.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.type === "income" ? "success" : "destructive"}>
                        {entry.type === "income" ? "Entrée" : "Sortie"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[entry.category] || entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.description || "-"}
                    </TableCell>
                    <TableCell>
                      {entry.enrollment?.student
                        ? `${entry.enrollment.student.firstName} ${entry.enrollment.student.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {entry.enrollment?.course?.name || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      entry.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

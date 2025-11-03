import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Plus,
  TrendingUp,
  Download,
  PiggyBank,
  HandCoins,
  Gift,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Donation {
  id: string;
  montant: number;
  type_don: string;
  date_don: string;
  statut: string;
  members: {
    nom: string;
    prenom: string;
  } | null;
}

const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [churchId, setChurchId] = useState<string>("");
  const [formData, setFormData] = useState({
    montant: "",
    type_don: "",
    membre_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Non authentifié");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) return;
      setChurchId(roleData.church_id);

      await loadMembers(roleData.church_id);
      await loadDonations(roleData.church_id);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (churchId: string) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("church_id", churchId)
      .order("nom");

    if (error) {
      console.error("Error loading members:", error);
      return;
    }
    setMembers(data || []);
  };

  const loadDonations = async (churchId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select("*, members(*)")
      .eq("church_id", churchId)
      .order("date_don", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des dons");
      return;
    }

    setDonations(data || []);
  };

  const getFilteredDonations = () => {
    if (filterPeriod === "all") return donations;

    const now = new Date();
    return donations.filter((don) => {
      const donDate = new Date(don.date_don);

      if (filterPeriod === "month") {
        return donDate.getMonth() === now.getMonth() && donDate.getFullYear() === now.getFullYear();
      } else if (filterPeriod === "year") {
        return donDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.montant || !formData.type_don) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const selectedMember = formData.membre_id ? members.find((m) => m.id === formData.membre_id) : null;

    navigate("/donation-payment", {
      state: {
        donationData: {
          montant: parseFloat(formData.montant),
          type_don: formData.type_don,
          membre_id: formData.membre_id || null,
          church_id: churchId,
          memberName: selectedMember ? `${selectedMember.nom} ${selectedMember.prenom}` : null,
        },
      },
    });

    setDialogOpen(false);
    setFormData({ montant: "", type_don: "", membre_id: "" });
  };

  const exportToCSV = () => {
    const filtered = getFilteredDonations();
    const headers = ["Date", "Donateur", "Type", "Montant", "Statut"];
    const csvContent = [
      headers.join(","),
      ...filtered.map((d) =>
        [
          new Date(d.date_don).toLocaleDateString("fr-FR"),
          d.members ? `${d.members.nom} ${d.members.prenom}` : "Anonyme",
          d.type_don,
          d.montant,
          d.statut,
        ].join(",")
      ),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dons_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export CSV réussi");
  };

  // Statistiques
  const filtered = getFilteredDonations();
  const totalAmount = filtered.reduce((sum, d) => sum + Number(d.montant), 0);
  const stats = {
    total: totalAmount,
    dime: filtered.filter((d) => d.type_don === "dime").reduce((s, d) => s + Number(d.montant), 0),
    offrande: filtered.filter((d) => d.type_don === "offrande").reduce((s, d) => s + Number(d.montant), 0),
    cotisation: filtered.filter((d) => d.type_don === "cotisation").reduce((s, d) => s + Number(d.montant), 0),
    special: filtered.filter((d) => d.type_don === "contribution_speciale").reduce((s, d) => s + Number(d.montant), 0),
    nbDonations: filtered.length,
    confirmes: filtered.filter((d) => d.statut === "completed").length,
  };

  // Données pour graphiques
  const donationsByType = [
    { name: "Dîme", value: stats.dime, color: "#1E90FF" },
    { name: "Offrande", value: stats.offrande, color: "#D4AF37" },
    { name: "Cotisation", value: stats.cotisation, color: "#10b981" },
    { name: "Spécial", value: stats.special, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // Graphique par mois
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString("fr-FR", { month: "short" });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    const monthDonations = donations.filter((d) => {
      const donDate = new Date(d.date_don);
      return donDate.getMonth() === date.getMonth() && donDate.getFullYear() === date.getFullYear();
    });

    return {
      month: monthYear,
      total: monthDonations.reduce((sum, d) => sum + Number(d.montant), 0),
    };
  });

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { icon: any; color: string; label: string }> = {
      completed: { icon: CheckCircle2, color: "bg-green-500 text-white", label: "Confirmé" },
      pending: { icon: Clock, color: "bg-yellow-500 text-white", label: "En attente" },
      failed: { icon: AlertCircle, color: "bg-red-500 text-white", label: "Échoué" },
    };
    const variant = variants[statut] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.color} rounded-[10px] flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      dime: { color: "bg-[hsl(var(--primary))] text-white", label: "Dîme" },
      offrande: { color: "bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar-background))]", label: "Offrande" },
      cotisation: { color: "bg-green-500 text-white", label: "Cotisation" },
      contribution_speciale: { color: "bg-orange-500 text-white", label: "Spéciale" },
    };
    const variant = variants[type] || { color: "bg-gray-500 text-white", label: type };
    return <Badge className={`${variant.color} rounded-[10px]`}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--text-dark))] flex items-center gap-3">
              <div className="h-12 w-12 rounded-[10px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-3d">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              Transparence et Bénédictions
            </h1>
            <p className="text-[hsl(var(--text-dark))]/70 mt-2 ml-15">
              Gestion des dons et finances de l'église
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" className="rounded-[10px]">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-[10px] shadow-3d bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  💳 Nouveau don
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[10px]">
                <DialogHeader>
                  <DialogTitle className="text-[hsl(var(--text-dark))]">Enregistrer un nouveau don</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="montant" className="text-[hsl(var(--text-dark))]">
                      Montant (FCFA) *
                    </Label>
                    <Input
                      id="montant"
                      type="number"
                      step="1"
                      min="0"
                      required
                      placeholder="5000"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type_don" className="text-[hsl(var(--text-dark))]">
                      Type de don *
                    </Label>
                    <Select
                      value={formData.type_don}
                      onValueChange={(value) => setFormData({ ...formData, type_don: value })}
                      required
                    >
                      <SelectTrigger className="rounded-[10px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dime">Dîme</SelectItem>
                        <SelectItem value="offrande">Offrande</SelectItem>
                        <SelectItem value="cotisation">Cotisation</SelectItem>
                        <SelectItem value="contribution_speciale">Contribution spéciale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="membre_id" className="text-[hsl(var(--text-dark))]">
                      Donateur (optionnel)
                    </Label>
                    <Select
                      value={formData.membre_id}
                      onValueChange={(value) => setFormData({ ...formData, membre_id: value })}
                    >
                      <SelectTrigger className="rounded-[10px]">
                        <SelectValue placeholder="Anonyme" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.nom} {member.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="rounded-[10px]"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                    >
                      💳 Procéder au paiement
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-3d rounded-[10px] border-none bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collecté</p>
                  <p className="text-3xl font-bold text-[hsl(var(--text-dark))]">
                    {stats.total.toLocaleString()} F
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.nbDonations} dons</p>
                </div>
                <DollarSign className="h-12 w-12 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none bg-gradient-to-br from-[hsl(var(--primary))]/10 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dîmes</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">
                    {stats.dime.toLocaleString()} F
                  </p>
                </div>
                <PiggyBank className="h-10 w-10 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none bg-gradient-to-br from-[hsl(var(--secondary))]/10 to-yellow-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offrandes</p>
                  <p className="text-3xl font-bold text-[hsl(var(--secondary))]">
                    {stats.offrande.toLocaleString()} F
                  </p>
                </div>
                <HandCoins className="h-10 w-10 text-[hsl(var(--secondary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none bg-gradient-to-br from-green-100 to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmes}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="liste" className="space-y-6">
          <TabsList className="bg-white shadow-3d rounded-[10px] p-1">
            <TabsTrigger
              value="liste"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Liste des dons
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Graphiques
            </TabsTrigger>
            <TabsTrigger
              value="objectifs"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <Target className="mr-2 h-4 w-4" />
              Objectifs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="space-y-4">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[hsl(var(--text-dark))]">
                    💰 Historique des dons ({filtered.length})
                  </CardTitle>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[180px] rounded-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes périodes</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun don pour cette période</p>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((don) => (
                      <div
                        key={don.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-[10px] bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(don.type_don)}
                            {getStatutBadge(don.statut)}
                          </div>
                          <p className="font-semibold text-[hsl(var(--text-dark))]">
                            {don.members ? `${don.members.nom} ${don.members.prenom}` : "Anonyme"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(don.date_don).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                          {Number(don.montant).toLocaleString()} F
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-3d rounded-[10px] border-none">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--text-dark))]">Répartition par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={donationsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {donationsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} F`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-3d rounded-[10px] border-none">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--text-dark))]">Évolution des dons (6 derniers mois)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} F`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#1E90FF"
                        strokeWidth={3}
                        name="Total dons"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-3d rounded-[10px] border-none md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--text-dark))]">Comparatif mensuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} F`} />
                      <Legend />
                      <Bar dataKey="total" fill="#1E90FF" name="Total dons" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="objectifs" className="space-y-6">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">🎯 Objectifs de dons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-[10px] border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[hsl(var(--text-dark))]">Objectif mensuel</h3>
                    <Badge className="bg-[hsl(var(--primary))] text-white rounded-[10px]">
                      En cours
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Objectif: 500,000 F</span>
                      <span className="font-bold">{((stats.total / 500000) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full transition-all"
                        style={{ width: `${Math.min((stats.total / 500000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Collecté: {stats.total.toLocaleString()} F / 500,000 F
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-[10px] border border-green-200">
                  <h3 className="font-semibold text-[hsl(var(--text-dark))] mb-2">
                    ✅ Alertes automatiques
                  </h3>
                  <div className="space-y-2 text-sm">
                    {stats.total >= 500000 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Objectif mensuel atteint !</span>
                      </div>
                    )}
                    {stats.total < 500000 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Objectif en cours... Encore {(500000 - stats.total).toLocaleString()} F</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span>Dons récurrents actifs: 0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
};

export default Donations;
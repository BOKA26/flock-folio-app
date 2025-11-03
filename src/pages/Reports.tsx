import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar, Heart, Sparkles, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChurchStats {
  totalMembers: number;
  activeMembers: number;
  totalDonations: number;
  upcomingEvents: number;
  pendingPrayers: number;
  newMembers: number;
  attendanceRate: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState<ChurchStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalDonations: 0,
    upcomingEvents: 0,
    pendingPrayers: 0,
    newMembers: 0,
    attendanceRate: 0,
  });
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [monthlyDonations, setMonthlyDonations] = useState<any[]>([]);
  const [membersByStatus, setMembersByStatus] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const { toast } = useToast();

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) return;
      const churchId = roleData.church_id;

      // Charger les membres
      const { data: members } = await supabase
        .from("members")
        .select("*")
        .eq("church_id", churchId);

      const totalMembers = members?.length || 0;
      const activeMembers = members?.filter(m => m.statut === "actif").length || 0;

      // Nouveaux membres ce mois
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const newMembers = members?.filter(m => new Date(m.created_at) >= firstDayOfMonth).length || 0;

      // Charger les dons
      const { data: donations } = await supabase
        .from("donations")
        .select("*")
        .eq("church_id", churchId);

      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.montant), 0) || 0;

      // Dons par mois (6 derniers mois)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString("fr-FR", { month: "short" });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthDonations = donations?.filter(d => {
          const donDate = new Date(d.date_don);
          return donDate >= monthStart && donDate <= monthEnd;
        }) || [];

        monthlyData.push({
          mois: monthName,
          montant: monthDonations.reduce((sum, d) => sum + Number(d.montant), 0),
        });
      }
      setMonthlyDonations(monthlyData);

      // Membres par statut
      const statusCounts: Record<string, number> = {};
      members?.forEach(m => {
        statusCounts[m.statut] = (statusCounts[m.statut] || 0) + 1;
      });
      const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
      setMembersByStatus(statusData);

      // Charger les événements
      const { data: events } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", churchId)
        .eq("type", "evenement")
        .gte("date_evenement", new Date().toISOString());

      const upcomingEvents = events?.length || 0;

      // Charger les demandes de prière
      const { data: prayers } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("church_id", churchId)
        .eq("statut", "pending");

      const pendingPrayers = prayers?.length || 0;

      // Fréquentation (simulée pour l'exemple)
      const attendanceSimulated = [
        { semaine: "S-4", taux: 75 },
        { semaine: "S-3", taux: 82 },
        { semaine: "S-2", taux: 78 },
        { semaine: "S-1", taux: 85 },
        { semaine: "Cette semaine", taux: 88 },
      ];
      setAttendanceData(attendanceSimulated);

      setStats({
        totalMembers,
        activeMembers,
        totalDonations,
        upcomingEvents,
        pendingPrayers,
        newMembers,
        attendanceRate: 85,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pastoral-advisor", {
        body: { churchData: stats },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("Limite de requêtes")) {
          toast({
            title: "Limite atteinte",
            description: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
            variant: "destructive",
          });
        } else if (data.error.includes("Paiement requis")) {
          toast({
            title: "Crédits insuffisants",
            description: "Veuillez ajouter des crédits à votre espace Lovable AI.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setAiSuggestion(data.suggestion);
      toast({
        title: "Suggestions générées",
        description: "Le conseiller pastoral a analysé vos données",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fonctionnalité à venir",
    });
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Rapports & Analyses
            </h1>
            <p className="text-muted-foreground mt-2">Vue d'ensemble de votre église</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Membres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeMembers} actifs • {stats.newMembers} nouveaux ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Dons totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {stats.totalDonations.toLocaleString()} F
              </p>
              <p className="text-xs text-muted-foreground mt-1">Tous les dons</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">{stats.upcomingEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">À venir</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Demandes de prière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{stats.pendingPrayers}</p>
              <p className="text-xs text-muted-foreground mt-1">En attente</p>
            </CardContent>
          </Card>
        </div>

        {/* Assistant IA Conseiller Pastoral */}
        <Card className="border-2 border-primary/20 shadow-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle>Conseiller Pastoral IA</CardTitle>
              </div>
              <Button
                onClick={getAISuggestions}
                disabled={aiLoading}
                className="gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Obtenir des suggestions
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiSuggestion ? (
              <ScrollArea className="h-[200px] pr-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{aiSuggestion}</p>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>
                  Cliquez sur "Obtenir des suggestions" pour que l'IA analyse vos données
                  et vous donne des recommandations pastorales personnalisées.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donations">Dons</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="attendance">Fréquentation</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des dons (6 derniers mois)</CardTitle>
                <CardDescription>Montant total par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyDonations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="montant" fill="hsl(var(--primary))" name="Montant (FCFA)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des membres par statut</CardTitle>
                <CardDescription>Distribution actuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={membersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {membersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Taux de fréquentation aux cultes</CardTitle>
                <CardDescription>5 dernières semaines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semaine" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="taux"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Taux de présence (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}

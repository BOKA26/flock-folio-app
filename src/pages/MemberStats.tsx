import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Heart, DollarSign, Church, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const MemberStats = () => {
  const [member, setMember] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalPrayers: 0,
    attendanceRate: 0,
    resourcesViewed: 0,
    donationsByMonth: [] as any[],
    prayersByStatus: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!memberData) return;
      setMember(memberData);

      // Load donations
      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .eq("membre_id", memberData.id);

      // Load prayers
      const { data: prayersData } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("membre_id", memberData.id);

      // Calculate stats
      const totalDonations = donationsData?.reduce((sum, d) => sum + Number(d.montant), 0) || 0;
      const totalPrayers = prayersData?.length || 0;

      // Donations by month (last 6 months)
      const monthlyDonations = processMonthlyDonations(donationsData || []);

      // Prayers by status
      const prayersByStatus = processPrayersByStatus(prayersData || []);

      setStats({
        totalDonations,
        totalPrayers,
        attendanceRate: 85, // Mock data
        resourcesViewed: 12, // Mock data
        donationsByMonth: monthlyDonations,
        prayersByStatus,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyDonations = (donations: any[]) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthDonations = donations.filter(d => {
        const donationDate = new Date(d.date_don);
        return donationDate.getMonth() === month.getMonth() &&
               donationDate.getFullYear() === month.getFullYear();
      });

      result.push({
        month: months[month.getMonth()],
        montant: monthDonations.reduce((sum, d) => sum + Number(d.montant), 0),
        nombre: monthDonations.length,
      });
    }

    return result;
  };

  const processPrayersByStatus = (prayers: any[]) => {
    const statusMap = new Map([
      ['pending', { name: 'En attente', count: 0 }],
      ['in_progress', { name: 'En prière', count: 0 }],
      ['answered', { name: 'Exaucées', count: 0 }],
    ]);

    prayers.forEach(p => {
      const status = statusMap.get(p.statut);
      if (status) {
        status.count++;
      }
    });

    return Array.from(statusMap.values()).filter(s => s.count > 0);
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Ma Croissance Spirituelle
        </h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Dons Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.totalDonations.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Générosité
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Prières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.totalPrayers}</p>
              <p className="text-xs text-muted-foreground mt-1">Demandes totales</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Church className="h-4 w-4" />
                Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Taux de présence</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ressources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.resourcesViewed}</p>
              <p className="text-xs text-muted-foreground mt-1">Consultées</p>
            </CardContent>
          </Card>
        </div>

        {/* Encouragement Message */}
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-divine flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Message d'encouragement</h3>
                <p className="text-muted-foreground">
                  Vous avez participé à {stats.attendanceRate}% des cultes ce mois-ci. Continuez dans la foi ! 
                  Votre engagement spirituel est remarquable. 🙏
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Donations Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Évolution des Dons (6 mois)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.donationsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.donationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="montant" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prayers Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" />
                État des Prières
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.prayersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.prayersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.prayersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicators */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Indicateurs de Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Participation aux cultes</span>
                <span className="text-sm font-medium">{stats.attendanceRate}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-3">
                <div
                  className="bg-gradient-divine h-3 rounded-full transition-all"
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Lectures spirituelles</span>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-3">
                <div
                  className="bg-gradient-divine h-3 rounded-full transition-all"
                  style={{ width: "60%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Engagement communautaire</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-3">
                <div
                  className="bg-gradient-divine h-3 rounded-full transition-all"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberStats;

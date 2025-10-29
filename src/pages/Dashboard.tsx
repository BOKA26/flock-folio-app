import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, DollarSign, Megaphone, UserPlus, Plus, Edit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    members: 0,
    prayers: 0,
    donations: 0,
    announcements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [weeklyDonations, setWeeklyDonations] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id, role")
        .eq("user_id", user.id)
        .single();

      if (!roleData) {
        setLoading(false);
        return;
      }

      const { data: churchData } = await supabase
        .from("churches")
        .select("*")
        .eq("id", roleData.church_id)
        .single();

      setChurchInfo(churchData);
      setUserRole(roleData.role);

      // Load stats and data
      const [membersData, prayersData, donationsData, announcementsData, recentMembersData, recentDonationsData] =
        await Promise.all([
          supabase.from("members").select("id", { count: "exact" }),
          supabase.from("prayer_requests").select("id", { count: "exact" }),
          supabase.from("donations").select("montant, date_don"),
          supabase.from("announcements").select("id", { count: "exact" }),
          supabase.from("members").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("donations").select("*, members(nom, prenom)").order("date_don", { ascending: false }).limit(5),
        ]);

      const totalDonations = (donationsData.data || []).reduce(
        (sum, don) => sum + Number(don.montant),
        0
      );

      setStats({
        members: membersData.count || 0,
        prayers: prayersData.count || 0,
        donations: totalDonations,
        announcements: announcementsData.count || 0,
      });

      setRecentMembers(recentMembersData.data || []);
      setRecentDonations(recentDonationsData.data || []);

      // Process weekly donations for chart
      const weeklyData = processWeeklyDonations(donationsData.data || []);
      setWeeklyDonations(weeklyData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyDonations = (donations: any[]) => {
    const weekLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayIndex = date.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust Sunday to end

      const dayDonations = donations.filter(d => {
        const donDate = new Date(d.date_don);
        return donDate.toDateString() === date.toDateString();
      });

      const total = dayDonations.reduce((sum, d) => sum + Number(d.montant), 0);

      weekData.push({
        jour: weekLabels[adjustedIndex],
        montant: total
      });
    }

    return weekData;
  };

  return (
    <DashboardLayout>
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenue sur votre espace de gestion
            </p>
          </div>

          {churchInfo?.verset_clef && (
            <Card className="shadow-gentle border-l-4 border-l-primary">
              <CardContent className="py-6">
                <p className="text-lg italic text-foreground">
                  "{churchInfo.verset_clef}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Action Buttons - Only for admin and operateur */}
          {(userRole === 'admin' || userRole === 'operateur') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/members')}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Ajouter un membre</span>
              </Button>
              <Button
                onClick={() => navigate('/donations')}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Nouveau don</span>
              </Button>
              <Button
                onClick={() => navigate('/announcements')}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Megaphone className="h-6 w-6" />
                <span className="text-sm">Nouvelle annonce</span>
              </Button>
              <Button
                onClick={() => navigate('/church')}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Edit className="h-6 w-6" />
                <span className="text-sm">Modifier mon église</span>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-gentle hover:shadow-elegant transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.announcements}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Annonces actives
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-gentle hover:shadow-elegant transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Membres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.members}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Membres enregistrés
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-gentle hover:shadow-elegant transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Prières
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.prayers}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Demandes de prière
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-gentle hover:shadow-elegant transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Dons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats.donations.toFixed(2)} €
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total des dons
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Data */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* Weekly Donations Chart */}
            <Card className="shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Dons hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyDonations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(2)} €`}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card className="shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Membres récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMembers.length > 0 ? (
                    recentMembers.map((member) => (
                      <div key={member.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-semibold">{member.prenom} {member.nom}</p>
                          <p className="text-xs text-muted-foreground">{member.email || member.telephone}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun membre récent</p>
                  )}
                </div>
                <Button 
                  onClick={() => navigate('/members')} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Voir tous les membres
                </Button>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="shadow-gentle lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Dons récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDonations.length > 0 ? (
                    recentDonations.map((donation: any) => (
                      <div key={donation.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold">{donation.members?.prenom} {donation.members?.nom}</p>
                          <p className="text-xs text-muted-foreground">{donation.type_don}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{Number(donation.montant).toFixed(2)} €</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.date_don).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun don récent</p>
                  )}
                </div>
                <Button 
                  onClick={() => navigate('/donations')} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Voir tous les dons
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, DollarSign, Megaphone } from "lucide-react";

const Dashboard = () => {
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    members: 0,
    prayers: 0,
    donations: 0,
    announcements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        const { data: churchData } = await supabase
          .from("churches")
          .select("*")
          .eq("id", roleData.church_id)
          .single();

        setChurchInfo(churchData);

        // Load stats
        const [membersData, prayersData, donationsData, announcementsData] =
          await Promise.all([
            supabase.from("members").select("id", { count: "exact" }),
            supabase.from("prayer_requests").select("id", { count: "exact" }),
            supabase.from("donations").select("montant"),
            supabase.from("announcements").select("id", { count: "exact" }),
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
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

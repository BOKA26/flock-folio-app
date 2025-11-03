import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

const MemberDonations = () => {
  const [member, setMember] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastDonation: null as any,
    byType: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
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

      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .eq("membre_id", memberData.id)
        .order("date_don", { ascending: false });

      if (donationsData) {
        setDonations(donationsData);
        calculateStats(donationsData);
      }
    } catch (error) {
      console.error("Error loading donations:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (donationsData: any[]) => {
    const total = donationsData.reduce((sum, d) => sum + Number(d.montant), 0);
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = donationsData
      .filter(d => new Date(d.date_don) >= firstDayOfMonth)
      .reduce((sum, d) => sum + Number(d.montant), 0);

    const lastDonation = donationsData[0] || null;

    // Group by type
    const byTypeMap = new Map();
    donationsData.forEach(d => {
      const current = byTypeMap.get(d.type_don) || 0;
      byTypeMap.set(d.type_don, current + Number(d.montant));
    });

    const byType = Array.from(byTypeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    setStats({ total, thisMonth, lastDonation, byType });
  };

  const handleDonate = () => {
    toast.info("Intégration Paystack à venir");
  };

  const handleDownloadReceipt = (donationId: string) => {
    toast.info("Génération PDF à venir");
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Mes Dons et Contributions
          </h1>
          <Button onClick={handleDonate} className="gradient-divine">
            <DollarSign className="h-4 w-4 mr-2" />
            Faire un don
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total des Dons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.total.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground mt-1">{donations.length} contributions</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Ce Mois-ci</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.thisMonth.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                En cours
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Dernier Don</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.lastDonation ? (
                <>
                  <p className="text-3xl font-bold">{Number(stats.lastDonation.montant).toFixed(2)} €</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(stats.lastDonation.date_don).toLocaleDateString('fr-FR')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun don</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Répartition par Type</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Aucune donnée</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Historique des 6 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Donations List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Historique Complet</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-divine flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{donation.type_don}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.date_don).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{Number(donation.montant).toFixed(2)} €</p>
                        <p className="text-xs text-muted-foreground">
                          {donation.statut === 'completed' ? '✓ Réussi' : '⏳ En attente'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(donation.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun don enregistré</p>
                <Button onClick={handleDonate} className="mt-4 gradient-divine">
                  Faire votre premier don
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberDonations;

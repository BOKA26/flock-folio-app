import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OperatorDashboardLayout from "@/components/layout/OperatorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Heart,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [operatorName, setOperatorName] = useState("");
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalDonations: 0,
    upcomingEvents: 0,
    pendingPrayers: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Get user role and church
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, full_name, church_id")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || (roleData.role !== "operateur" && roleData.role !== "admin")) {
      navigate("/member-space");
      return;
    }

    setOperatorName(roleData.full_name?.split(" ")[0] || "");

    const churchId = roleData.church_id;

    // Load statistics
    const [membersRes, donationsRes, eventsRes, prayersRes] = await Promise.all([
      supabase.from("members").select("id", { count: "exact" }).eq("church_id", churchId),
      supabase.from("donations").select("montant").eq("church_id", churchId),
      supabase.from("announcements").select("id", { count: "exact" })
        .eq("church_id", churchId)
        .gte("date_evenement", new Date().toISOString()),
      supabase.from("prayer_requests").select("id", { count: "exact" })
        .eq("church_id", churchId)
        .eq("statut", "pending"),
    ]);

    setStats({
      totalMembers: membersRes.count || 0,
      totalDonations: donationsRes.data?.reduce((sum, d) => sum + Number(d.montant), 0) || 0,
      upcomingEvents: eventsRes.count || 0,
      pendingPrayers: prayersRes.count || 0,
    });

    // Load weekly donation data
    const weeklyDonations = await processWeeklyDonations(donationsRes.data || []);
    setWeeklyData(weeklyDonations);

    // Load recent messages from pastor
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("church_id", churchId)
      .eq("recipient_type", "all")
      .order("created_at", { ascending: false })
      .limit(3);

    setRecentMessages(messages || []);
    setLoading(false);
  };

  const processWeeklyDonations = (donations: any[]) => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weekData = days.map(day => ({ day, montant: 0 }));

    donations.forEach((donation) => {
      const date = new Date(donation.date_don);
      const dayIndex = date.getDay();
      weekData[dayIndex].montant += Number(donation.montant);
    });

    return weekData;
  };

  if (loading) {
    return (
      <OperatorDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--operator-blue))]"></div>
        </div>
      </OperatorDashboardLayout>
    );
  }

  const quickActions = [
    { icon: UserPlus, label: "Ajouter un membre", path: "/members", color: "from-blue-500 to-blue-600" },
    { icon: CalendarPlus, label: "Créer un événement", path: "/announcements", color: "from-purple-500 to-purple-600" },
    { icon: DollarSign, label: "Enregistrer un don", path: "/donations", color: "from-green-500 to-green-600" },
    { icon: MessageSquare, label: "Envoyer un message", path: "/communication", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <OperatorDashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[hsl(var(--operator-deep-blue))] to-[hsl(var(--operator-blue))] rounded-[20px] shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-[hsl(var(--operator-gold))]" />
          <h1 className="text-3xl font-bold">
            👋 Bonjour, {operatorName}
          </h1>
        </div>
        <p className="text-white/80 text-lg">
          Que la grâce du Seigneur t'accompagne aujourd'hui.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-blue-50/50 rounded-[15px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--operator-deep-blue))]/70">
                Membres actifs
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--operator-blue))]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[hsl(var(--operator-blue))]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--operator-deep-blue))]">
              {stats.totalMembers}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total des fidèles</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-green-50/50 rounded-[15px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--operator-deep-blue))]/70">
                Dons enregistrés
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--operator-deep-blue))]">
              {stats.totalDonations.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-muted-foreground mt-1">Montant total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-purple-50/50 rounded-[15px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--operator-deep-blue))]/70">
                Événements à venir
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--operator-deep-blue))]">
              {stats.upcomingEvents}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Programmés</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-pink-50/50 rounded-[15px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--operator-deep-blue))]/70">
                Nouvelles prières
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--operator-deep-blue))]">
              {stats.pendingPrayers}
            </p>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 border-0 shadow-lg rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--operator-deep-blue))] flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[hsl(var(--operator-gold))]" />
            Actions rapides
          </CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`h-auto py-4 px-4 bg-gradient-to-r ${action.color} text-white rounded-[12px] shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="border-0 shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--operator-deep-blue))]">
              Activité hebdomadaire
            </CardTitle>
            <CardDescription>Dons reçus cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                />
                <Bar 
                  dataKey="montant" 
                  fill="hsl(var(--operator-blue))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-0 shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--operator-deep-blue))]">
              Derniers messages du pasteur
            </CardTitle>
            <CardDescription>Messages récents pour l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-[12px] border border-blue-100/50"
                  >
                    <h4 className="font-semibold text-[hsl(var(--operator-deep-blue))] mb-1">
                      {message.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(message.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full rounded-[10px] border-[hsl(var(--operator-blue))] text-[hsl(var(--operator-blue))] hover:bg-[hsl(var(--operator-blue))]/10"
                  onClick={() => navigate("/communication")}
                >
                  Voir tous les messages
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun message récent</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorDashboardLayout>
  );
};

export default OperatorDashboard;

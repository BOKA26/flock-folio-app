import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Send, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MemberPrayers = () => {
  const [member, setMember] = useState<any>(null);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
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

      const { data: prayersData } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("membre_id", memberData.id)
        .order("date_demande", { ascending: false });

      setPrayers(prayersData || []);
    } catch (error) {
      console.error("Error loading prayers:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrayer = async () => {
    if (!newPrayer.trim()) {
      toast.error("Veuillez saisir votre demande de prière");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .insert({
          texte: newPrayer,
          membre_id: member.id,
          church_id: member.church_id,
          statut: "pending",
        });

      if (error) throw error;

      toast.success("Votre demande de prière a été envoyée 🙏");
      setNewPrayer("");
      loadPrayers();
    } catch (error) {
      console.error("Error submitting prayer:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { icon: Clock, label: "En attente", color: "text-yellow-500" };
      case "in_progress":
        return { icon: Heart, label: "En prière", color: "text-blue-500" };
      case "answered":
        return { icon: CheckCircle, label: "Exaucée", color: "text-green-500" };
      default:
        return { icon: Clock, label: "En attente", color: "text-gray-500" };
    }
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
            <Heart className="h-8 w-8 text-primary" />
            Ma Vie Spirituelle
          </h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-divine">
                <Heart className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Demande de Prière</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="prayer">Votre demande de prière</Label>
                  <Textarea
                    id="prayer"
                    placeholder="Partagez votre besoin de prière..."
                    value={newPrayer}
                    onChange={(e) => setNewPrayer(e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleSubmitPrayer}
                  disabled={submitting}
                  className="w-full gradient-divine"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Envoi..." : "Envoyer ma demande"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prayer Statistics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{prayers.length}</p>
              <p className="text-xs text-muted-foreground mt-1">demandes</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">En cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">
                {prayers.filter(p => p.statut === "in_progress" || p.statut === "pending").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">prières</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Exaucées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {prayers.filter(p => p.statut === "answered").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">louanges</p>
            </CardContent>
          </Card>
        </div>

        {/* Prayers List */}
        <div className="space-y-4">
          {prayers.length > 0 ? (
            prayers.map((prayer) => {
              const statusInfo = getStatusInfo(prayer.statut);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={prayer.id} className="shadow-soft hover:shadow-divine transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-foreground flex-1">{prayer.texte}</p>
                        <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                          <StatusIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(prayer.date_demande).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        {prayer.answered_at && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Répondue le {new Date(prayer.answered_at).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>

                      {prayer.reponse && (
                        <div className="bg-gradient-divine p-4 rounded-lg border-l-4 border-l-primary">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm mb-1">Message d'encouragement</p>
                              <p className="text-sm">{prayer.reponse}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de demande de prière
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gradient-divine">
                      <Heart className="h-4 w-4 mr-2" />
                      Faire ma première demande
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Nouvelle Demande de Prière</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="prayer">Votre demande de prière</Label>
                        <Textarea
                          id="prayer"
                          placeholder="Partagez votre besoin de prière..."
                          value={newPrayer}
                          onChange={(e) => setNewPrayer(e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                      </div>
                      <Button
                        onClick={handleSubmitPrayer}
                        disabled={submitting}
                        className="w-full gradient-divine"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? "Envoi..." : "Envoyer ma demande"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberPrayers;

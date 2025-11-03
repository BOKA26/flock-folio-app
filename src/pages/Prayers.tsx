import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Heart, Trash2, User, MessageSquare, Archive, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Prayers = () => {
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({ texte: "" });

  useEffect(() => {
    checkRole();
    loadPrayers();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    setUserRole(data?.role || null);
  };

  const loadPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*, members(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) throw new Error("Église non trouvée");

      const { error } = await supabase.from("prayer_requests").insert({
        texte: formData.texte,
        church_id: roleData.church_id,
      });

      if (error) throw error;

      toast.success("Demande de prière ajoutée");
      setDialogOpen(false);
      setFormData({ texte: "" });
      loadPrayers();
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;

    try {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;

      toast.success("Demande supprimée");
      loadPrayers();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .update({ statut: "archived" })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Demande archivée");
      loadPrayers();
    } catch (error: any) {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");

  const handleAnswer = async () => {
    if (!selectedPrayer) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("prayer_requests")
        .update({
          statut: "answered",
          reponse: answerText,
          answered_by: user.id,
          answered_at: new Date().toISOString(),
        })
        .eq("id", selectedPrayer.id);
      
      if (error) throw error;
      
      toast.success("Réponse envoyée");
      setAnswerDialogOpen(false);
      setAnswerText("");
      setSelectedPrayer(null);
      loadPrayers();
    } catch (error: any) {
      toast.error("Erreur lors de la réponse");
    }
  };

  const stats = {
    total: prayers.length,
    pending: prayers.filter(p => p.statut === "pending").length,
    answered: prayers.filter(p => p.statut === "answered").length,
    archived: prayers.filter(p => p.statut === "archived").length,
  };

  const canManage = userRole === "admin" || userRole === "operateur";

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Demandes de prière
            </h1>
            <p className="text-muted-foreground mt-2">
              Espace de prières et intentions
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-elegant hover:shadow-glow transition-all">
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demande de prière</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="texte">Votre demande *</Label>
                  <Textarea
                    id="texte"
                    required
                    rows={5}
                    placeholder="Partagez votre intention de prière..."
                    value={formData.texte}
                    onChange={(e) =>
                      setFormData({ ...formData, texte: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  Soumettre
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-gentle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="shadow-gentle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-yellow-500" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="shadow-gentle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                Répondues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{stats.answered}</p>
            </CardContent>
          </Card>

          <Card className="shadow-gentle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                Archivées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">{stats.archived}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="answered">Répondues</TabsTrigger>
            <TabsTrigger value="archived">Archivées</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : prayers.filter(p => p.statut === "pending").length === 0 ? (
              <Card className="shadow-gentle">
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune demande en attente
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {prayers.filter(p => p.statut === "pending").map((prayer) => (
                  <Card key={prayer.id} className="shadow-gentle hover:shadow-elegant transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Demande de prière
                          </CardTitle>
                          <Badge variant="outline">En attente</Badge>
                        </div>
                        <div className="flex gap-2">
                          {canManage && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPrayer(prayer);
                                  setAnswerDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Répondre
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchive(prayer.id)}
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Archiver
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(prayer.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-3">
                        {prayer.texte}
                      </p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          {new Date(prayer.date_demande).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {prayer.members && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <User className="h-3 w-3" />
                            {prayer.members.nom} {prayer.members.prenom}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="answered" className="space-y-4">
            {prayers.filter(p => p.statut === "answered").length === 0 ? (
              <Card className="shadow-gentle">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune demande répondue
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {prayers.filter(p => p.statut === "answered").map((prayer) => (
                  <Card key={prayer.id} className="shadow-gentle hover:shadow-elegant transition-all border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Demande de prière
                          </CardTitle>
                          <Badge className="bg-green-500">Répondue</Badge>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(prayer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-3">
                        {prayer.texte}
                      </p>
                      {prayer.reponse && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-semibold mb-1 text-green-800 dark:text-green-200">
                            Réponse :
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {prayer.reponse}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          {new Date(prayer.date_demande).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {prayer.members && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <User className="h-3 w-3" />
                            {prayer.members.nom} {prayer.members.prenom}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            {prayers.filter(p => p.statut === "archived").length === 0 ? (
              <Card className="shadow-gentle">
                <CardContent className="py-12 text-center">
                  <Archive className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune demande archivée
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {prayers.filter(p => p.statut === "archived").map((prayer) => (
                  <Card key={prayer.id} className="shadow-gentle hover:shadow-elegant transition-all opacity-60">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Demande de prière
                          </CardTitle>
                          <Badge variant="outline">Archivée</Badge>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(prayer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-3">
                        {prayer.texte}
                      </p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          {new Date(prayer.date_demande).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {prayer.members && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <User className="h-3 w-3" />
                            {prayer.members.nom} {prayer.members.prenom}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog pour répondre */}
        <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Répondre à la demande</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPrayer && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {selectedPrayer.texte}
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="answer">Votre réponse</Label>
                <Textarea
                  id="answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  rows={5}
                />
              </div>
              <Button onClick={handleAnswer} className="w-full">
                Envoyer la réponse
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
};

export default Prayers;

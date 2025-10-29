import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Plus, Heart, Trash2, User } from "lucide-react";
import { toast } from "sonner";

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

  const canManage = userRole === "admin" || userRole === "operateur";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Demandes de prière
            </h1>
            <p className="text-muted-foreground mt-1">
              Partagez vos intentions de prière
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
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

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : prayers.length === 0 ? (
          <Card className="shadow-gentle">
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune demande de prière pour le moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {prayers.map((prayer) => (
              <Card
                key={prayer.id}
                className="shadow-gentle hover:shadow-elegant transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Demande de prière
                    </CardTitle>
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
      </div>
    </DashboardLayout>
  );
};

export default Prayers;

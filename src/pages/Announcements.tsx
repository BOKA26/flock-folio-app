import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, Trash2, Edit, Upload } from "lucide-react";
import { toast } from "sonner";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    date_evenement: "",
    image_url: "",
  });

  useEffect(() => {
    checkRole();
    loadAnnouncements();
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

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des annonces");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('church-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('church-covers')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploadée");
    } catch (error: any) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
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

      const announcementData = {
        titre: formData.titre,
        contenu: formData.contenu,
        date_evenement: formData.date_evenement || null,
        image_url: formData.image_url || null,
        church_id: roleData.church_id,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
        toast.success("Annonce modifiée avec succès");
      } else {
        const { error } = await supabase.from("announcements").insert(announcementData);
        if (error) throw error;
        toast.success("Annonce créée avec succès");
      }

      setDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({ titre: "", contenu: "", date_evenement: "", image_url: "" });
      loadAnnouncements();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      titre: announcement.titre,
      contenu: announcement.contenu,
      date_evenement: announcement.date_evenement ? new Date(announcement.date_evenement).toISOString().slice(0, 16) : "",
      image_url: announcement.image_url || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;

      toast.success("Annonce supprimée");
      loadAnnouncements();
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
              Annonces
            </h1>
            <p className="text-muted-foreground mt-1">
              Informations et événements de l'église
            </p>
          </div>

          {canManage && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingAnnouncement(null);
                setFormData({ titre: "", contenu: "", date_evenement: "", image_url: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle annonce
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAnnouncement ? "Modifier l'annonce" : "Créer une annonce"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      required
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="contenu">Contenu *</Label>
                    <Textarea
                      id="contenu"
                      required
                      rows={5}
                      value={formData.contenu}
                      onChange={(e) =>
                        setFormData({ ...formData, contenu: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_evenement">Date de l'événement</Label>
                    <Input
                      id="date_evenement"
                      type="datetime-local"
                      value={formData.date_evenement}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_evenement: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Image (optionnelle)</Label>
                    <div className="space-y-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Upload en cours..." : (editingAnnouncement ? "Enregistrer" : "Créer l'annonce")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : announcements.length === 0 ? (
          <Card className="shadow-gentle">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucune annonce pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="shadow-gentle hover:shadow-elegant transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {announcement.titre}
                      </CardTitle>
                      {announcement.date_evenement && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(announcement.date_evenement).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {announcement.image_url && (
                    <img 
                      src={announcement.image_url} 
                      alt={announcement.titre}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {announcement.contenu}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Publié le{" "}
                    {new Date(announcement.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Announcements;

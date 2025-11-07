import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { announcementSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    type: "annonce",
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

      // Validate input with Zod
      const validated = announcementSchema.parse({
        titre: formData.titre,
        contenu: formData.contenu,
        type: formData.type,
        image_url: formData.image_url || "",
      });

      const announcementData = {
        titre: validated.titre,
        contenu: validated.contenu,
        type: validated.type,
        image_url: validated.image_url || null,
        date_evenement: formData.date_evenement || null,
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
        const { error } = await supabase.from("announcements").insert([announcementData]);
        if (error) throw error;
        toast.success("Annonce créée avec succès");
      }

      setDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({ titre: "", contenu: "", date_evenement: "", image_url: "", type: "annonce" });
      loadAnnouncements();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
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
      type: announcement.type || "annonce",
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
  const announcesOnly = announcements.filter(a => !a.type || a.type === 'annonce');
  const cultesOnly = announcements.filter(a => a.type === 'culte');
  const eventsOnly = announcements.filter(a => a.type === 'evenement');

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Annonces, Événements et Cultes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les annonces, événements et programmes de culte
            </p>
          </div>

          {canManage && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingAnnouncement(null);
                setFormData({ titre: "", contenu: "", date_evenement: "", image_url: "", type: "annonce" });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="premium">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? "Modifier" : "Nouveau"} {formData.type === 'culte' ? 'programme de culte' : formData.type === 'evenement' ? 'événement' : 'annonce'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annonce">Annonce</SelectItem>
                        <SelectItem value="evenement">Événement</SelectItem>
                        <SelectItem value="culte">Programme de culte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      required
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                      placeholder={formData.type === 'culte' ? "Ex: Culte du dimanche" : "Titre de l'annonce"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contenu">{formData.type === 'culte' ? 'Programme / Description *' : 'Contenu *'}</Label>
                    <Textarea
                      id="contenu"
                      required
                      rows={5}
                      value={formData.contenu}
                      onChange={(e) =>
                        setFormData({ ...formData, contenu: e.target.value })
                      }
                      placeholder={formData.type === 'culte' ? "Détails du programme de culte" : "Description de l'annonce"}
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
                  <Button type="submit" variant="premium" className="w-full" disabled={uploading}>
                    {uploading ? "Upload en cours..." : (editingAnnouncement ? "Enregistrer" : "Créer l'annonce")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : (
          <Tabs defaultValue="annonces" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="annonces">Annonces ({announcesOnly.length})</TabsTrigger>
              <TabsTrigger value="evenements">Événements ({eventsOnly.length})</TabsTrigger>
              <TabsTrigger value="cultes">Programmes de culte ({cultesOnly.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="annonces" className="space-y-4">
              {announcesOnly.length === 0 ? (
                <Card className="shadow-gentle">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucune annonce pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                announcesOnly.map((announcement) => (
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
                        <div className="overflow-hidden rounded-lg mb-4">
                          <img 
                            src={announcement.image_url} 
                            alt={announcement.titre}
                            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                          />
                        </div>
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
                ))
              )}
            </TabsContent>

            <TabsContent value="evenements" className="space-y-4">
              {eventsOnly.length === 0 ? (
                <Card className="shadow-gentle">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucun événement pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                eventsOnly.map((event) => (
                  <Card key={event.id} className="shadow-gentle hover:shadow-elegant transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {event.titre}
                          </CardTitle>
                          {event.date_evenement && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date_evenement).toLocaleDateString(
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
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {event.image_url && (
                        <div className="overflow-hidden rounded-lg mb-4">
                          <img 
                            src={event.image_url} 
                            alt={event.titre}
                            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                          />
                        </div>
                      )}
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {event.contenu}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Publié le{" "}
                        {new Date(event.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="cultes" className="space-y-4">
              {cultesOnly.length === 0 ? (
                <Card className="shadow-gentle">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucun programme de culte pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                cultesOnly.map((culte) => (
                  <Card key={culte.id} className="shadow-gentle hover:shadow-elegant transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {culte.titre}
                          </CardTitle>
                          {culte.date_evenement && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(culte.date_evenement).toLocaleDateString(
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
                              onClick={() => handleEdit(culte)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(culte.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {culte.image_url && (
                        <div className="overflow-hidden rounded-lg mb-4">
                          <img 
                            src={culte.image_url} 
                            alt={culte.titre}
                            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                          />
                        </div>
                      )}
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {culte.contenu}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Publié le{" "}
                        {new Date(culte.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Announcements;

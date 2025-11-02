import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Church as ChurchIcon, Save, Copy, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const Church = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [churchId, setChurchId] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    nom: "",
    code_eglise: "",
    description: "",
    adresse: "",
    contact: "",
    email: "",
    site_web: "",
    facebook: "",
    whatsapp: "",
    verset_clef: "",
  });

  useEffect(() => {
    loadChurchInfo();
  }, []);

  const loadChurchInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) return;

      setChurchId(roleData.church_id);

      const { data: churchData, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", roleData.church_id)
        .single();

      if (error) throw error;

      if (churchData) {
        setFormData({
          nom: churchData.nom || "",
          code_eglise: churchData.code_eglise || "",
          description: churchData.description || "",
          adresse: churchData.adresse || "",
          contact: churchData.contact || "",
          email: churchData.email || "",
          site_web: churchData.site_web || "",
          facebook: churchData.facebook || "",
          whatsapp: churchData.whatsapp || "",
          verset_clef: churchData.verset_clef || "",
        });
        setLogoUrl(churchData.logo_url || "");
        setCoverUrl(churchData.couverture_url || "");
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("churches")
        .update({
          nom: formData.nom,
          description: formData.description,
          adresse: formData.adresse,
          contact: formData.contact,
          email: formData.email,
          site_web: formData.site_web,
          facebook: formData.facebook,
          whatsapp: formData.whatsapp,
          verset_clef: formData.verset_clef,
        })
        .eq("id", churchId);

      if (error) throw error;

      toast.success("Informations mises à jour");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(formData.code_eglise);
    toast.success("Code copié !");
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!churchId) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${churchId}/${Date.now()}.${fileExt}`;
      const bucket = type === 'logo' ? 'church-logos' : 'church-covers';

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Update church record
      const updateField = type === 'logo' ? 'logo_url' : 'couverture_url';
      const { error: updateError } = await supabase
        .from('churches')
        .update({ [updateField]: publicUrl })
        .eq('id', churchId);

      if (updateError) throw updateError;

      if (type === 'logo') {
        setLogoUrl(publicUrl);
      } else {
        setCoverUrl(publicUrl);
      }

      toast.success(type === 'logo' ? 'Logo mis à jour' : 'Photo de couverture mise à jour');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChurch = async () => {
    if (!churchId) return;

    try {
      const { error } = await supabase
        .from('churches')
        .delete()
        .eq('id', churchId);

      if (error) throw error;

      toast.success("Église supprimée");
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <ChurchIcon className="h-8 w-8 text-primary" />
            Paramètres de l'Église
          </h1>
          <p className="text-muted-foreground mt-1">
            Personnalisez et gérez les informations de votre église
          </p>
        </div>

        {/* Cover and Logo Section */}
        <Card className="shadow-soft overflow-hidden">
          <div className="relative h-48 bg-gradient-blessing">
            {coverUrl ? (
              <img src={coverUrl} alt="Couverture" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            <label className="absolute bottom-4 right-4 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'cover');
                }}
                disabled={uploading}
              />
              <Button size="sm" variant="secondary" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Photo de couverture
                </span>
              </Button>
            </label>
          </div>
          <CardContent className="pt-16 relative">
            <div className="absolute -top-16 left-8">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ChurchIcon className="h-16 w-16 text-muted-foreground/50" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                    disabled={uploading}
                  />
                  <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-gentle">
          <CardHeader>
            <CardTitle>Code d'église</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={formData.code_eglise}
                readOnly
                className="font-mono font-bold text-primary"
              />
              <Button variant="outline" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Partagez ce code avec les membres pour qu'ils rejoignent votre église
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'église *</Label>
                <Input
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="verset_clef">Verset clé</Label>
                <Input
                  id="verset_clef"
                  placeholder="Ex: Jean 3:16"
                  value={formData.verset_clef}
                  onChange={(e) =>
                    setFormData({ ...formData, verset_clef: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) =>
                    setFormData({ ...formData, adresse: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact">Téléphone</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site_web">Site web</Label>
                <Input
                  id="site_web"
                  type="url"
                  placeholder="https://"
                  value={formData.site_web}
                  onChange={(e) =>
                    setFormData({ ...formData, site_web: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="URL Facebook"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="Numéro WhatsApp"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="premium" className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Danger Zone */}
        <Card className="shadow-soft border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de l'église est irréversible. Toutes les données associées seront perdues.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon église
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Cela supprimera définitivement votre église
                    et toutes les données associées (membres, annonces, prières, dons).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChurch}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Church;

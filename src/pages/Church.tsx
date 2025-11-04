import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { churchSchema } from "@/lib/validation-schemas";
import { z } from "zod";
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
    instagram: "",
    whatsapp: "",
    verset_clef: "",
    subdomain: "",
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
          instagram: "",
          whatsapp: churchData.whatsapp || "",
          verset_clef: churchData.verset_clef || "",
          subdomain: "",
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
      // Validate input with Zod
      const validated = churchSchema.parse({
        nom: formData.nom,
        description: formData.description || "",
        email: formData.email || "",
        contact: formData.contact || "",
        site_web: formData.site_web || "",
        adresse: formData.adresse || "",
        whatsapp: formData.whatsapp || "",
        facebook: formData.facebook || "",
        verset_clef: formData.verset_clef || "",
      });

      const { error } = await supabase
        .from("churches")
        .update(validated)
        .eq("id", churchId);

      if (error) throw error;

      toast.success("Informations mises à jour");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
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
      <AdminDashboardLayout>
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--text-dark))] flex items-center gap-3">
            <div className="h-12 w-12 rounded-[10px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-3d">
              <ChurchIcon className="h-6 w-6 text-white" />
            </div>
            Identité de l'Église
          </h1>
          <p className="text-[hsl(var(--text-dark))]/70 mt-2 ml-15">
            Personnalisez et gérez les informations de votre église
          </p>
        </div>

        {/* Cover and Logo Section */}
        <Card className="shadow-3d overflow-hidden rounded-[10px] border-none">
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
              <Button size="sm" className="rounded-[10px] shadow-3d bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 text-[hsl(var(--sidebar-background))]" asChild>
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
                  <Button size="icon" className="rounded-full h-10 w-10 shadow-3d bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 text-[hsl(var(--sidebar-background))]" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-3d rounded-[10px] border-none bg-gradient-to-br from-[hsl(var(--primary))]/5 to-[hsl(var(--secondary))]/5">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--text-dark))]">Code d'église unique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={formData.code_eglise}
                readOnly
                className="font-mono font-bold text-[hsl(var(--primary))] text-lg rounded-[10px] border-[hsl(var(--primary))]/30"
              />
              <Button onClick={copyCode} className="rounded-[10px] shadow-3d bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 text-[hsl(var(--sidebar-background))]">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-[hsl(var(--text-dark))]/60 mt-3">
              ✨ Partagez ce code avec les membres pour qu'ils rejoignent votre communauté
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-3d rounded-[10px] border-none">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--text-dark))] text-xl">📋 Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="nom" className="text-[hsl(var(--text-dark))]">Nom de l'église *</Label>
                <Input
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[hsl(var(--text-dark))]">Description spirituelle / Mission</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez la mission et la vision de votre église..."
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div>
                <Label htmlFor="verset_clef" className="text-[hsl(var(--text-dark))]">📖 Verset clé ou Devise</Label>
                <Input
                  id="verset_clef"
                  placeholder="Ex: Jean 3:16 - Car Dieu a tant aimé le monde..."
                  value={formData.verset_clef}
                  onChange={(e) =>
                    setFormData({ ...formData, verset_clef: e.target.value })
                  }
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div>
                <Label htmlFor="adresse" className="text-[hsl(var(--text-dark))]">📍 Adresse complète</Label>
                <Input
                  id="adresse"
                  placeholder="Adresse, ville, pays"
                  value={formData.adresse}
                  onChange={(e) =>
                    setFormData({ ...formData, adresse: e.target.value })
                  }
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact" className="text-[hsl(var(--text-dark))]">📞 Téléphone</Label>
                  <Input
                    id="contact"
                    placeholder="+225 XX XX XX XX XX"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-[hsl(var(--text-dark))]">💬 WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+225 XX XX XX XX XX"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-[hsl(var(--text-dark))]">✉️ Email officiel</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@eglise.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div>
                <Label htmlFor="site_web" className="text-[hsl(var(--text-dark))]">🌐 Site web</Label>
                <Input
                  id="site_web"
                  type="url"
                  placeholder="https://votreeglise.com"
                  value={formData.site_web}
                  onChange={(e) =>
                    setFormData({ ...formData, site_web: e.target.value })
                  }
                  className="rounded-[10px] border-[hsl(var(--primary))]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facebook" className="text-[hsl(var(--text-dark))]">📘 Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram" className="text-[hsl(var(--text-dark))]">📷 Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube" className="text-[hsl(var(--text-dark))]">📺 YouTube</Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/..."
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subdomain" className="text-[hsl(var(--text-dark))]">🌍 Sous-domaine personnalisé</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="subdomain"
                    placeholder="votreeglise"
                    value={formData.subdomain}
                    onChange={(e) =>
                      setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                    }
                    className="rounded-[10px] border-[hsl(var(--primary))]/20"
                  />
                  <span className="text-[hsl(var(--text-dark))]/60 text-sm whitespace-nowrap">.egliconnect.app</span>
                </div>
                <p className="text-sm text-[hsl(var(--text-dark))]/60 mt-2">
                  Ex: templeroyaume.egliconnect.app
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full rounded-[10px] shadow-3d bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white h-12 text-base font-semibold">
                  <Save className="mr-2 h-5 w-5" />
                  💾 Enregistrer les modifications
                </Button>
                <p className="text-sm text-[hsl(var(--secondary))] text-center mt-3">
                  🔄 Sauvegarde automatique activée
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Danger Zone */}
        <Card className="shadow-3d border-destructive/50 rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              ⚠️ Zone dangereuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de l'église est irréversible. Toutes les données associées seront perdues définitivement.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full rounded-[10px]">
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
    </AdminDashboardLayout>
  );
};

export default Church;

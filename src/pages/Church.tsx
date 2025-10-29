import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Church as ChurchIcon, Save, Copy } from "lucide-react";
import { toast } from "sonner";

const Church = () => {
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");
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
            Mon Église
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations de votre église
          </p>
        </div>

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

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Church;

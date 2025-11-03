import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, User, Lock } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
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
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <Card className="shadow-gentle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom complet</Label>
              <Input
                value={user?.user_metadata?.nom_complet || "Non défini"}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Compte créé le</Label>
              <Input
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR")
                    : ""
                }
                readOnly
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handlePasswordChange}>
          <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};

export default Settings;

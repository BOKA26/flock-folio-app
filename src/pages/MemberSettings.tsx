import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Lock, Download, LogOut, Trash2, AlertTriangle } from "lucide-react";
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

const MemberSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

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

  const handleDownloadData = () => {
    toast.info("Téléchargement de vos données à venir");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/auth");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleDeleteAccount = async () => {
    toast.info("Suppression du compte à venir - Cette fonctionnalité nécessite une confirmation administrative");
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
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Mon Compte
        </h1>

        {/* Account Info */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Informations du Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ""
                }
                readOnly
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le Mot de Passe
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

        {/* Data Management */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Gestion des Données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Télécharger mes données</p>
                <p className="text-sm text-muted-foreground">
                  Obtenez une copie de toutes vos données (dons, prières, participations)
                </p>
              </div>
              <Button onClick={handleDownloadData} variant="outline">
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Actions du Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Êtes-vous absolument sûr ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données (dons, prières, participations) 
                    seront définitivement supprimées. Cette demande nécessite une validation administrative.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Sécurité de votre compte</p>
                <p className="text-sm text-muted-foreground">
                  Vos données sont protégées et sécurisées. Nous ne partageons jamais vos informations 
                  personnelles avec des tiers. Utilisez un mot de passe fort et unique pour votre compte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberSettings;

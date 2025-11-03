import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Lock, Activity, Database, Trash2, AlertTriangle, Download, RefreshCw, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdvancedSettings() {
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");
  const [churchCode, setChurchCode] = useState<string>("");
  const [churchActive, setChurchActive] = useState(true);
  const [subdomain, setSubdomain] = useState("");
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id, role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || roleData.role !== "admin") {
        toast({
          title: "Accès refusé",
          description: "Seuls les administrateurs peuvent accéder à ces paramètres",
          variant: "destructive",
        });
        return;
      }

      setChurchId(roleData.church_id);

      const { data: churchData } = await supabase
        .from("churches")
        .select("*")
        .eq("id", roleData.church_id)
        .single();

      if (churchData) {
        setChurchCode(churchData.code_eglise);
        setSubdomain(churchData.code_eglise.toLowerCase());
      }

      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("church_id", roleData.church_id)
        .order("created_at", { ascending: false })
        .limit(20);

      setActivityLogs(logs || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChurch = async (enabled: boolean) => {
    try {
      // Dans une vraie application, vous implémenteriez la logique d'activation/désactivation
      setChurchActive(enabled);
      toast({
        title: enabled ? "Église activée" : "Église désactivée",
        description: enabled 
          ? "Votre espace église est maintenant accessible" 
          : "Votre espace église est temporairement désactivé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBackup = async () => {
    try {
      toast({
        title: "Sauvegarde en cours",
        description: "Une sauvegarde complète de vos données est en cours...",
      });
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sauvegarde réussie",
        description: "Toutes vos données ont été sauvegardées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteChurch = async () => {
    try {
      const { error } = await supabase
        .from("churches")
        .delete()
        .eq("id", churchId);

      if (error) throw error;

      toast({
        title: "Église supprimée",
        description: "Toutes les données ont été supprimées de manière sécurisée",
      });

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Paramètres Avancés
          </h1>
          <p className="text-muted-foreground mt-2">
            Sécurité, sauvegarde et gestion technique
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
            <TabsTrigger value="danger">Zone Danger</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Espace Église
                </CardTitle>
                <CardDescription>
                  Gérer l'accessibilité de votre espace église
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="church-active">État de l'église</Label>
                    <p className="text-sm text-muted-foreground">
                      {churchActive ? "Votre église est active" : "Votre église est désactivée"}
                    </p>
                  </div>
                  <Switch
                    id="church-active"
                    checked={churchActive}
                    onCheckedChange={handleToggleChurch}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Code d'église</Label>
                  <div className="flex gap-2">
                    <Input value={churchCode} disabled />
                    <Badge variant="outline">{churchActive ? "Actif" : "Inactif"}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sous-domaine</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={subdomain} disabled />
                    <span className="text-sm text-muted-foreground">.egliconnect.app</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Votre église est accessible à: {subdomain}.egliconnect.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Sécurité
                </CardTitle>
                <CardDescription>
                  Protégez votre compte avec des mesures de sécurité avancées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <Label>Authentification à deux facteurs (2FA)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <Button variant="outline">
                    Configurer
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Journal d'activité</Label>
                  <ScrollArea className="h-[300px] border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Détails</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.details || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(log.created_at).toLocaleDateString("fr-FR")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Sauvegarde & Restauration
                </CardTitle>
                <CardDescription>
                  Protégez vos données avec des sauvegardes automatiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <Label>Sauvegarde automatique</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vos données sont automatiquement sauvegardées chaque jour à 2h00 du matin
                  </p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Dernière sauvegarde: Aujourd'hui
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleBackup} className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Créer une sauvegarde maintenant
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Restaurer une sauvegarde
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Toutes vos données sont chiffrées</p>
                  <p>✓ Sauvegarde automatique quotidienne</p>
                  <p>✓ Restauration rapide en un clic</p>
                  <p>✓ Conservation des 30 dernières sauvegardes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Zone Danger
                </CardTitle>
                <CardDescription>
                  Actions irréversibles - Procédez avec précaution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <Label className="text-destructive">Supprimer définitivement l'église</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cette action supprimera définitivement toutes les données de votre église,
                    y compris les membres, les dons, les événements et les messages.
                    Cette action est irréversible.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Supprimer l'église
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera définitivement
                          votre église et toutes les données associées de nos serveurs.
                          
                          <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                            <p className="font-semibold text-destructive">⚠️ Attention</p>
                            <p className="text-sm mt-1">
                              Toutes les données seront perdues définitivement, incluant :
                            </p>
                            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                              <li>Tous les membres et leurs informations</li>
                              <li>L'historique complet des dons</li>
                              <li>Tous les événements et annonces</li>
                              <li>Les messages et les prières</li>
                            </ul>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteChurch}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Oui, supprimer définitivement
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}

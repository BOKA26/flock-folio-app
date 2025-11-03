import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HandHeart,
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  Calendar,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Ministry {
  id: string;
  nom: string;
  description: string | null;
  responsable_nom: string | null;
  nb_membres: number;
  prochaine_activite: string | null;
  date_prochaine_activite: string | null;
  created_at: string;
}

interface Mission {
  id: string;
  ministry_id: string;
  titre: string;
  description: string | null;
  date_mission: string;
  statut: string;
}

const Ministries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    responsable_nom: "",
    prochaine_activite: "",
    date_prochaine_activite: "",
  });

  const [missionData, setMissionData] = useState({
    titre: "",
    description: "",
    date_mission: "",
    ministry_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Non authentifié");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) return;
      setChurchId(roleData.church_id);

      await loadMinistries(roleData.church_id);
      await loadMissions(roleData.church_id);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadMinistries = async (churchId: string) => {
    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .eq("church_id", churchId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des ministères");
      return;
    }

    setMinistries(data || []);
  };

  const loadMissions = async (churchId: string) => {
    const { data, error } = await supabase
      .from("ministry_missions")
      .select("*")
      .eq("church_id", churchId)
      .order("date_mission", { ascending: false });

    if (error) {
      console.error("Erreur missions:", error);
      return;
    }

    setMissions(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMinistry) {
        const { error } = await supabase
          .from("ministries")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMinistry.id);

        if (error) throw error;
        toast.success("Ministère modifié avec succès");
      } else {
        const { error } = await supabase.from("ministries").insert({
          ...formData,
          church_id: churchId,
        });

        if (error) throw error;
        toast.success("Ministère créé avec succès");
      }

      setDialogOpen(false);
      setEditingMinistry(null);
      resetForm();
      loadMinistries(churchId);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("ministry_missions").insert({
        ...missionData,
        church_id: churchId,
      });

      if (error) throw error;
      toast.success("Mission ajoutée avec succès");
      setMissionDialogOpen(false);
      setMissionData({ titre: "", description: "", date_mission: "", ministry_id: "" });
      loadMissions(churchId);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      nom: ministry.nom,
      description: ministry.description || "",
      responsable_nom: ministry.responsable_nom || "",
      prochaine_activite: ministry.prochaine_activite || "",
      date_prochaine_activite: ministry.date_prochaine_activite
        ? new Date(ministry.date_prochaine_activite).toISOString().split("T")[0]
        : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMinistry) return;

    try {
      const { error } = await supabase
        .from("ministries")
        .delete()
        .eq("id", selectedMinistry.id);

      if (error) throw error;

      toast.success("Ministère supprimé");
      setDeleteDialogOpen(false);
      setSelectedMinistry(null);
      loadMinistries(churchId);
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      responsable_nom: "",
      prochaine_activite: "",
      date_prochaine_activite: "",
    });
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      planifiée: { color: "bg-blue-500 text-white", label: "Planifiée" },
      "en-cours": { color: "bg-yellow-500 text-white", label: "En cours" },
      terminée: { color: "bg-green-500 text-white", label: "Terminée" },
    };
    const variant = variants[statut] || variants.planifiée;
    return <Badge className={`${variant.color} rounded-[10px]`}>{variant.label}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--text-dark))] flex items-center gap-3">
              <div className="h-12 w-12 rounded-[10px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-3d">
                <HandHeart className="h-6 w-6 text-white" />
              </div>
              Ministères et Équipes
            </h1>
            <p className="text-[hsl(var(--text-dark))]/70 mt-2 ml-15">
              Gérez les groupes et départements de votre église
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingMinistry(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-[10px] shadow-3d bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Créer un ministère
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[10px]">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--text-dark))]">
                  {editingMinistry ? "Modifier le ministère" : "Nouveau ministère"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nom" className="text-[hsl(var(--text-dark))]">
                    Nom du ministère *
                  </Label>
                  <Input
                    id="nom"
                    required
                    placeholder="Ex: Chorale, Jeunesse, Accueil..."
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="rounded-[10px]"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-[hsl(var(--text-dark))]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Décrivez la mission et les objectifs du ministère..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-[10px]"
                  />
                </div>

                <div>
                  <Label htmlFor="responsable_nom" className="text-[hsl(var(--text-dark))]">
                    Responsable
                  </Label>
                  <Input
                    id="responsable_nom"
                    placeholder="Nom du responsable"
                    value={formData.responsable_nom}
                    onChange={(e) => setFormData({ ...formData, responsable_nom: e.target.value })}
                    className="rounded-[10px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prochaine_activite" className="text-[hsl(var(--text-dark))]">
                      Prochaine activité
                    </Label>
                    <Input
                      id="prochaine_activite"
                      placeholder="Ex: Répétition, Réunion..."
                      value={formData.prochaine_activite}
                      onChange={(e) => setFormData({ ...formData, prochaine_activite: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_prochaine_activite" className="text-[hsl(var(--text-dark))]">
                      Date
                    </Label>
                    <Input
                      id="date_prochaine_activite"
                      type="date"
                      value={formData.date_prochaine_activite}
                      onChange={(e) =>
                        setFormData({ ...formData, date_prochaine_activite: e.target.value })
                      }
                      className="rounded-[10px]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-[10px]"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                  >
                    {editingMinistry ? "Enregistrer" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ministères</p>
                  <p className="text-3xl font-bold text-[hsl(var(--text-dark))]">{ministries.length}</p>
                </div>
                <HandHeart className="h-10 w-10 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missions planifiées</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {missions.filter((m) => m.statut === "planifiée").length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missions réalisées</p>
                  <p className="text-3xl font-bold text-green-600">
                    {missions.filter((m) => m.statut === "terminée").length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ministeres" className="space-y-6">
          <TabsList className="bg-white shadow-3d rounded-[10px] p-1">
            <TabsTrigger
              value="ministeres"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <HandHeart className="mr-2 h-4 w-4" />
              Ministères
            </TabsTrigger>
            <TabsTrigger
              value="missions"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <Award className="mr-2 h-4 w-4" />
              Historique des missions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ministeres" className="space-y-6">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">
                  📋 Liste des ministères ({ministries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ministries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun ministère créé. Commencez par créer votre premier ministère.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[hsl(var(--text-dark))]">Ministère</TableHead>
                        <TableHead className="text-[hsl(var(--text-dark))]">Responsable</TableHead>
                        <TableHead className="text-[hsl(var(--text-dark))]">Membres</TableHead>
                        <TableHead className="text-[hsl(var(--text-dark))]">Prochaine activité</TableHead>
                        <TableHead className="text-right text-[hsl(var(--text-dark))]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ministries.map((ministry) => (
                        <TableRow key={ministry.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">{ministry.nom}</p>
                              {ministry.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {ministry.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{ministry.responsable_nom || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(var(--primary))] text-white rounded-[10px]">
                              {ministry.nb_membres} membres
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ministry.prochaine_activite ? (
                              <div className="text-sm">
                                <p className="font-medium">{ministry.prochaine_activite}</p>
                                {ministry.date_prochaine_activite && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(ministry.date_prochaine_activite).toLocaleDateString("fr-FR")}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-[8px]"
                                onClick={() => handleEdit(ministry)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-[8px] text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedMinistry(ministry);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-[10px] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une mission
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[10px]">
                  <DialogHeader>
                    <DialogTitle className="text-[hsl(var(--text-dark))]">Nouvelle mission</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleMissionSubmit} className="space-y-4">
                    <div>
                      <Label className="text-[hsl(var(--text-dark))]">Ministère *</Label>
                      <select
                        required
                        value={missionData.ministry_id}
                        onChange={(e) => setMissionData({ ...missionData, ministry_id: e.target.value })}
                        className="w-full rounded-[10px] border border-input bg-background px-3 py-2"
                      >
                        <option value="">Sélectionner un ministère</option>
                        {ministries.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[hsl(var(--text-dark))]">Titre *</Label>
                      <Input
                        required
                        value={missionData.titre}
                        onChange={(e) => setMissionData({ ...missionData, titre: e.target.value })}
                        className="rounded-[10px]"
                      />
                    </div>
                    <div>
                      <Label className="text-[hsl(var(--text-dark))]">Description</Label>
                      <Textarea
                        rows={3}
                        value={missionData.description}
                        onChange={(e) => setMissionData({ ...missionData, description: e.target.value })}
                        className="rounded-[10px]"
                      />
                    </div>
                    <div>
                      <Label className="text-[hsl(var(--text-dark))]">Date *</Label>
                      <Input
                        required
                        type="date"
                        value={missionData.date_mission}
                        onChange={(e) => setMissionData({ ...missionData, date_mission: e.target.value })}
                        className="rounded-[10px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMissionDialogOpen(false)}
                        className="rounded-[10px]"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                      >
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">
                  🏆 Historique des missions accomplies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missions.map((mission) => {
                    const ministry = ministries.find((m) => m.id === mission.ministry_id);
                    return (
                      <div
                        key={mission.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-[10px] border border-gray-200"
                      >
                        <Award className="h-6 w-6 text-[hsl(var(--secondary))] mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-[hsl(var(--text-dark))]">{mission.titre}</p>
                            {getStatutBadge(mission.statut)}
                          </div>
                          {mission.description && (
                            <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <HandHeart className="h-3 w-3" />
                              {ministry?.nom || "Ministère inconnu"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(mission.date_mission).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {missions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune mission enregistrée pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AlertDialog Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement ce ministère et toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[10px]"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminDashboardLayout>
  );
};

export default Ministries;
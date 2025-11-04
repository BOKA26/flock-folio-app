import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { memberSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Trash2,
  Edit,
  Eye,
  Download,
  Filter,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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

interface Member {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  sexe: string | null;
  date_naissance: string | null;
  statut: string;
  groupe_departement: string | null;
  date_adhesion: string;
  created_at: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sexeFilter, setSexeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "",
    date_naissance: "",
    statut: "nouveau",
    groupe_departement: "",
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
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

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("church_id", roleData.church_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input with Zod
      const validated = memberSchema.parse(formData);

      if (editingMember) {
        const { error } = await supabase
          .from("members")
          .update({
            nom: validated.nom,
            prenom: validated.prenom,
            email: validated.email || null,
            telephone: validated.telephone || null,
            sexe: validated.sexe || null,
            date_naissance: formData.date_naissance || null,
            statut: formData.statut,
            groupe_departement: formData.groupe_departement || null,
          })
          .eq("id", editingMember.id);

        if (error) throw error;
        toast.success("Membre modifié avec succès");
      } else {
        const { error } = await supabase.from("members").insert([{
          nom: validated.nom,
          prenom: validated.prenom,
          email: validated.email || null,
          telephone: validated.telephone || null,
          sexe: validated.sexe || null,
          date_naissance: formData.date_naissance || null,
          statut: formData.statut,
          groupe_departement: formData.groupe_departement || null,
          church_id: churchId,
        }]);

        if (error) throw error;
        toast.success("Membre ajouté avec succès");
      }

      setDialogOpen(false);
      setEditingMember(null);
      resetForm();
      loadMembers();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      nom: member.nom,
      prenom: member.prenom,
      email: member.email || "",
      telephone: member.telephone || "",
      sexe: member.sexe || "",
      date_naissance: member.date_naissance || "",
      statut: member.statut,
      groupe_departement: member.groupe_departement || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) throw error;

      toast.success("Membre supprimé");
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      sexe: "",
      date_naissance: "",
      statut: "nouveau",
      groupe_departement: "",
    });
  };

  const exportToCSV = () => {
    const headers = ["Nom", "Prénom", "Email", "Téléphone", "Sexe", "Statut", "Date d'adhésion"];
    const csvContent = [
      headers.join(","),
      ...filteredMembers.map((m) =>
        [
          m.nom,
          m.prenom,
          m.email || "",
          m.telephone || "",
          m.sexe === "M" ? "Homme" : m.sexe === "F" ? "Femme" : "",
          m.statut,
          new Date(m.date_adhesion).toLocaleDateString("fr-FR"),
        ].join(",")
      ),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `membres_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export CSV réussi");
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = `${member.nom} ${member.prenom} ${member.email || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.statut === statusFilter;
    const matchesSexe = sexeFilter === "all" || member.sexe === sexeFilter;
    return matchesSearch && matchesStatus && matchesSexe;
  });

  // Statistiques
  const stats = {
    total: members.length,
    hommes: members.filter((m) => m.sexe === "M").length,
    femmes: members.filter((m) => m.sexe === "F").length,
    nouveaux: members.filter((m) => m.statut === "nouveau").length,
    actifs: members.filter((m) => m.statut === "actif").length,
  };

  const sexeData = [
    { name: "Hommes", value: stats.hommes, color: "#1E90FF" },
    { name: "Femmes", value: stats.femmes, color: "#D4AF37" },
  ];

  const statutData = [
    { name: "Nouveaux", value: stats.nouveaux, color: "#22c55e" },
    { name: "Actifs", value: stats.actifs, color: "#3b82f6" },
    { name: "Anciens", value: members.filter((m) => m.statut === "ancien").length, color: "#94a3b8" },
  ];

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      nouveau: { color: "bg-green-500 text-white", label: "Nouveau" },
      actif: { color: "bg-[hsl(var(--primary))] text-white", label: "Actif" },
      ancien: { color: "bg-gray-500 text-white", label: "Ancien" },
    };
    const variant = variants[statut] || variants.nouveau;
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
                <Users className="h-6 w-6 text-white" />
              </div>
              Fidèles et Participation
            </h1>
            <p className="text-[hsl(var(--text-dark))]/70 mt-2 ml-15">
              Gérez les membres de votre communauté
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingMember(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-[10px] shadow-3d bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un fidèle
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[10px] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--text-dark))]">
                  {editingMember ? "Modifier le fidèle" : "Nouveau fidèle"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom" className="text-[hsl(var(--text-dark))]">
                      Nom *
                    </Label>
                    <Input
                      id="nom"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prenom" className="text-[hsl(var(--text-dark))]">
                      Prénom *
                    </Label>
                    <Input
                      id="prenom"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sexe" className="text-[hsl(var(--text-dark))]">
                      Sexe
                    </Label>
                    <Select value={formData.sexe} onValueChange={(value) => setFormData({ ...formData, sexe: value })}>
                      <SelectTrigger className="rounded-[10px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Homme</SelectItem>
                        <SelectItem value="F">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_naissance" className="text-[hsl(var(--text-dark))]">
                      Date de naissance
                    </Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-[hsl(var(--text-dark))]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone" className="text-[hsl(var(--text-dark))]">
                      Téléphone
                    </Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statut" className="text-[hsl(var(--text-dark))]">
                      Statut
                    </Label>
                    <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                      <SelectTrigger className="rounded-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nouveau">Nouveau</SelectItem>
                        <SelectItem value="actif">Membre actif</SelectItem>
                        <SelectItem value="ancien">Ancien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="groupe_departement" className="text-[hsl(var(--text-dark))]">
                      Groupe / Département
                    </Label>
                    <Input
                      id="groupe_departement"
                      placeholder="Ex: Chorale, Jeunesse..."
                      value={formData.groupe_departement}
                      onChange={(e) => setFormData({ ...formData, groupe_departement: e.target.value })}
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
                    {editingMember ? "Enregistrer" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fidèles</p>
                  <p className="text-3xl font-bold text-[hsl(var(--text-dark))]">{stats.total}</p>
                </div>
                <Users className="h-10 w-10 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux</p>
                  <p className="text-3xl font-bold text-green-600">{stats.nouveaux}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Membres Actifs</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">{stats.actifs}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-[hsl(var(--primary))]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d rounded-[10px] border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hommes / Femmes</p>
                  <p className="text-3xl font-bold text-[hsl(var(--secondary))]">
                    {stats.hommes} / {stats.femmes}
                  </p>
                </div>
                <Award className="h-10 w-10 text-[hsl(var(--secondary))]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="liste" className="space-y-6">
          <TabsList className="bg-white shadow-3d rounded-[10px] p-1">
            <TabsTrigger
              value="liste"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Liste des fidèles
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="space-y-4">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un fidèle..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-[10px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] rounded-[10px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="nouveau">Nouveaux</SelectItem>
                      <SelectItem value="actif">Actifs</SelectItem>
                      <SelectItem value="ancien">Anciens</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sexeFilter} onValueChange={setSexeFilter}>
                    <SelectTrigger className="w-[180px] rounded-[10px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="M">Hommes</SelectItem>
                      <SelectItem value="F">Femmes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportToCSV} variant="outline" className="rounded-[10px]">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun fidèle trouvé</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[hsl(var(--text-dark))]">Nom complet</TableHead>
                          <TableHead className="text-[hsl(var(--text-dark))]">Contact</TableHead>
                          <TableHead className="text-[hsl(var(--text-dark))]">Statut</TableHead>
                          <TableHead className="text-[hsl(var(--text-dark))]">Département</TableHead>
                          <TableHead className="text-[hsl(var(--text-dark))]">Date d'adhésion</TableHead>
                          <TableHead className="text-right text-[hsl(var(--text-dark))]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.nom} {member.prenom}
                              {member.sexe && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({member.sexe === "M" ? "H" : "F"})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                {member.email && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {member.email}
                                  </div>
                                )}
                                {member.telephone && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {member.telephone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatutBadge(member.statut)}</TableCell>
                            <TableCell>
                              <span className="text-sm">{member.groupe_departement || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{new Date(member.date_adhesion).toLocaleDateString("fr-FR")}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-[8px]"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setProfileDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-[8px]"
                                  onClick={() => handleEdit(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-[8px] text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedMember(member);
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-3d rounded-[10px] border-none">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--text-dark))]">Répartition par sexe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sexeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sexeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-3d rounded-[10px] border-none">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--text-dark))]">Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statutData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Profile Details */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="rounded-[10px] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--text-dark))]">
              Profil de {selectedMember?.prenom} {selectedMember?.nom}
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Nom complet</Label>
                  <p className="text-sm font-medium">
                    {selectedMember.nom} {selectedMember.prenom}
                  </p>
                </div>
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Sexe</Label>
                  <p className="text-sm">{selectedMember.sexe === "M" ? "Homme" : selectedMember.sexe === "F" ? "Femme" : "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Email</Label>
                  <p className="text-sm">{selectedMember.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Téléphone</Label>
                  <p className="text-sm">{selectedMember.telephone || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Statut</Label>
                  <div className="mt-1">{getStatutBadge(selectedMember.statut)}</div>
                </div>
                <div>
                  <Label className="text-[hsl(var(--text-dark))]">Département</Label>
                  <p className="text-sm">{selectedMember.groupe_departement || "-"}</p>
                </div>
              </div>
              <div>
                <Label className="text-[hsl(var(--text-dark))]">Date d'adhésion</Label>
                <p className="text-sm">{new Date(selectedMember.date_adhesion).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-[hsl(var(--text-dark))] mb-2">📊 Suivi des présences</h4>
                <p className="text-sm text-muted-foreground">Fonctionnalité à venir...</p>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-[hsl(var(--text-dark))] mb-2">🙏 Historique spirituel</h4>
                <p className="text-sm text-muted-foreground">
                  (Baptême, Mariage, Ministère) - Fonctionnalité à venir...
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog Delete Member */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement ce fidèle de votre base de données. Cette action est irréversible.
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

export default Members;
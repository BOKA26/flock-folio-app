import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  KeyRound,
  Activity,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

const Teams = () => {
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "fidele" as "admin" | "operateur" | "fidele",
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

      // Charger les utilisateurs
      await loadUsers(roleData.church_id);
      
      // Charger l'historique d'activité
      await loadActivityLogs(roleData.church_id);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (churchId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("church_id", churchId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      return;
    }

    setUserRoles(data || []);
  };

  const loadActivityLogs = async (churchId: string) => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("church_id", churchId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erreur logs:", error);
      return;
    }

    setActivityLogs(data || []);
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.fullName) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      // Appeler l'Edge Function pour inviter l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://tyzcwcdqntxudqjftzsz.supabase.co/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            role: formData.role,
            churchId: churchId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Gestion spécifique des erreurs
        let errorMessage = result.error || "Erreur lors de l'invitation";
        
        // Si l'erreur contient "already been registered"
        if (errorMessage.includes("already been registered") || errorMessage.includes("email_exists")) {
          errorMessage = `Cet email (${formData.email}) est déjà enregistré. L'utilisateur a peut-être déjà un compte. Essayez de le rechercher dans la liste ou utilisez un autre email.`;
        }
        
        throw new Error(errorMessage);
      }

      toast.success("Invitation envoyée par email");
      setOpenAddDialog(false);
      setFormData({ email: "", fullName: "", role: "fidele" });
      await loadUsers(churchId);
      
      // Log l'activité
      await logActivity("invitation_sent", `Invitation envoyée à ${formData.email}`);
    } catch (error: any) {
      console.error("Erreur invitation:", error);
      toast.error(error.message || "Erreur lors de l'invitation");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: formData.role })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Rôle mis à jour");
      setOpenEditDialog(false);
      await loadUsers(churchId);
      
      // Log l'activité
      await logActivity("role_updated", `Rôle mis à jour pour l'utilisateur ${selectedUser.user_id}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Utilisateur supprimé");
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      await loadUsers(churchId);
      
      // Log l'activité
      await logActivity("user_removed", `Utilisateur ${selectedUser.user_id} supprimé`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success("Email de réinitialisation envoyé");
      
      // Log l'activité
      await logActivity("password_reset_sent", `Réinitialisation envoyée à ${email}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi");
    }
  };

  const logActivity = async (action: string, details: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      church_id: churchId,
      action,
      details,
    });

    // Recharger les logs
    await loadActivityLogs(churchId);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      admin: { color: "bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar-background))]", label: "Admin" },
      operateur: { color: "bg-[hsl(var(--primary))] text-white", label: "Opérateur" },
      fidele: { color: "bg-gray-500 text-white", label: "Fidèle" },
    };

    const variant = variants[role] || variants.fidele;
    return (
      <Badge className={`${variant.color} rounded-[10px]`}>
        {variant.label}
      </Badge>
    );
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
              Équipe et Accès
            </h1>
            <p className="text-[hsl(var(--text-dark))]/70 mt-2 ml-15">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>

          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-[10px] shadow-3d bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--primary))]/90 hover:to-[hsl(var(--secondary))]/90 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Inviter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[10px]">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--text-dark))]">Inviter un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  L'utilisateur recevra un email d'invitation pour rejoindre votre église
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="fullName" className="text-[hsl(var(--text-dark))]">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Jean Dupont"
                    className="rounded-[10px]"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[hsl(var(--text-dark))]">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@exemple.com"
                    className="rounded-[10px]"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-[hsl(var(--text-dark))]">Rôle *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "operateur" | "fidele" })}>
                    <SelectTrigger className="rounded-[10px]">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operateur">Opérateur</SelectItem>
                      <SelectItem value="fidele">Fidèle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)} className="rounded-[10px]">
                  Annuler
                </Button>
                <Button onClick={handleAddUser} className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white shadow-3d rounded-[10px] p-1">
            <TabsTrigger value="users" className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">
              <Activity className="mr-2 h-4 w-4" />
              Historique d'activité
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-[8px] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">
              <Shield className="mr-2 h-4 w-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">
                  👥 Liste des utilisateurs ({userRoles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[hsl(var(--text-dark))]">Nom</TableHead>
                      <TableHead className="text-[hsl(var(--text-dark))]">Email</TableHead>
                      <TableHead className="text-[hsl(var(--text-dark))]">Rôle</TableHead>
                      <TableHead className="text-[hsl(var(--text-dark))]">Statut</TableHead>
                      <TableHead className="text-[hsl(var(--text-dark))]">Ajouté le</TableHead>
                      <TableHead className="text-right text-[hsl(var(--text-dark))]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((userRole: any) => (
                      <TableRow key={userRole.id}>
                        <TableCell className="font-medium">
                          {userRole.full_name || userRole.user_id.substring(0, 8) + "..."}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {userRole.email || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white rounded-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Actif
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(userRole.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-[8px]"
                              onClick={() => {
                                setSelectedUser(userRole);
                                setFormData({ ...formData, role: userRole.role as "admin" | "operateur" | "fidele" });
                                setOpenEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-[8px]"
                              onClick={() => handleResetPassword(userRole.user_id, "email@example.com")}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-[8px] text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedUser(userRole);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {userRoles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucun utilisateur trouvé. Commencez par inviter des membres de votre équipe.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">
                  📊 Historique des activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                      <Activity className="h-5 w-5 text-[hsl(var(--primary))] mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-[hsl(var(--text-dark))]">{log.action}</p>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune activité enregistrée pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-3d rounded-[10px] border-none">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-dark))]">
                  🔐 Paramètres de sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-[10px] border border-blue-200">
                  <h3 className="font-semibold text-[hsl(var(--text-dark))] mb-2">
                    Authentification à deux facteurs (2FA)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Renforcez la sécurité de votre compte en activant l'authentification à deux facteurs.
                  </p>
                  <Button className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
                    Activer 2FA
                  </Button>
                </div>

                <div className="p-4 bg-green-50 rounded-[10px] border border-green-200">
                  <h3 className="font-semibold text-[hsl(var(--text-dark))] mb-2">
                    Permissions dynamiques
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Les permissions sont automatiquement appliquées selon le rôle de l'utilisateur :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span><strong>Admin :</strong> Accès total à toutes les fonctionnalités</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span><strong>Opérateur :</strong> Gestion des membres, événements, dons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span><strong>Fidèle :</strong> Accès aux ressources et espace personnel</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Edit Role */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="rounded-[10px]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--text-dark))]">Modifier le rôle</DialogTitle>
            <DialogDescription>
              Changez le rôle de cet utilisateur dans votre église
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editRole" className="text-[hsl(var(--text-dark))]">Nouveau rôle</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "operateur" | "fidele" })}>
              <SelectTrigger className="rounded-[10px] mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operateur">Opérateur</SelectItem>
                <SelectItem value="fidele">Fidèle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)} className="rounded-[10px]">
              Annuler
            </Button>
            <Button onClick={handleUpdateRole} className="rounded-[10px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Delete User */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent className="rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera l'accès de cet utilisateur à votre église. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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

export default Teams;
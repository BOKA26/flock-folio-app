import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [formData, setFormData] = useState({
    montant: "",
    type_don: "",
    membre_id: "",
  });

  useEffect(() => {
    loadMembers();
    loadDonations();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("nom");
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error("Error loading members:", error);
    }
  };

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*, members(*)")
        .order("date_don", { ascending: false });

      if (error) throw error;
      
      setDonations(data || []);
      
      const total = (data || []).reduce(
        (sum, don) => sum + Number(don.montant),
        0
      );
      setTotalAmount(total);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDonations = () => {
    if (filterPeriod === "all") return donations;
    
    const now = new Date();
    const filtered = donations.filter(don => {
      const donDate = new Date(don.date_don);
      
      if (filterPeriod === "month") {
        return donDate.getMonth() === now.getMonth() && donDate.getFullYear() === now.getFullYear();
      } else if (filterPeriod === "year") {
        return donDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    
    return filtered;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.montant || !formData.type_don) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData) throw new Error("Église non trouvée");

      // Get member name if selected
      const selectedMember = formData.membre_id 
        ? members.find(m => m.id === formData.membre_id)
        : null;

      // Redirect to payment page with donation data
      navigate("/donation-payment", {
        state: {
          donationData: {
            montant: parseFloat(formData.montant),
            type_don: formData.type_don,
            membre_id: formData.membre_id || null,
            church_id: roleData.church_id,
            memberName: selectedMember ? `${selectedMember.nom} ${selectedMember.prenom}` : null,
          }
        }
      });

      setDialogOpen(false);
      setFormData({ montant: "", type_don: "", membre_id: "" });
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dons</h1>
            <p className="text-muted-foreground mt-1">
              Historique et gestion des dons
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer un don
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau don</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="montant">Montant (€) *</Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.montant}
                    onChange={(e) =>
                      setFormData({ ...formData, montant: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="membre_id">Membre (optionnel)</Label>
                  <Select
                    value={formData.membre_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, membre_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.nom} {member.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type_don">Type de don *</Label>
                  <Select
                    value={formData.type_don}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type_don: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dime">Dîme</SelectItem>
                      <SelectItem value="offrande">Offrande</SelectItem>
                      <SelectItem value="projet">Don pour un projet</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-gentle">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total des dons
              </CardTitle>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes périodes</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">
              {getFilteredDonations().reduce((sum, d) => sum + Number(d.montant), 0).toFixed(2)} €
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getFilteredDonations().length} don{getFilteredDonations().length > 1 ? "s" : ""} enregistré
              {getFilteredDonations().length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-gentle">
          <CardHeader>
            <CardTitle>Historique des dons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Chargement...
              </p>
            ) : getFilteredDonations().length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun don pour cette période
              </p>
            ) : (
              <div className="space-y-3">
                {getFilteredDonations().map((don) => (
                  <div
                    key={don.id}
                    className="flex justify-between items-center p-4 rounded-lg bg-accent/50"
                  >
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {don.type_don}
                      </p>
                      {don.members && (
                        <p className="text-sm font-semibold text-muted-foreground">
                          {don.members.nom} {don.members.prenom}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(don.date_don).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {parseFloat(don.montant).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Donations;

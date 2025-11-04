import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { donationSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard } from "lucide-react";
import { toast } from "sonner";

const OnlineDonations = () => {
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("offrande");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [churchId, setChurchId] = useState<string | null>(null);

  useEffect(() => {
    loadUserChurch();
  }, []);

  const loadUserChurch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("church_id")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setChurchId(data.church_id);
    }

    // Load user email
    setEmail(user.email || "");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!churchId) {
      toast.error("Erreur : Église non trouvée");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setLoading(true);

    try {
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx', // Will be replaced with actual key
        email: email,
        amount: parseFloat(amount) * 100, // Convert to kobo/cents
        currency: 'XOF', // West African CFA franc
        ref: `${churchId}_${Date.now()}`,
        metadata: {
          church_id: churchId,
          donation_type: donationType,
        },
        callback: async (response: any) => {
          console.log('Payment successful:', response);
          
          // Save donation to database
          const { data: { user } } = await supabase.auth.getUser();
          
          try {
            // Validate donation data with Zod
            const validated = donationSchema.parse({
              montant: parseFloat(amount),
              type_don: donationType,
            });

            const { error } = await supabase.from("donations").insert([{
              montant: validated.montant,
              type_don: validated.type_don,
              church_id: churchId,
              membre_id: user?.id || null,
              reference_transaction: response.reference,
              statut: 'completed',
            }]);

            if (error) {
              console.error('Error saving donation:', error);
              toast.error("Erreur lors de l'enregistrement du don");
            } else {
              toast.success("Don effectué avec succès ! Que Dieu vous bénisse 🙏");
              setAmount("");
              setDonationType("offrande");
            }
          } catch (error: any) {
            if (error instanceof z.ZodError) {
              toast.error(error.errors[0].message);
            } else {
              toast.error("Erreur lors de l'enregistrement du don");
            }
          }
        },
        onClose: () => {
          toast.info("Paiement annulé");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error("Erreur lors de l'initialisation du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Faire un don en ligne
          </h1>
          <p className="text-muted-foreground">
            Soutenez l'œuvre de Dieu par vos dons et offrandes
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Effectuer un don
            </CardTitle>
            <CardDescription>
              Vos dons nous aident à poursuivre notre mission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de don *</Label>
                <Select value={donationType} onValueChange={setDonationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offrande">Offrande</SelectItem>
                    <SelectItem value="dîme">Dîme</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant (XOF) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 5000"
                />
                <p className="text-xs text-muted-foreground">
                  Montant minimum : 100 XOF
                </p>
              </div>

              <Button type="submit" variant="premium" className="w-full" size="lg" disabled={loading}>
                <CreditCard className="mr-2 h-5 w-5" />
                {loading ? "Chargement..." : "Payer avec Paystack"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <p>Paiement sécurisé par Paystack</p>
                <p className="mt-1">Cartes bancaires, Mobile Money acceptés</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground italic">
              "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie." - 2 Corinthiens 9:7
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OnlineDonations;

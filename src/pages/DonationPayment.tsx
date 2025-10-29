import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const DonationPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [showCoordinatesForm, setShowCoordinatesForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });

  const donationData = location.state?.donationData;

  useEffect(() => {
    if (!donationData) {
      toast.error("Aucune donnée de don trouvée");
      navigate("/donations");
    }
  }, [donationData, navigate]);

  const paymentMethods = [
    {
      id: "especes",
      label: "Espèces",
      icon: Banknote,
      description: "Paiement en espèces"
    },
    {
      id: "carte",
      label: "Carte bancaire",
      icon: CreditCard,
      description: "Paiement par carte"
    },
    {
      id: "mobile_money",
      label: "Mobile Money",
      icon: Smartphone,
      description: "Orange Money, MTN, etc."
    },
    {
      id: "virement",
      label: "Virement bancaire",
      icon: CreditCard,
      description: "Transfert bancaire"
    }
  ];

  const handlePaymentMethodSelect = () => {
    if (!selectedPayment) {
      toast.error("Veuillez sélectionner un moyen de paiement");
      return;
    }
    setShowCoordinatesForm(true);
  };

  const handlePaymentConfirm = async () => {
    // Validation des coordonnées
    if (!coordinates.nom || !coordinates.prenom || !coordinates.email || !coordinates.telephone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coordinates.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("donations").insert({
        montant: donationData.montant,
        type_don: donationData.type_don,
        membre_id: donationData.membre_id,
        church_id: donationData.church_id,
        statut: "completed",
        reference_transaction: `${selectedPayment}_${Date.now()}_${coordinates.nom}_${coordinates.prenom}`,
      });

      if (error) throw error;

      toast.success("Don enregistré avec succès ! 🙏");
      navigate("/donations");
    } catch (error: any) {
      console.error("Error saving donation:", error);
      toast.error("Erreur lors de l'enregistrement du don");
    } finally {
      setLoading(false);
    }
  };

  if (!donationData) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/donations")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Sélectionner le moyen de paiement
          </h1>
          <p className="text-muted-foreground">
            Choisissez comment vous souhaitez effectuer ce don
          </p>
        </div>

        {/* Donation Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif du don</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type de don:</span>
              <span className="font-medium capitalize">{donationData.type_don}</span>
            </div>
            {donationData.memberName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membre:</span>
                <span className="font-medium">{donationData.memberName}</span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-2 border-t">
              <span className="font-semibold">Montant:</span>
              <span className="font-bold text-primary">
                {donationData.montant.toFixed(2)} €
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        {!showCoordinatesForm && (
          <>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPayment === method.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={`p-3 rounded-lg ${
                          selectedPayment === method.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{method.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedPayment === method.id && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={handlePaymentMethodSelect}
              className="w-full"
              size="lg"
              disabled={!selectedPayment}
            >
              Continuer
            </Button>
          </>
        )}

        {/* Coordinates Form */}
        {showCoordinatesForm && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={coordinates.nom}
                      onChange={(e) => setCoordinates({ ...coordinates, nom: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={coordinates.prenom}
                      onChange={(e) => setCoordinates({ ...coordinates, prenom: e.target.value })}
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={coordinates.email}
                    onChange={(e) => setCoordinates({ ...coordinates, email: e.target.value })}
                    placeholder="votre.email@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={coordinates.telephone}
                    onChange={(e) => setCoordinates({ ...coordinates, telephone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCoordinatesForm(false)}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                className="flex-1"
                size="lg"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Confirmer le paiement"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DonationPayment;

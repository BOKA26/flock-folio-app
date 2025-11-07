import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Church, MapPin, Phone, Mail, Globe, Facebook, Users } from "lucide-react";
import { toast } from "sonner";

const MemberChurch = () => {
  const navigate = useNavigate();
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChurchData();
  }, []);

  const loadChurchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // First, get the church_id from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (roleError || !roleData) {
        toast.error("Vous n'êtes associé à aucune église. Veuillez contacter votre pasteur.");
        return;
      }

      // Get church information
      const { data: churchData, error: churchError } = await supabase
        .from("churches")
        .select("*")
        .eq("id", roleData.church_id)
        .single();

      if (churchError || !churchData) {
        toast.error("Impossible de charger les informations de l'église");
        return;
      }

      setChurchInfo(churchData);

      // Check if member entry exists, if not create it
      const { data: memberData } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!memberData) {
        // Create member entry if it doesn't exist
        const { error: memberError } = await supabase
          .from("members")
          .insert({
            user_id: user.id,
            church_id: roleData.church_id,
            nom: user.user_metadata?.nom_complet?.split(" ").slice(-1)[0] || "Membre",
            prenom: user.user_metadata?.nom_complet?.split(" ").slice(0, -1).join(" ") || "",
            email: user.email,
            statut: "actif"
          });

        if (memberError) {
          console.error("Error creating member:", memberError);
        }
      }

      // Load ministries
      const { data: ministriesData } = await supabase
        .from("ministries")
        .select("*")
        .eq("church_id", roleData.church_id);

      setMinistries(ministriesData || []);
    } catch (error) {
      console.error("Error loading church data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-member-deep">Chargement...</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-member-deep mb-2">💒 Mon Église</h1>
          <p className="text-member-deep/70">Découvrez votre communauté spirituelle</p>
        </div>

        {/* Cover & Logo */}
        <Card className="overflow-hidden shadow-member rounded-2xl border-none">
          <div className="relative h-56 bg-gradient-member-glow">
            {churchInfo?.couverture_url ? (
              <img 
                src={churchInfo.couverture_url} 
                alt="Couverture" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-member-glow flex items-center justify-center">
                <Church className="h-20 w-20 text-white/50" />
              </div>
            )}
          </div>
          <CardContent className="pt-16 relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              {churchInfo?.logo_url ? (
                <img 
                  src={churchInfo.logo_url} 
                  alt="Logo" 
                  className="h-32 w-32 rounded-full border-4 border-white shadow-member glow-gold object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-member glow-gold flex items-center justify-center">
                  <Church className="h-16 w-16 text-member-blue" />
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <h2 className="text-3xl font-bold text-member-deep">{churchInfo?.nom}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        {churchInfo?.description && (
          <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-sky/30 to-white">
            <CardHeader>
              <CardTitle className="text-member-deep text-xl">📖 Mission & Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-member-deep/80 leading-relaxed">{churchInfo.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Key Verse */}
        {churchInfo?.verset_clef && (
          <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-blue/20 to-white border-l-4 border-l-member-gold">
            <CardContent className="py-6">
              <p className="text-sm font-semibold text-member-gold mb-2">✨ Verset clé ou Devise</p>
              <p className="text-lg italic text-member-deep text-center">
                "{churchInfo.verset_clef}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="shadow-member rounded-2xl border-none">
          <CardHeader>
            <CardTitle className="text-member-deep text-xl">📞 Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {churchInfo?.adresse && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <MapPin className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">Adresse</p>
                  <p className="text-sm text-member-deep/70">{churchInfo.adresse}</p>
                </div>
              </div>
            )}
            
            {churchInfo?.contact && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <Phone className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">Téléphone</p>
                  <p className="text-sm text-member-deep/70">{churchInfo.contact}</p>
                </div>
              </div>
            )}
            
            {churchInfo?.email && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <Mail className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">Email</p>
                  <p className="text-sm text-member-deep/70">{churchInfo.email}</p>
                </div>
              </div>
            )}
            
            {churchInfo?.site_web && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <Globe className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">Site Web</p>
                  <a href={churchInfo.site_web} target="_blank" rel="noopener noreferrer" className="text-sm text-member-bright hover:underline">
                    Visiter
                  </a>
                </div>
              </div>
            )}
            
            {churchInfo?.facebook && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <Facebook className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">Facebook</p>
                  <a href={churchInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-member-bright hover:underline">
                    Suivre
                  </a>
                </div>
              </div>
            )}

            {churchInfo?.whatsapp && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-member-sky/20">
                <Phone className="h-5 w-5 text-member-bright mt-0.5" />
                <div>
                  <p className="font-semibold text-member-deep">WhatsApp</p>
                  <p className="text-sm text-member-deep/70">{churchInfo.whatsapp}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ministries */}
        {ministries.length > 0 && (
          <Card className="shadow-member rounded-2xl border-none">
            <CardHeader>
              <CardTitle className="text-member-deep text-xl flex items-center gap-2">
                <Users className="h-6 w-6 text-member-bright" />
                Équipe et Ministères
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {ministries.map((ministry) => (
                  <div key={ministry.id} className="p-4 rounded-xl bg-gradient-to-br from-member-blue/10 to-member-sky/10 border border-member-blue/20 hover:shadow-member transition-shadow">
                    <h3 className="font-semibold text-member-deep mb-1">{ministry.nom}</h3>
                    {ministry.responsable_nom && (
                      <p className="text-sm text-member-deep/70">
                        👤 Responsable: {ministry.responsable_nom}
                      </p>
                    )}
                    {ministry.description && (
                      <p className="text-sm text-member-deep/60 mt-2">{ministry.description}</p>
                    )}
                    {ministry.nb_membres > 0 && (
                      <p className="text-xs text-member-bright mt-2">
                        {ministry.nb_membres} membre{ministry.nb_membres > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Button */}
        <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-bright/10 to-member-gold/10">
          <CardContent className="py-6 text-center">
            <Button className="bg-gradient-member-glow text-white hover:glow-gold shadow-member rounded-xl px-8 py-6 text-lg">
              💬 Contacter mon église
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center pb-6 text-member-deep/60">
        <p className="text-sm">EgliConnect — Servir Dieu dans l'unité et la lumière 🕊️</p>
        <p className="text-xs mt-1">© 2025 Tous droits réservés</p>
      </footer>
    </MemberLayout>
  );
};

export default MemberChurch;

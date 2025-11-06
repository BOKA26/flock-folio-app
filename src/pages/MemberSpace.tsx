import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Church, MapPin, Phone, Mail, Globe, Facebook, Heart, DollarSign, Megaphone, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import ChatbotReligieux from "@/components/ChatbotReligieux";

const MemberSpace = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);

      // Get member info
      const { data: memberData } = await supabase
        .from("members")
        .select("*, churches(*)")
        .eq("user_id", user.id)
        .single();

      if (!memberData) {
        toast.error("Profil membre introuvable");
        return;
      }

      setMember(memberData);
      setChurchInfo(memberData.churches);

      // Load announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", memberData.church_id)
        .order("created_at", { ascending: false })
        .limit(5);
      setAnnouncements(announcementsData || []);

      // Load upcoming events
      const { data: eventsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", memberData.church_id)
        .eq("type", "evenement")
        .gte("date_evenement", new Date().toISOString())
        .order("date_evenement", { ascending: true })
        .limit(5);
      setEvents(eventsData || []);

      // Load prayers
      const { data: prayersData } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("church_id", memberData.church_id)
        .order("created_at", { ascending: false })
        .limit(5);
      setPrayers(prayersData || []);

      // Load my donations
      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .eq("membre_id", memberData.id)
        .order("date_don", { ascending: false });
      setDonations(donationsData || []);

      // Load messages from pastor
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("church_id", memberData.church_id)
        .order("created_at", { ascending: false })
        .limit(10);
      setMessages(messagesData || []);

      // Setup realtime subscription for messages
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `church_id=eq.${memberData.church_id}`
          },
          async (payload) => {
            console.log('Message update received:', payload);
            
            if (payload.eventType === 'INSERT') {
              setMessages((current) => [payload.new, ...current].slice(0, 10));
              toast.success("Nouveau message du pasteur");
            } else if (payload.eventType === 'UPDATE') {
              setMessages((current) =>
                current.map((msg) =>
                  msg.id === payload.new.id ? payload.new : msg
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setMessages((current) =>
                current.filter((msg) => msg.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error("Error loading member data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrayer = () => {
    navigate('/member-prayers');
  };

  const handleDonate = () => {
    toast.info("Intégration Paystack à venir");
  };

  const handleDownloadReceipt = (donationId: string) => {
    toast.info("Génération PDF à venir");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <MemberLayout>
      {/* Header with Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-heaven overflow-hidden">
        {churchInfo?.couverture_url ? (
          <img 
            src={churchInfo.couverture_url} 
            alt="Couverture" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-heaven" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        
        {/* Church Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-6xl mx-auto flex items-end gap-4">
            {churchInfo?.logo_url ? (
              <img 
                src={churchInfo.logo_url} 
                alt="Logo" 
                className="h-20 w-20 md:h-24 md:w-24 rounded-lg object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-white/10 backdrop-blur-sm border-4 border-white flex items-center justify-center">
                <Church className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Bienvenue, {member?.prenom} {member?.nom}, dans la maison de Dieu — {churchInfo?.nom} 🙏
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Citation biblique du jour */}
        <Card className="shadow-divine border-l-4 border-l-secondary bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <p className="text-sm font-semibold text-secondary mb-2">🙏 Citation biblique du jour</p>
            <p className="text-lg italic text-foreground">
              "Car rien n'est impossible à Dieu"
            </p>
            <p className="text-sm text-muted-foreground mt-1">— Luc 1:37</p>
          </CardContent>
        </Card>

        {/* Verset Clé de l'Église */}
        {churchInfo?.verset_clef && (
          <Card className="shadow-divine border-l-4 border-l-primary">
            <CardContent className="py-6">
              <p className="text-sm font-semibold text-primary mb-2">📖 Verset clé de l'église</p>
              <p className="text-lg italic text-center text-foreground">
                "{churchInfo.verset_clef}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mini résumé spirituel */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-3d hover-scale bg-gradient-to-br from-primary/10 to-primary/5 border-t-4 border-t-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Dernière participation</p>
                  <p className="font-semibold text-sm">Culte du dimanche</p>
                  <p className="text-xs text-muted-foreground">27 octobre 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d hover-scale bg-gradient-to-br from-secondary/10 to-secondary/5 border-t-4 border-t-secondary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Dernier don</p>
                  <p className="font-semibold text-sm">
                    {donations.length > 0 ? `${Number(donations[0].montant).toFixed(2)} €` : 'Aucun don'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {donations.length > 0 ? donations[0].type_don : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-3d hover-scale bg-gradient-to-br from-primary/10 to-primary/5 border-t-4 border-t-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Prochain événement</p>
                  <p className="font-semibold text-sm">
                    {events.length > 0 ? events[0].titre : 'Aucun événement'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {events.length > 0 && events[0].date_evenement 
                      ? new Date(events[0].date_evenement).toLocaleDateString('fr-FR')
                      : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mon Église */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="h-6 w-6 text-primary" />
              Mon Église
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{churchInfo?.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {churchInfo?.adresse && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.adresse}</p>
                  </div>
                </div>
              )}
              
              {churchInfo?.contact && (
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Contact</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.contact}</p>
                  </div>
                </div>
              )}
              
              {churchInfo?.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.email}</p>
                  </div>
                </div>
              )}
              
              {churchInfo?.site_web && (
                <div className="flex items-start gap-2">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Site Web</p>
                    <a href={churchInfo.site_web} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      Visiter
                    </a>
                  </div>
                </div>
              )}
              
              {churchInfo?.facebook && (
                <div className="flex items-start gap-2">
                  <Facebook className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Facebook</p>
                    <a href={churchInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      Suivre
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages du Pasteur en Temps Réel */}
        {messages.length > 0 && (
          <Card className="shadow-divine border-t-4 border-t-primary bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                💬 Messages du Pasteur
              </CardTitle>
              <CardDescription>Messages et communications importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.slice(0, 5).map((message) => (
                <div key={message.id} className="border-l-4 border-l-primary pl-4 py-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{message.subject}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(message.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.content}</p>
                  {message.recipient_type && (
                    <div className="mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {message.recipient_type === 'all' ? 'Tous les membres' : 
                         message.recipient_type === 'members' ? 'Membres' : 
                         message.recipient_type}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Programmes de culte */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-6 w-6 text-primary" />
                  🙏 Programmes de culte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.filter(a => a.type === 'culte').length > 0 ? (
                  announcements.filter(a => a.type === 'culte').slice(0, 3).map((culte) => (
                    <div key={culte.id} className="border-l-4 border-l-primary pl-4 py-2 bg-accent/50 rounded-lg p-3">
                      {culte.image_url && (
                        <img 
                          src={culte.image_url} 
                          alt={culte.titre}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h4 className="font-semibold">{culte.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{culte.contenu}</p>
                      {culte.date_evenement && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📅 {new Date(culte.date_evenement).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun programme de culte pour le moment</p>
                )}
              </CardContent>
            </Card>

            {/* Annonces et Événements */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-primary" />
                  📢 Annonces et Événements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.filter(a => !a.type || a.type === 'annonce').length > 0 ? (
                  announcements.filter(a => !a.type || a.type === 'annonce').slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-l-primary pl-4 py-2">
                      {announcement.image_url && (
                        <img 
                          src={announcement.image_url} 
                          alt={announcement.titre}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h4 className="font-semibold">{announcement.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.contenu}</p>
                      {announcement.date_evenement && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📅 {new Date(announcement.date_evenement).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune annonce pour le moment</p>
                )}
              </CardContent>
            </Card>

            {/* Prières et Méditations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Prières et Méditations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prayers.length > 0 ? (
                  prayers.slice(0, 3).map((prayer) => (
                    <div key={prayer.id} className="border-l-4 border-l-secondary pl-4 py-2">
                      <p className="text-sm">{prayer.texte}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(prayer.date_demande).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune demande de prière</p>
                )}
                <Button onClick={handleNewPrayer} className="w-full gradient-heaven">
                  Faire une nouvelle demande
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Mes Dons */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Mes Dons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {donations.length > 0 ? (
                    <>
                      <div className="bg-gradient-divine p-4 rounded-lg">
                        <p className="text-sm font-semibold">Total des dons</p>
                        <p className="text-2xl font-bold">
                          {donations.reduce((sum, d) => sum + Number(d.montant), 0).toFixed(2)} €
                        </p>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {donations.map((donation) => (
                          <div key={donation.id} className="flex justify-between items-center p-3 bg-muted rounded">
                            <div>
                              <p className="font-semibold">{Number(donation.montant).toFixed(2)} €</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(donation.date_don).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadReceipt(donation.id)}
                            >
                              Reçu PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun don enregistré</p>
                  )}
                </div>
                
                <Button onClick={handleDonate} className="w-full gradient-divine">
                  Faire un don via Paystack
                </Button>
              </CardContent>
            </Card>

            {/* Assistant Spirituel */}
            <Card className="shadow-soft border-2 border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                  🤖 Assistant Spirituel GPT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-divine p-4 rounded-lg text-center">
                  <p className="text-sm">
                    Bonjour ! Je suis l'assistant spirituel de votre église. Posez-moi une question 🙌
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cliquez sur l'icône en bas à droite pour discuter avec moi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Spirituel */}
      <footer className="bg-card border-t mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            EgliConnect – Servir Dieu à travers la technologie 💡
          </p>
        </div>
      </footer>

      {/* Chatbot floating button */}
      <ChatbotReligieux />
    </MemberLayout>
  );
};

export default MemberSpace;

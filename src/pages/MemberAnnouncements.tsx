import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Calendar, MapPin, Clock, Share2, Bell } from "lucide-react";
import { toast } from "sonner";

const MemberAnnouncements = () => {
  const [member, setMember] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cultes, setCultes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get church_id from user_roles first
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData?.church_id) {
        toast.error("Vous n'êtes pas associé à une église");
        return;
      }

      // Get or create member profile
      let { data: memberData } = await supabase
        .from("members")
        .select("*, churches(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      // Create member profile if it doesn't exist
      if (!memberData) {
        const { data: newMember } = await supabase
          .from("members")
          .insert({
            user_id: user.id,
            church_id: roleData.church_id,
            nom: user.user_metadata?.nom_complet?.split(" ")[1] || "",
            prenom: user.user_metadata?.nom_complet?.split(" ")[0] || "",
            email: user.email,
          })
          .select("*, churches(*)")
          .single();
        
        memberData = newMember;
      }

      setMember(memberData);

      // Load announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", roleData.church_id)
        .eq("type", "annonce")
        .order("created_at", { ascending: false });

      // Load events
      const { data: eventsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", roleData.church_id)
        .eq("type", "evenement")
        .order("date_evenement", { ascending: true });

      // Load cultes
      const { data: cultesData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", roleData.church_id)
        .eq("type", "culte")
        .order("date_evenement", { ascending: true });

      setAnnouncements(announcementsData || []);
      setEvents(eventsData || []);
      setCultes(cultesData || []);

      // Setup realtime listeners
      const channel = supabase
        .channel('announcements-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'announcements',
            filter: `church_id=eq.${roleData.church_id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as any;
              if (newItem.type === 'annonce') {
                setAnnouncements(prev => [newItem, ...prev]);
                toast.success("Nouvelle annonce !");
              } else if (newItem.type === 'evenement') {
                setEvents(prev => [...prev, newItem].sort((a, b) => 
                  new Date(a.date_evenement).getTime() - new Date(b.date_evenement).getTime()
                ));
                toast.success("Nouvel événement !");
              } else if (newItem.type === 'culte') {
                setCultes(prev => [...prev, newItem].sort((a, b) => 
                  new Date(a.date_evenement).getTime() - new Date(b.date_evenement).getTime()
                ));
                toast.success("Nouveau programme de culte !");
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as any;
              if (updatedItem.type === 'annonce') {
                setAnnouncements(prev => prev.map(item => 
                  item.id === updatedItem.id ? updatedItem : item
                ));
              } else if (updatedItem.type === 'evenement') {
                setEvents(prev => prev.map(item => 
                  item.id === updatedItem.id ? updatedItem : item
                ));
              } else if (updatedItem.type === 'culte') {
                setCultes(prev => prev.map(item => 
                  item.id === updatedItem.id ? updatedItem : item
                ));
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setAnnouncements(prev => prev.filter(item => item.id !== deletedId));
              setEvents(prev => prev.filter(item => item.id !== deletedId));
              setCultes(prev => prev.filter(item => item.id !== deletedId));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (announcement: any) => {
    const text = `${announcement.titre}\n\n${announcement.contenu}`;
    if (navigator.share) {
      navigator.share({
        title: announcement.titre,
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers");
    }
  };

  const handleRegisterEvent = (eventId: string) => {
    toast.info("Inscription en ligne à venir");
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-primary" />
          Vie de mon Église
        </h1>

        <Tabs defaultValue="announcements" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="announcements">Annonces ({announcements.length})</TabsTrigger>
            <TabsTrigger value="cultes">Programmes de culte ({cultes.length})</TabsTrigger>
            <TabsTrigger value="events">Événements ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4 mt-6">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="shadow-soft hover:shadow-divine transition-shadow">
                  <CardContent className="pt-6">
                    {announcement.image_url && (
                      <img
                        src={announcement.image_url}
                        alt={announcement.titre}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">{announcement.titre}</h3>
                      <p className="text-muted-foreground">{announcement.contenu}</p>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          📅 {new Date(announcement.created_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(announcement)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune annonce pour le moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cultes" className="space-y-4 mt-6">
            {cultes.length > 0 ? (
              cultes.map((culte) => (
                <Card key={culte.id} className="shadow-soft hover:shadow-divine transition-shadow">
                  <CardContent className="pt-6">
                    {culte.image_url && (
                      <img
                        src={culte.image_url}
                        alt={culte.titre}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">{culte.titre}</h3>
                      
                      <p className="text-muted-foreground">{culte.contenu}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                        {culte.date_evenement && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Date</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(culte.date_evenement).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {(culte.heure_debut || culte.heure_fin) && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Horaire</p>
                              <p className="text-sm text-muted-foreground">
                                {culte.heure_debut} - {culte.heure_fin}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {culte.lieu && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Lieu</p>
                              <p className="text-sm text-muted-foreground">{culte.lieu}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleShare(culte)}
                          className="flex-1"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun programme de culte pour le moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-6">
            {events.length > 0 ? (
              events.map((event) => (
                <Card key={event.id} className="shadow-soft hover:shadow-divine transition-shadow">
                  <CardContent className="pt-6">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.titre}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{event.titre}</h3>
                        {event.type_evenement && (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {event.type_evenement}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{event.contenu}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                        {event.date_evenement && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Date</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.date_evenement).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {(event.heure_debut || event.heure_fin) && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Horaire</p>
                              <p className="text-sm text-muted-foreground">
                                {event.heure_debut} - {event.heure_fin}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {event.lieu && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Lieu</p>
                              <p className="text-sm text-muted-foreground">{event.lieu}</p>
                            </div>
                          </div>
                        )}
                        
                        {event.nb_participants !== null && (
                          <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">Participants</p>
                              <p className="text-sm text-muted-foreground">
                                {event.nb_participants} inscrits
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleRegisterEvent(event.id)}
                          className="flex-1 gradient-divine"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          S'inscrire
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare(event)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun événement à venir</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
};

export default MemberAnnouncements;

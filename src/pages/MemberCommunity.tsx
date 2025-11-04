import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, Heart, Send } from "lucide-react";
import { toast } from "sonner";

const MemberCommunity = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [churchId, setChurchId] = useState<string>("");

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: memberData } = await supabase
        .from("members")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (!memberData) return;

      setChurchId(memberData.church_id);

      // Load announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("*")
        .eq("church_id", memberData.church_id)
        .order("created_at", { ascending: false })
        .limit(10);

      setAnnouncements(announcementsData || []);

      // Load messages (if you have a messages table for community chat)
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("church_id", memberData.church_id)
        .eq("recipient_type", "all")
        .order("created_at", { ascending: false })
        .limit(20);

      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading community data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("messages")
        .insert({
          church_id: churchId,
          sender_id: user.id,
          recipient_type: "all",
          subject: "Message communautaire",
          content: newMessage,
        });

      if (error) throw error;

      toast.success("Message publié");
      setNewMessage("");
      loadCommunityData();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi");
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
          <h1 className="text-4xl font-bold text-member-deep mb-2">💬 Communauté</h1>
          <p className="text-member-deep/70">Restez connectés avec vos frères et sœurs en Christ</p>
        </div>

        {/* Share Message */}
        <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-sky/30 to-white">
          <CardHeader>
            <CardTitle className="text-member-deep flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-member-bright" />
              Partager un message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Partagez un témoignage, une prière, un encouragement..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px] rounded-xl border-member-blue/30"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-member-glow text-white hover:glow-gold shadow-member rounded-xl"
            >
              <Send className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </CardContent>
        </Card>

        {/* Announcements & Messages */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Church Announcements */}
          <Card className="shadow-member rounded-2xl border-none">
            <CardHeader>
              <CardTitle className="text-member-deep flex items-center gap-2">
                <Users className="h-5 w-5 text-member-bright" />
                Annonces de l'église
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-member-blue/10 to-member-sky/10 border border-member-blue/20"
                  >
                    {announcement.image_url && (
                      <img
                        src={announcement.image_url}
                        alt={announcement.titre}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-member-deep mb-2">{announcement.titre}</h3>
                    <p className="text-sm text-member-deep/70">{announcement.contenu}</p>
                    {announcement.date_evenement && (
                      <p className="text-xs text-member-bright mt-2">
                        📅 {new Date(announcement.date_evenement).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-member-deep/60 text-center py-8">Aucune annonce</p>
              )}
            </CardContent>
          </Card>

          {/* Community Messages */}
          <Card className="shadow-member rounded-2xl border-none">
            <CardHeader>
              <CardTitle className="text-member-deep flex items-center gap-2">
                <Heart className="h-5 w-5 text-member-bright" />
                Messages de la communauté
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-member-gold/10 to-member-sky/10 border border-member-gold/20"
                  >
                    <p className="text-sm text-member-deep/80">{message.content}</p>
                    <p className="text-xs text-member-deep/50 mt-2">
                      {new Date(message.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-member-deep/60 text-center py-8">Aucun message pour le moment</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center pb-6 text-member-deep/60">
        <p className="text-sm">EgliConnect — Servir Dieu dans l'unité et la lumière 🕊️</p>
        <p className="text-xs mt-1">© 2025 Tous droits réservés</p>
      </footer>
    </MemberLayout>
  );
};

export default MemberCommunity;

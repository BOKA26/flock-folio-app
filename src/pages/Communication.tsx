import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, MessageSquare, Send, Mail, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  subject: string;
  content: string;
  recipient_type: string;
  read: boolean;
  created_at: string;
  sender_id: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function Communication() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [churchId, setChurchId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    recipient_type: "all",
    recipient_role: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        setChurchId(roleData.church_id);
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      setMessages(messagesData || []);
      setNotifications(notificationsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("messages").insert([{
        church_id: churchId,
        sender_id: user.id,
        subject: formData.subject,
        content: formData.content,
        recipient_type: formData.recipient_type,
        recipient_role: (formData.recipient_role as "admin" | "operateur" | "fidele") || null,
      }]);

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Le message a été envoyé avec succès",
      });

      setIsDialogOpen(false);
      setFormData({ subject: "", content: "", recipient_type: "all", recipient_role: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (id: string, type: "message" | "notification") => {
    try {
      const table = type === "message" ? "messages" : "notifications";
      await supabase.from(table).update({ read: true }).eq("id", id);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRecipientLabel = (type: string) => {
    switch (type) {
      case "all": return "Tous les membres";
      case "role": return "Par rôle";
      case "individual": return "Individuel";
      default: return type;
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Communication
            </h1>
            <p className="text-muted-foreground mt-2">
              Échanges spirituels et administratifs
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-elegant hover:shadow-glow transition-all">
                <Send className="h-4 w-4" />
                Nouveau Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Envoyer un message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient_type">Destinataires</Label>
                  <Select
                    value={formData.recipient_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipient_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les membres</SelectItem>
                      <SelectItem value="role">Par rôle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recipient_type === "role" && (
                  <div>
                    <Label htmlFor="recipient_role">Rôle</Label>
                    <Select
                      value={formData.recipient_role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recipient_role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateurs</SelectItem>
                        <SelectItem value="operateur">Opérateurs</SelectItem>
                        <SelectItem value="fidele">Fidèles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Sujet du message"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Contenu du message"
                    rows={6}
                  />
                </div>

                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
              {messages.filter((m) => !m.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {messages.filter((m) => !m.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {messages.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun message</p>
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`mb-4 transition-all hover:shadow-md ${
                      !message.read ? "border-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {message.subject}
                            {!message.read && (
                              <Badge variant="default">Nouveau</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {getRecipientLabel(message.recipient_type)} •{" "}
                            {new Date(message.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {!message.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(message.id, "message")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`mb-4 transition-all hover:shadow-md ${
                      !notification.read ? "border-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <Badge variant="default">Nouveau</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {notification.type} •{" "}
                            {new Date(notification.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id, "notification")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notification.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}

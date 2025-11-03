import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Video, FileText, Headphones, Plus, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: string;
  titre: string;
  description: string;
  category: string;
  type: string;
  url: string;
  content: string;
  created_at: string;
}

export default function SpiritualResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [churchId, setChurchId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    category: "sermon",
    type: "text",
    url: "",
    content: "",
  });

  const categories = [
    { value: "sermon", label: "Sermons", icon: Book },
    { value: "bible_study", label: "Études bibliques", icon: FileText },
    { value: "meditation", label: "Méditations", icon: Headphones },
    { value: "prayer", label: "Prières", icon: Book },
  ];

  const types = [
    { value: "text", label: "Texte" },
    { value: "pdf", label: "PDF" },
    { value: "video", label: "Vidéo" },
    { value: "audio", label: "Audio" },
  ];

  useEffect(() => {
    loadResources();
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, church_id")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
        setChurchId(roleData.church_id);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from("spiritual_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
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

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("spiritual_resources").insert({
        church_id: churchId,
        created_by: user.id,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Ressource ajoutée",
        description: "La ressource a été ajoutée avec succès",
      });

      setIsDialogOpen(false);
      setFormData({
        titre: "",
        description: "",
        category: "sermon",
        type: "text",
        url: "",
        content: "",
      });
      loadResources();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;

    try {
      const { error } = await supabase
        .from("spiritual_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès",
      });

      loadResources();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canManage = userRole === "admin" || userRole === "operateur";

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.icon : Book;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const getTypeLabel = (type: string) => {
    const t = types.find((t) => t.value === type);
    return t ? t.label : type;
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
              Ressources Spirituelles
            </h1>
            <p className="text-muted-foreground mt-2">
              Sermons, Prières et Méditations
            </p>
          </div>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-elegant hover:shadow-glow transition-all">
                  <Plus className="h-4 w-4" />
                  Ajouter une ressource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouvelle ressource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                      placeholder="Titre de la ressource"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(formData.type === "pdf" || formData.type === "video" || formData.type === "audio") && (
                    <div>
                      <Label htmlFor="url">URL du fichier</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {formData.type === "text" && (
                    <div>
                      <Label htmlFor="content">Contenu</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Contenu de la ressource"
                        rows={8}
                      />
                    </div>
                  )}

                  <Button onClick={handleSubmit} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => {
                const Icon = getCategoryIcon(resource.category);
                return (
                  <Card key={resource.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <Badge variant="outline">{getCategoryLabel(resource.category)}</Badge>
                        </div>
                        <Badge>{getTypeLabel(resource.type)}</Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.titre}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                    {canManage && (
                      <CardFooter>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(resource.id)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources
                  .filter((r) => r.category === cat.value)
                  .map((resource) => {
                    const Icon = cat.icon;
                    return (
                      <Card key={resource.id} className="hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <Icon className="h-5 w-5 text-primary" />
                            <Badge>{getTypeLabel(resource.type)}</Badge>
                          </div>
                          <CardTitle className="text-lg">{resource.titre}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {resource.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(resource.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                        {canManage && (
                          <CardFooter>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(resource.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {resources.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune ressource disponible</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, Music, FileText, Search, Heart, Download } from "lucide-react";
import { toast } from "sonner";

const MemberResources = () => {
  const [member, setMember] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!memberData) return;
      setMember(memberData);

      const { data: resourcesData } = await supabase
        .from("spiritual_resources")
        .select("*")
        .eq("church_id", memberData.church_id)
        .order("created_at", { ascending: false });

      setResources(resourcesData || []);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "sermon":
        return Music;
      case "video":
        return Video;
      case "etude":
        return BookOpen;
      case "document":
        return FileText;
      default:
        return BookOpen;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || resource.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getResourcesByType = (type: string) => {
    return resources.filter(r => r.type === type).length;
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Grandir dans la Foi
          </h1>
        </div>

        {/* Search Bar */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un thème : foi, amour, pardon, prière..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Music className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{getResourcesByType("sermon")}</p>
              <p className="text-sm text-muted-foreground">Sermons</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Video className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{getResourcesByType("video")}</p>
              <p className="text-sm text-muted-foreground">Vidéos</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{getResourcesByType("etude")}</p>
              <p className="text-sm text-muted-foreground">Études</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{getResourcesByType("document")}</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="sermon">Sermons</TabsTrigger>
            <TabsTrigger value="video">Vidéos</TabsTrigger>
            <TabsTrigger value="etude">Études</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredResources.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredResources.map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <Card key={resource.id} className="shadow-soft hover:shadow-divine transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-divine flex items-center justify-center flex-shrink-0">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{resource.titre}</CardTitle>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {resource.type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                                {resource.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {resource.description}
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          {resource.url && (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              {resource.type === 'video' ? 'Regarder' : resource.type === 'sermon' ? 'Écouter' : 'Voir'}
                            </Button>
                          )}
                          {resource.content && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info("Téléchargement à venir")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Ajouté le {new Date(resource.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Aucune ressource trouvée pour votre recherche" : "Aucune ressource disponible"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
};

export default MemberResources;

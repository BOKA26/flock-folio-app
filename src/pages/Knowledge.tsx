import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Loader2 } from "lucide-react";

const Knowledge = () => {
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Récupérer l'église de l'utilisateur
  const { data: churchData } = useQuery({
    queryKey: ['user-church'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('church_id, churches(id, nom)')
        .eq('user_id', user.id)
        .single();

      return userRole;
    }
  });

  // Récupérer les documents
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['kb-documents', churchData?.church_id],
    queryFn: async () => {
      if (!churchData?.church_id) return [];
      const { data } = await supabase
        .from('kb_documents')
        .select('*')
        .eq('church_id', churchData.church_id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!churchData?.church_id
  });

  // Récupérer les FAQ
  const { data: faqs, refetch: refetchFaqs } = useQuery({
    queryKey: ['kb-faq', churchData?.church_id],
    queryFn: async () => {
      if (!churchData?.church_id) return [];
      const { data } = await supabase
        .from('kb_faq')
        .select('*')
        .eq('church_id', churchData.church_id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!churchData?.church_id
  });

  const handleIngestDocument = async () => {
    if (!documentTitle.trim() || !documentText.trim()) {
      toast.error("Le titre et le texte sont requis");
      return;
    }

    if (!churchData?.church_id) {
      toast.error("Église non trouvée");
      return;
    }

    setIsIngesting(true);

    try {
      const { data, error } = await supabase.functions.invoke('ingest-document', {
        body: {
          churchId: churchData.church_id,
          title: documentTitle,
          text: documentText,
          sourceType: 'text'
        }
      });

      if (error) throw error;

      toast.success(`Document ingéré avec succès ! ${data.count} chunks créés.`);
      setDocumentTitle("");
      setDocumentText("");
      refetchDocuments();
    } catch (error: any) {
      console.error('Error ingesting document:', error);
      toast.error("Erreur lors de l'ingestion du document");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAddFaq = async () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error("La question et la réponse sont requises");
      return;
    }

    if (!churchData?.church_id) {
      toast.error("Église non trouvée");
      return;
    }

    try {
      const { error } = await supabase
        .from('kb_faq')
        .insert({
          church_id: churchData.church_id,
          question: faqQuestion,
          answer: faqAnswer
        });

      if (error) throw error;

      toast.success("FAQ ajoutée avec succès !");
      setFaqQuestion("");
      setFaqAnswer("");
      refetchFaqs();
    } catch (error: any) {
      console.error('Error adding FAQ:', error);
      toast.error("Erreur lors de l'ajout de la FAQ");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kb_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Document supprimé avec succès");
      refetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kb_faq')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("FAQ supprimée avec succès");
      refetchFaqs();
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Base de Connaissances</h1>
            <p className="text-muted-foreground">Gérez les informations pour le chatbot IA</p>
          </div>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Titre du document"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Contenu du document (annonces, horaires, doctrine, etc.)"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={8}
                />
                <Button 
                  onClick={handleIngestDocument} 
                  disabled={isIngesting || !documentTitle.trim() || !documentText.trim()}
                  className="w-full"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingestion en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter le Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents Existants ({documents?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {!documents?.length && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun document pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Question"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                />
                <Textarea
                  placeholder="Réponse"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleAddFaq}
                  disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter la FAQ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQs Existantes ({faqs?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faqs?.map((faq) => (
                    <div key={faq.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Q: {faq.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">R: {faq.answer}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFaq(faq.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!faqs?.length && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucune FAQ pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
};

export default Knowledge;

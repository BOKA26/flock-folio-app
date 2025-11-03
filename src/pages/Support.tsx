import { useState } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Video, MessageSquare, BookOpen, Bell, Youtube, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Support() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const faqs = [
    {
      question: "Comment ajouter un nouveau membre ?",
      answer: "Rendez-vous dans la section 'Membres', cliquez sur 'Nouveau Membre', remplissez le formulaire avec les informations du membre (nom, prénom, email, téléphone) et cliquez sur 'Enregistrer'. Le membre sera automatiquement ajouté à votre église.",
      category: "Membres"
    },
    {
      question: "Comment créer un événement ou un culte ?",
      answer: "Dans la section 'Cultes & Événements', cliquez sur 'Nouvel Événement'. Choisissez le type (culte, séminaire, veillée, etc.), renseignez la date, l'heure, le lieu et les détails. Vous pouvez également générer un QR code pour l'enregistrement des participants.",
      category: "Événements"
    },
    {
      question: "Comment suivre les dons de mon église ?",
      answer: "La section 'Dons & Finances' vous permet de voir tous les dons reçus, avec des graphiques d'évolution mensuelle. Vous pouvez filtrer par période, exporter les rapports en PDF/Excel et définir des objectifs de collecte.",
      category: "Finances"
    },
    {
      question: "Comment gérer les ministères de mon église ?",
      answer: "Dans 'Ministères', vous pouvez créer des départements (chorale, jeunesse, intercession, etc.), assigner des responsables, ajouter des membres et planifier des activités. Chaque ministère dispose d'un espace dédié pour suivre ses missions.",
      category: "Ministères"
    },
    {
      question: "Comment envoyer un message à tous les membres ?",
      answer: "Accédez à la section 'Messagerie interne', cliquez sur 'Nouveau Message', sélectionnez 'Tous les membres' comme destinataires, rédigez votre message et envoyez. Vous pouvez également cibler par rôle (admin, opérateur, fidèle).",
      category: "Communication"
    },
    {
      question: "Comment répondre aux demandes de prière ?",
      answer: "Dans 'Demandes de Prière', vous verrez toutes les demandes en attente. Cliquez sur 'Répondre' pour envoyer une réponse personnalisée, ou 'Archiver' une fois la prière traitée. Les statistiques vous permettent de suivre le nombre de prières reçues et répondues.",
      category: "Prières"
    },
    {
      question: "Comment sauvegarder les données de mon église ?",
      answer: "Rendez-vous dans 'Paramètres Avancés' > 'Sauvegarde'. Vos données sont automatiquement sauvegardées chaque jour, mais vous pouvez créer une sauvegarde manuelle à tout moment. Les 30 dernières sauvegardes sont conservées.",
      category: "Technique"
    },
    {
      question: "Comment utiliser l'assistant IA pastoral ?",
      answer: "Dans 'Rapports & Analyses', cliquez sur 'Obtenir des suggestions' dans la section 'Conseiller Pastoral IA'. L'assistant analysera vos données (membres actifs, dons, événements, prières) et vous donnera des recommandations personnalisées pour améliorer la gestion de votre église.",
      category: "IA"
    }
  ];

  const tutorials = [
    {
      id: "intro",
      title: "Introduction à EgliConnect",
      description: "Découvrez les fonctionnalités principales de la plateforme",
      duration: "5 min",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    },
    {
      id: "members",
      title: "Gestion des membres",
      description: "Comment ajouter, modifier et gérer vos membres efficacement",
      duration: "8 min",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    },
    {
      id: "events",
      title: "Créer et gérer des événements",
      description: "Organiser des cultes, séminaires et générer des QR codes",
      duration: "10 min",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    },
    {
      id: "donations",
      title: "Suivre les dons et finances",
      description: "Gérer les contributions et générer des rapports financiers",
      duration: "7 min",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    }
  ];

  const updates = [
    {
      date: "2025-03-01",
      version: "2.5.0",
      title: "Assistant IA Pastoral",
      description: "Nouveau conseiller intelligent pour vous guider dans la gestion de votre église",
      type: "feature"
    },
    {
      date: "2025-02-15",
      version: "2.4.0",
      title: "Ressources spirituelles",
      description: "Nouvelle section pour partager sermons, méditations et études bibliques",
      type: "feature"
    },
    {
      date: "2025-02-01",
      version: "2.3.1",
      title: "Amélioration des performances",
      description: "Optimisation de la vitesse de chargement des pages",
      type: "improvement"
    },
    {
      date: "2025-01-20",
      version: "2.3.0",
      title: "Messagerie interne",
      description: "Communication simplifiée entre administrateurs, opérateurs et fidèles",
      type: "feature"
    }
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Support & Assistance
          </h1>
          <p className="text-muted-foreground mt-2">
            Aide et accompagnement pour utiliser EgliConnect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Assistant IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Posez vos questions à l'assistant pastoral intelligent
              </p>
              <Button className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Ouvrir le chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tutoriels vidéo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Apprenez à utiliser toutes les fonctionnalités
              </p>
              <Button variant="outline" className="w-full gap-2">
                <Youtube className="h-4 w-4" />
                Voir les vidéos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">FAQ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Réponses aux questions fréquemment posées
              </p>
              <Button variant="outline" className="w-full gap-2">
                <BookOpen className="h-4 w-4" />
                Consulter la FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="videos">Tutoriels vidéo</TabsTrigger>
            <TabsTrigger value="updates">Mises à jour</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions fréquentes</CardTitle>
                <CardDescription>
                  Trouvez rapidement des réponses à vos questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">
                            {faq.category}
                          </Badge>
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-all overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <Badge variant="outline">{video.duration}</Badge>
                    </div>
                    <CardDescription>{video.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Historique des mises à jour
                </CardTitle>
                <CardDescription>
                  Suivez les dernières améliorations et nouvelles fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        <Badge 
                          variant={update.type === "feature" ? "default" : "secondary"}
                        >
                          v{update.version}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short"
                          })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                          {update.type === "feature" && <FileText className="h-4 w-4 text-primary" />}
                          {update.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Besoin d'aide personnalisée ?
            </CardTitle>
            <CardDescription>
              Notre équipe de support est là pour vous accompagner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Si vous ne trouvez pas la réponse à votre question dans la FAQ ou les tutoriels,
                notre équipe de support technique est disponible pour vous aider.
              </p>
              <div className="flex gap-2">
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contacter le support
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  support@egliconnect.com
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

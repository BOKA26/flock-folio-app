import { useState } from "react";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, MessageSquare, Send, Video, Book } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MemberSupport = () => {
  const [question, setQuestion] = useState("");

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    // Here you would integrate with your chatbot/GPT
    setQuestion("");
  };

  const faqs = [
    {
      question: "Comment faire un don ?",
      answer: "Rendez-vous dans la section 'Dons & Finances', cliquez sur 'Faire un don', sélectionnez le type de don et suivez les instructions de paiement."
    },
    {
      question: "Comment envoyer une demande de prière ?",
      answer: "Allez dans 'Prières', cliquez sur 'Nouvelle demande', remplissez le formulaire et soumettez votre requête. Le pasteur la recevra."
    },
    {
      question: "Comment m'inscrire à un événement ?",
      answer: "Dans 'Cultes & Événements', trouvez l'événement qui vous intéresse et cliquez sur 'S'inscrire' ou 'Confirmer ma présence'."
    },
    {
      question: "Comment accéder aux ressources spirituelles ?",
      answer: "Visitez la section 'Ressources Spirituelles' pour accéder aux sermons, enseignements, vidéos et méditations."
    },
    {
      question: "Comment contacter mon église ?",
      answer: "Allez dans 'Mon Église' pour voir toutes les coordonnées (téléphone, email, WhatsApp, réseaux sociaux)."
    }
  ];

  const tutorials = [
    { title: "Faire un don en ligne", icon: "💰" },
    { title: "Envoyer une prière", icon: "🙏" },
    { title: "S'inscrire à un événement", icon: "📅" },
    { title: "Consulter les ressources", icon: "📚" }
  ];

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-member-deep mb-2">🧠 Aide & Support</h1>
          <p className="text-member-deep/70">Nous sommes là pour vous accompagner</p>
        </div>

        {/* AI Assistant */}
        <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-bright/10 to-member-sky/20">
          <CardHeader>
            <CardTitle className="text-member-deep flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-member-bright" />
              Assistant Spirituel IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-member-deep/70">Posez une question sur la Bible, la foi ou l'utilisation d'EgliConnect</p>
            <div className="flex gap-2">
              <Input
                placeholder="Explique-moi Jean 3:16..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="flex-1 rounded-xl border-member-blue/30"
              />
              <Button
                onClick={handleAskQuestion}
                className="bg-gradient-member-glow text-white hover:glow-gold shadow-member rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" className="rounded-full border-member-blue/30 text-member-deep hover:bg-member-sky/30">
                Qu'est-ce que la grâce ?
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-member-blue/30 text-member-deep hover:bg-member-sky/30">
                Comment prier efficacement ?
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-member-blue/30 text-member-deep hover:bg-member-sky/30">
                Participer à un événement ?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Video Tutorials */}
        <Card className="shadow-member rounded-2xl border-none">
          <CardHeader>
            <CardTitle className="text-member-deep flex items-center gap-2">
              <Video className="h-5 w-5 text-member-bright" />
              Tutoriels Vidéo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {tutorials.map((tutorial, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-member-blue/10 to-member-sky/10 border border-member-blue/20 hover:shadow-member transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-member-bright/20 flex items-center justify-center text-2xl">
                      {tutorial.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-member-deep">{tutorial.title}</h3>
                      <p className="text-xs text-member-bright">Cliquez pour regarder</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="shadow-member rounded-2xl border-none">
          <CardHeader>
            <CardTitle className="text-member-deep flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-member-bright" />
              Questions Fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-member-blue/20 rounded-xl px-4">
                  <AccordionTrigger className="text-member-deep hover:text-member-bright">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-member-deep/70">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="shadow-member rounded-2xl border-none bg-gradient-to-br from-member-gold/10 to-member-sky/10">
          <CardContent className="py-8 text-center space-y-4">
            <Book className="h-12 w-12 text-member-bright mx-auto" />
            <h3 className="text-xl font-bold text-member-deep">Besoin d'aide supplémentaire ?</h3>
            <p className="text-member-deep/70">Notre équipe est disponible pour vous accompagner</p>
            <Button className="bg-gradient-member-glow text-white hover:glow-gold shadow-member rounded-xl">
              📞 Contacter le support EgliConnect
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

export default MemberSupport;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Church, Users, Heart, TrendingUp, Shield, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import bibleImage from "@/assets/bible-floating.png";
import { useEffect, useRef, useState } from "react";
import Earth3D from "@/components/Earth3D";

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen gradient-blessing overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-sky-50"></div>
        
        <div className="container relative mx-auto px-4 py-12">
          <div className="mx-auto max-w-6xl">
            {/* 3D Earth and Floating Bible */}
            <div className="relative mb-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Earth3D />
                {/* Floating Bible at center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-float-delayed pointer-events-none">
                  <img 
                    src={bibleImage} 
                    alt="Bible" 
                    className="w-full h-full object-contain drop-shadow-2xl animate-gentle-rotate"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-6xl font-bold leading-tight md:text-7xl lg:text-8xl">
                <span className="text-gradient">EgliConnect</span>
              </h1>
              
              <p className="text-2xl font-medium text-foreground md:text-3xl" style={{ animationDelay: "0.2s" }}>
                La plateforme moderne pour gérer votre église
              </p>
              
              <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto" style={{ animationDelay: "0.4s" }}>
                Membres, dons, annonces et prières réunis sur une seule plateforme sécurisée et intuitive
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mt-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Button 
                size="lg" 
                className="gradient-heaven text-lg px-8 py-6 shadow-deep hover:scale-105 hover:shadow-divine transition-all duration-300 group"
                onClick={() => navigate("/auth?mode=signup")}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Créer mon église
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-lg px-8 py-6 hover:bg-primary/10 hover:scale-105 transition-all duration-300"
                onClick={() => navigate("/auth")}
              >
                Se connecter
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Sécurisé</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Églises</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div 
            id="features-header" 
            data-animate
            className={`mb-16 text-center transition-all duration-1000 ${isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Une solution <span className="text-gradient">complète</span> pour votre communauté
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre église
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[
              {
                icon: Users,
                title: "Gestion des membres",
                description: "Enregistrez et suivez tous vos fidèles en toute simplicité",
                color: "primary",
                delay: "0s"
              },
              {
                icon: TrendingUp,
                title: "Suivi des dons",
                description: "Gérez les offrandes et dîmes avec paiement en ligne sécurisé",
                color: "secondary",
                delay: "0.1s"
              },
              {
                icon: Heart,
                title: "Demandes de prière",
                description: "Recueillez et organisez les intentions de prière de votre communauté",
                color: "primary",
                delay: "0.2s"
              },
              {
                icon: Church,
                title: "Annonces & Événements",
                description: "Communiquez facilement avec vos fidèles sur les activités",
                color: "secondary",
                delay: "0.3s"
              },
              {
                icon: Shield,
                title: "Sécurité multi-tenant",
                description: "Vos données sont isolées et protégées par église",
                color: "primary",
                delay: "0.4s"
              },
              {
                icon: Sparkles,
                title: "Assistant spirituel IA",
                description: "Chatbot intelligent pour répondre aux questions spirituelles",
                color: "secondary",
                delay: "0.5s"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              const bgColor = feature.color === "primary" ? "bg-primary/10" : "bg-secondary/10";
              const iconColor = feature.color === "primary" ? "text-primary" : "text-secondary";
              
              return (
                <div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`group transition-all duration-700 ${isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: feature.delay }}
                >
                  <Card className="h-full border-2 shadow-soft hover:shadow-divine hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 bg-white">
                    <CardContent className="p-8">
                      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-8 w-8 ${iconColor}`} />
                      </div>
                      <h3 className="mb-3 text-xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 gradient-blessing">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div
              id="benefits-content"
              data-animate
              className={`transition-all duration-1000 ${isVisible['benefits-content'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            >
              <h2 className="text-4xl font-bold mb-6 md:text-5xl">
                Pourquoi choisir <span className="text-gradient">EgliConnect</span> ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Une plateforme pensée pour simplifier la gestion de votre église et renforcer votre communauté
              </p>
              
              <div className="space-y-4">
                {[
                  "Interface intuitive et facile à utiliser",
                  "Sécurité de niveau entreprise",
                  "Support technique réactif",
                  "Mises à jour régulières et gratuites"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="benefits-visual"
              data-animate
              className={`transition-all duration-1000 ${isVisible['benefits-visual'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              <Card className="p-8 shadow-divine border-2 border-primary/20 bg-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Gestion simplifiée</div>
                      <div className="text-sm text-muted-foreground">Gérez tout en un seul endroit</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Croissance assurée</div>
                      <div className="text-sm text-muted-foreground">Suivez vos progrès en temps réel</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Données protégées</div>
                      <div className="text-sm text-muted-foreground">Sécurité maximale garantie</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div
            id="cta-section"
            data-animate
            className={`transition-all duration-1000 ${isVisible['cta-section'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <Card className="gradient-heaven border-0 shadow-deep overflow-hidden relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <CardContent className="relative p-12 md:p-16 text-center text-white">
                <div className="mb-6 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-pulse">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                  Prêt à transformer la gestion de votre église ?
                </h2>
                <p className="mb-10 text-xl text-white/90 max-w-2xl mx-auto">
                  Rejoignez les églises qui utilisent EgliConnect pour mieux servir leur communauté
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all duration-300 group"
                    onClick={() => navigate("/auth?mode=signup")}
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm"
                    onClick={() => navigate("/auth")}
                  >
                    En savoir plus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Church className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">EgliConnect</span>
            — Servir Dieu à travers la technologie
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Church, Users, Heart, TrendingUp, Shield, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import churchAssemblyBg from "@/assets/church-assembly-bg.jpg";
import egliconnectLogo from "@/assets/egliconnect-logo.png";
import heroHandLogo from "@/assets/hero-hand-logo.jpg";
import { useEffect, useRef, useState } from "react";

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
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative Sparkles */}
        <div className="absolute top-20 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        
        <div className="container relative mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                Plateforme Simple et Moderne Pour Votre Église
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed">
                Gérez vos membres, dons, annonces et prières sur une seule plateforme sécurisée. EgliConnect simplifie la gestion de votre communauté avec des outils modernes et intuitifs adaptés aux besoins de votre église.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Commencer Maintenant
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-400 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/auth")}
                >
                  Télécharger l'App
                </Button>
              </div>
            </div>

            {/* Right Visual - Hand holding logo */}
            <div className="relative flex justify-center items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative w-full max-w-2xl">
                <img 
                  src={heroHandLogo} 
                  alt="EgliConnect sur tablette" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                
                {/* Decorative circle badge */}
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-32 h-32 flex flex-col items-center justify-center text-slate-900 shadow-2xl animate-pulse">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-xs uppercase tracking-wider font-semibold">Support</div>
                </div>

                {/* Stats Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-4 shadow-2xl text-white">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    <div>
                      <div className="text-2xl font-bold">1.24M</div>
                      <div className="text-xs opacity-90">Utilisateurs Actifs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features at bottom */}
          <div className="mt-20 grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex gap-4">
              <div className="text-yellow-500 text-4xl font-bold">01</div>
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1">Gestion Centralisée</h3>
                <p className="text-slate-400 text-sm">Gérez tous les aspects de votre église depuis une seule plateforme intuitive</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-yellow-500 text-4xl font-bold">02</div>
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1">Système Facile à Utiliser</h3>
                <p className="text-slate-400 text-sm">Interface moderne et accessible conçue pour simplifier votre quotidien</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Section with Stats */}
      <section 
        className="relative py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${churchAssemblyBg})` }}
      >
        <div className="container mx-auto px-4">
          <div
            id="pitch-section"
            data-animate
            className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible['pitch-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Centered Animated Logo */}
            <div className="flex justify-center mb-16">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Glowing background circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl animate-pulse"></div>
                {/* Animated Logo */}
                <div className="relative w-full h-full animate-float">
                  <img 
                    src={egliconnectLogo} 
                    alt="EgliConnect Logo" 
                    className="w-full h-full object-contain drop-shadow-2xl animate-gentle-spin"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                  Découvrez EgliConnect
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  <span className="font-semibold">EgliConnect</span> est une plateforme SaaS multi-tenant qui permet à chaque église de gérer facilement ses membres, ses dons et ses activités sur une interface moderne, sécurisée et accessible en ligne. Grâce à Supabase, Paystack et OpenAI, chaque église dispose d'un espace privé, personnalisé et connecté à sa communauté.
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white uppercase tracking-wide"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  En savoir plus
                </Button>
              </div>

              {/* Right Stats */}
              <div className="space-y-8">
                {[
                  { label: "Objectifs Spirituels", value: 85 },
                  { label: "Gestion Complète", value: 92 },
                  { label: "Communauté Active", value: 78 },
                  { label: "Innovation Tech", value: 95 }
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-white">
                      <span className="uppercase text-sm font-semibold tracking-wide">{stat.label}</span>
                      <span className="text-2xl font-bold">{stat.value}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                        style={{ width: isVisible['pitch-section'] ? `${stat.value}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Band */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-80">
            {[Church, Users, Heart, Shield, Sparkles, TrendingUp].map((Icon, index) => (
              <div key={index} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Icon className="h-12 w-12" />
                <span className="text-xs uppercase tracking-wider">Partenaire {index + 1}</span>
              </div>
            ))}
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
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {/* Logo Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start">
                <div className="h-14 w-14 rounded bg-primary flex items-center justify-center">
                  <Church className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                EgliConnect simplifie la gestion de votre église et renforce le lien spirituel au sein de votre communauté.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                </a>
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Utiles</h3>
              <p className="text-white/50 text-sm mb-4">Découvrez toutes les fonctionnalités pour mieux servir votre communauté</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contactez notre équipe marketing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Voir nos clients</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Inscription Newsletter</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Informations légales</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Utiles</h3>
              <p className="text-white/50 text-sm mb-4">Découvrez toutes les fonctionnalités pour mieux servir votre communauté</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contactez notre équipe marketing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Voir nos clients</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Inscription Newsletter</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Informations légales</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            {/* Links Column 3 */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Utiles</h3>
              <p className="text-white/50 text-sm mb-4">Découvrez toutes les fonctionnalités pour mieux servir votre communauté</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contactez notre équipe marketing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Voir nos clients</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Inscription Newsletter</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Informations légales</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
            <p>© 2025 EgliConnect. Tous droits réservés. Servir Dieu à travers la technologie.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

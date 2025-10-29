import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Church, Users, Heart, TrendingUp, Shield, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-blessing">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDIwMiA4NSUgNDUlIC8gMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-white p-6 shadow-divine">
                <Church className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              <span className="text-gradient">EgliConnect</span>
            </h1>
            
            <p className="mb-4 text-xl text-muted-foreground md:text-2xl">
              La plateforme moderne pour gérer votre église
            </p>
            
            <p className="mb-10 text-lg text-muted-foreground">
              Membres, dons, annonces et prières sur une seule plateforme sécurisée
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="gradient-heaven text-lg shadow-deep hover:scale-105 transition-transform"
                onClick={() => navigate("/auth?mode=signup")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Créer mon église
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-lg hover:bg-primary/10"
                onClick={() => navigate("/auth")}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Une solution complète pour votre communauté
            </h2>
            <p className="text-lg text-muted-foreground">
              Tout ce dont vous avez besoin pour gérer efficacement votre église
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Gestion des membres</h3>
                <p className="text-muted-foreground">
                  Enregistrez et suivez tous vos fidèles en toute simplicité
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Suivi des dons</h3>
                <p className="text-muted-foreground">
                  Gérez les offrandes et dîmes avec paiement en ligne sécurisé
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Demandes de prière</h3>
                <p className="text-muted-foreground">
                  Recueillez et organisez les intentions de prière de votre communauté
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Church className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Annonces & Événements</h3>
                <p className="text-muted-foreground">
                  Communiquez facilement avec vos fidèles sur les activités
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Sécurité multi-tenant</h3>
                <p className="text-muted-foreground">
                  Vos données sont isolées et protégées par église
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-soft hover:shadow-divine transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Assistant spirituel IA</h3>
                <p className="text-muted-foreground">
                  Chatbot intelligent pour répondre aux questions spirituelles
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-heaven border-0 shadow-deep">
            <CardContent className="p-12 text-center text-white">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Prêt à transformer la gestion de votre église ?
              </h2>
              <p className="mb-8 text-lg text-white/90">
                Rejoignez les églises qui utilisent EgliConnect pour servir mieux
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-lg shadow-lg"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Commencer gratuitement
              </Button>
            </CardContent>
          </Card>
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

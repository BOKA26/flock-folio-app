import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import egliconnectLogoOfficial from "@/assets/egliconnect-logo-official.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={egliconnectLogoOfficial} alt="EgliConnect" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
              Fonctionnalités
            </a>
            <a href="#benefits" className="text-foreground/80 hover:text-primary transition-colors">
              Avantages
            </a>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
            >
              Se Connecter
            </Button>
            <Button 
              onClick={() => navigate("/auth?mode=signup")}
            >
              Commencer
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a 
              href="#features" 
              className="block text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Fonctionnalités
            </a>
            <a 
              href="#benefits" 
              className="block text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Avantages
            </a>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/auth");
                setIsMenuOpen(false);
              }}
            >
              Se Connecter
            </Button>
            <Button 
              className="w-full"
              onClick={() => {
                navigate("/auth?mode=signup");
                setIsMenuOpen(false);
              }}
            >
              Commencer
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

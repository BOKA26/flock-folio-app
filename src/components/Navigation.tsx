import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import egliconnectLogoOfficial from "@/assets/egliconnect-logo-official.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50" style={{ 
      background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.95), hsl(43 65% 52% / 0.05))',
      boxShadow: '0 4px 20px hsl(201 85% 21% / 0.08)'
    }}>
      <div className="container mx-auto px-4" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={egliconnectLogoOfficial} alt="EgliConnect" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-[hsl(201,85%,21%)] font-medium transition-colors duration-300 hover:text-[hsl(43,65%,52%)]"
            >
              Fonctionnalités
            </a>
            <a 
              href="#benefits" 
              className="text-[hsl(201,85%,21%)] font-medium transition-colors duration-300 hover:text-[hsl(43,65%,52%)]"
            >
              Avantages
            </a>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="text-[hsl(201,85%,21%)] hover:text-[hsl(43,65%,52%)] font-medium"
            >
              Se Connecter
            </Button>
            <Button 
              variant="premium"
              onClick={() => navigate("/auth?mode=signup")}
            >
              S'inscrire
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
          <div className="md:hidden py-4 space-y-4 border-t border-border/50">
            <a 
              href="#features" 
              className="block text-[hsl(201,85%,21%)] font-medium transition-colors duration-300 hover:text-[hsl(43,65%,52%)]"
              onClick={() => setIsMenuOpen(false)}
            >
              Fonctionnalités
            </a>
            <a 
              href="#benefits" 
              className="block text-[hsl(201,85%,21%)] font-medium transition-colors duration-300 hover:text-[hsl(43,65%,52%)]"
              onClick={() => setIsMenuOpen(false)}
            >
              Avantages
            </a>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-[hsl(201,85%,21%)] hover:text-[hsl(43,65%,52%)] font-medium"
              onClick={() => {
                navigate("/auth");
                setIsMenuOpen(false);
              }}
            >
              Se Connecter
            </Button>
            <Button 
              variant="premium"
              className="w-full"
              onClick={() => {
                navigate("/auth?mode=signup");
                setIsMenuOpen(false);
              }}
            >
              S'inscrire
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

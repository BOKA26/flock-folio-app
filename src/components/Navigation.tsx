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
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="glass-3d"
              size="sm"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
            >
              Fonctionnalités
            </Button>
            <Button 
              variant="glass-3d"
              size="sm"
              onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              className="after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
            >
              Avantages
            </Button>
            <Button 
              variant="glass-3d"
              size="sm"
              onClick={() => navigate("/auth")}
              className="after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
            >
              Se Connecter
            </Button>
            <Button 
              variant="glass-3d"
              onClick={() => navigate("/auth?mode=signup")}
              className="after:bg-[hsl(var(--brand-gold))] after:shadow-[0_0_20px_hsl(var(--brand-gold)/0.8)]"
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
          <div className="md:hidden py-4 space-y-3 border-t border-border/50">
            <Button 
              variant="glass-3d"
              size="sm"
              className="w-full after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
              }}
            >
              Fonctionnalités
            </Button>
            <Button 
              variant="glass-3d"
              size="sm"
              className="w-full after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
              onClick={() => {
                document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
              }}
            >
              Avantages
            </Button>
            <Button 
              variant="glass-3d"
              size="sm"
              className="w-full after:bg-[hsl(var(--brand-sky))] after:shadow-[0_0_20px_hsl(var(--brand-sky)/0.8)]"
              onClick={() => {
                navigate("/auth");
                setIsMenuOpen(false);
              }}
            >
              Se Connecter
            </Button>
            <Button 
              variant="glass-3d"
              className="w-full after:bg-[hsl(var(--brand-gold))] after:shadow-[0_0_20px_hsl(var(--brand-gold)/0.8)]"
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

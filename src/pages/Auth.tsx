import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import egliconnectLogo from "@/assets/egliconnect-logo-clean.png";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom_complet: ""
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nom_complet: formData.nom_complet
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      toast.success("Compte créé avec succès ! Vérifiez votre email pour confirmer.");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4 relative">
      {/* Floating Particles */}
      <div className="particle particle-gold w-3 h-3" style={{ top: '10%', left: '15%', animation: 'float-particle 6s ease-in-out infinite' }} />
      <div className="particle particle-blue w-2 h-2" style={{ top: '20%', left: '80%', animation: 'float-particle-delayed 7s ease-in-out infinite' }} />
      <div className="particle particle-gold w-4 h-4" style={{ top: '70%', left: '10%', animation: 'float-particle-slow 8s ease-in-out infinite' }} />
      <div className="particle particle-blue w-3 h-3" style={{ top: '80%', left: '85%', animation: 'float-particle 5s ease-in-out infinite' }} />
      <div className="particle particle-gold w-2 h-2" style={{ top: '15%', right: '20%', animation: 'float-particle-delayed 6.5s ease-in-out infinite' }} />
      <div className="particle particle-blue w-3 h-3" style={{ bottom: '15%', left: '50%', animation: 'float-particle-slow 7.5s ease-in-out infinite' }} />
      <div className="particle particle-gold w-2 h-2" style={{ top: '40%', left: '5%', animation: 'float-particle 8s ease-in-out infinite' }} />
      <div className="particle particle-blue w-4 h-4" style={{ top: '60%', right: '10%', animation: 'float-particle-delayed 6s ease-in-out infinite' }} />
      
      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="glass-card rounded-3xl p-8 spiritual-glow">
          <CardHeader className="text-center pb-8 space-y-4">
            {/* Logo with Halo */}
            <div className="mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/30 to-[#1E90FF]/30 rounded-full blur-2xl animate-pulse" />
              <img 
                src={egliconnectLogo} 
                alt="EgliConnect Logo" 
                className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl animate-float"
              />
            </div>
            <CardTitle className="text-4xl font-bold" style={{ color: '#0A3C60' }}>
              Créer mon compte EgliConnect
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Input
                  id="nom_complet"
                  placeholder="Nom complet"
                  value={formData.nom_complet}
                  onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                  required
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all h-14 text-base"
                  style={{ color: '#0A3C60' }}
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Adresse e-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all h-14 text-base"
                  style={{ color: '#0A3C60' }}
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all h-14 text-base"
                  style={{ color: '#0A3C60' }}
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all h-14 text-base"
                  style={{ color: '#0A3C60' }}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-led hover:scale-105 transition-all duration-300 mt-6" 
                style={{ 
                  background: '#1E90FF',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(30, 144, 255, 0.4)'
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                S'inscrire maintenant
              </Button>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default Auth;
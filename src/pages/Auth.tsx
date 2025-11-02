import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import egliconnectLogo from "@/assets/egliconnect-logo-clean.png";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom_complet: "",
    church_name: "",
    church_code: "",
    role: "fidele" as "admin" | "fidele"
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Fetch all churches for fidele signup
    const fetchChurches = async () => {
      const { data } = await supabase
        .from("churches")
        .select("id, nom, code_eglise")
        .order("nom");
      
      if (data) setChurches(data);
    };
    
    fetchChurches();

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

      // Create church and role immediately
      if (formData.role === "admin") {
        // Create new church for pastor/admin
        const { data: churchCode, error: rpcError } = await supabase.rpc("generate_church_code");
        
        if (rpcError) throw rpcError;

        const { data: churchData, error: churchError } = await supabase
          .from("churches")
          .insert({
            nom: formData.church_name,
            code_eglise: churchCode,
            description: "Bienvenue dans notre église",
            verset_clef: "Le Seigneur est ma lumière et mon salut"
          })
          .select()
          .single();

        if (churchError) throw churchError;

        // Assign admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            church_id: churchData.id,
            role: "admin"
          });

        if (roleError) throw roleError;

        toast.success(`Église créée avec succès ! Code: ${churchCode}`);
        navigate("/dashboard");
      } else {
        // Fidele joining existing church
        let churchId = formData.church_code;
        
        // If church_code is provided, find the church
        if (formData.church_code && formData.church_code.startsWith("EG-")) {
          const { data: church, error: churchError } = await supabase
            .from("churches")
            .select("id")
            .eq("code_eglise", formData.church_code)
            .single();

          if (churchError || !church) throw new Error("Code d'église invalide");
          churchId = church.id;
        }

        // Assign fidele role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            church_id: churchId,
            role: "fidele"
          });

        if (roleError) throw roleError;

        toast.success("Compte créé avec succès !");
        navigate("/dashboard");
      }

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
      
      {/* Bouton retour à l'accueil */}
      <Button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 glass-card border-white/40 hover:scale-105 transition-all duration-300"
        style={{
          color: '#0A3C60',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        variant="outline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'accueil
      </Button>

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="glass-card rounded-3xl p-8 spiritual-glow">
          <CardHeader className="text-center pb-8 space-y-4">
            {/* Logo with Halo */}
            <div className="mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/30 to-[#1E90FF]/30 rounded-full blur-2xl animate-pulse" />
              <img 
                src={egliconnectLogo} 
                alt="EgliConnect Logo" 
                className="w-24 h-24 object-contain relative z-10 drop-shadow-2xl animate-float"
              />
            </div>
            <CardTitle className="text-4xl font-bold" style={{ color: '#0A3C60' }}>
              Créer mon compte
            </CardTitle>
            <CardTitle className="text-3xl font-bold" style={{ color: '#1E90FF' }}>
              EgliConnect
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="nom_complet" style={{ color: '#0A3C60' }}>Nom complet</Label>
                <Input
                  id="nom_complet"
                  placeholder="Jean Dupont"
                  value={formData.nom_complet}
                  onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                  required
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" style={{ color: '#0A3C60' }}>Adresse e-mail</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" style={{ color: '#0A3C60' }}>Mot de passe</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" style={{ color: '#0A3C60' }}>Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: '#0A3C60' }}>Je suis</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "fidele") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="glass-card border-white/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Pasteur / Responsable (créer une église)</SelectItem>
                    <SelectItem value="fidele">Fidèle (rejoindre une église)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "admin" ? (
                <div className="space-y-2">
                  <Label htmlFor="church_name" style={{ color: '#0A3C60' }}>Nom de l'église</Label>
                  <Input
                    id="church_name"
                    placeholder="Église de la Grâce"
                    value={formData.church_name}
                    onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                    required
                    className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="church_select" style={{ color: '#0A3C60' }}>Choisir votre église</Label>
                  <Select
                    value={formData.church_code}
                    onValueChange={(value) => setFormData({ ...formData, church_code: value })}
                  >
                    <SelectTrigger className="glass-card border-white/40">
                      <SelectValue placeholder="Sélectionnez une église" />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.nom} ({church.code_eglise})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs" style={{ color: '#0A3C60', opacity: 0.7 }}>
                    Ou entrez le code d'église fourni par votre pasteur
                  </p>
                  <Input
                    placeholder="EG-XXX-12345"
                    value={formData.church_code.startsWith("EG-") ? formData.church_code : ""}
                    onChange={(e) => setFormData({ ...formData, church_code: e.target.value })}
                    className="glass-card border-white/40 focus:border-[#1E90FF] transition-all"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full btn-led hover:scale-105 transition-all duration-300" 
                style={{ 
                  background: '#1E90FF',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(30, 144, 255, 0.4)'
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
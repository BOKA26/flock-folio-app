import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Church, Loader2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom_complet: "",
    church_name: "",
    church_code: "",
    role: "fidele" as "admin" | "fidele"
  });
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // After the user confirms email and gets a session, we finalize onboarding
  const processPendingOnboarding = async (userId: string) => {
    try {
      const raw = localStorage.getItem('egli_pending_onboarding');
      if (!raw) return;
      const pending = JSON.parse(raw || '{}');

      if (pending.role === 'admin' && pending.church_name) {
        const { data: churchCode, error: rpcError } = await supabase.rpc('generate_church_code');
        if (rpcError) throw rpcError;

        const { data: churchData, error: churchError } = await supabase
          .from('churches')
          .insert({
            nom: pending.church_name,
            code_eglise: churchCode,
            description: 'Bienvenue dans notre église',
            verset_clef: 'Le Seigneur est ma lumière et mon salut'
          })
          .select()
          .single();
        if (churchError) throw churchError;

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, church_id: churchData.id, role: 'admin' });
        if (roleError) throw roleError;

        toast.success(`Église créée avec succès ! Code: ${churchCode}`);
        localStorage.removeItem('egli_pending_onboarding');
        navigate('/dashboard');
        return;
      }

      if (pending.role === 'fidele' && (pending.church_code || pending.church_id)) {
        let churchId = pending.church_id || pending.church_code;
        if (pending.church_code && String(pending.church_code).startsWith('EG-')) {
          const { data: church, error: churchError } = await supabase
            .from('churches')
            .select('id')
            .eq('code_eglise', pending.church_code)
            .maybeSingle();
          if (churchError || !church) throw new Error("Code d'église invalide");
          churchId = church.id;
        }

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, church_id: churchId, role: 'fidele' });
        if (roleError) throw roleError;

        toast.success('Compte créé avec succès !');
        localStorage.removeItem('egli_pending_onboarding');
        navigate('/dashboard');
        return;
      }
    } catch (e: any) {
      console.error('Onboarding error:', e);
      toast.error(e?.message || "Erreur lors de l'initialisation du compte");
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTimeout(() => {
          const raw = localStorage.getItem('egli_pending_onboarding');
          if (raw) {
            processPendingOnboarding(session.user.id);
          } else {
            navigate('/dashboard');
          }
        }, 0);
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
        setTimeout(() => {
          const raw = localStorage.getItem('egli_pending_onboarding');
          if (raw) {
            processPendingOnboarding(session.user.id);
          } else {
            navigate('/dashboard');
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handle cooldown countdown for signup rate limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setCooldownSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save intended onboarding so we can resume after email confirmation
    try {
      localStorage.setItem('egli_pending_onboarding', JSON.stringify({
        role: formData.role,
        church_name: formData.church_name,
        church_code: formData.church_code
      }));

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nom_complet: formData.nom_complet
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      // Set the session manually to ensure it's available immediately
      if (authData.session) {
        await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token
        });
      }

      // Wait a bit more for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 2000));

      // If no session yet, wait for email confirmation and finish onboarding after login
      const { data: { session: nowSession } } = await supabase.auth.getSession();
      if (!nowSession) {
        toast("Veuillez confirmer votre email. Nous finaliserons la création de votre église après connexion.");
        return;
      }

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
      const code = error?.code || error?.value?.code;
      if (code === 'over_email_send_rate_limit' || error?.value?.status === 429) {
        setCooldownSeconds(55);
        toast.warning("Trop de demandes d'inscription. Patientez ~50s puis réessayez.");
      } else {
        toast.error(error.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-blessing flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
        
        <Card className="w-full shadow-divine">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Church className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl text-gradient">EgliConnect</CardTitle>
          <CardDescription>Gérez votre église en toute simplicité</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={mode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="pasteur@eglise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-heaven" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom_complet">Nom complet</Label>
                  <Input
                    id="nom_complet"
                    placeholder="Jean Dupont"
                    value={formData.nom_complet}
                    onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Je suis</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "fidele") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
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
                    <Label htmlFor="church_name">Nom de l'église</Label>
                    <Input
                      id="church_name"
                      placeholder="Église de la Grâce"
                      value={formData.church_name}
                      onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="church_select">Choisir votre église</Label>
                    <Select
                      value={formData.church_code}
                      onValueChange={(value) => setFormData({ ...formData, church_code: value })}
                    >
                      <SelectTrigger>
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
                    <p className="text-xs text-muted-foreground">
                      Ou entrez le code d'église fourni par votre pasteur
                    </p>
                    <Input
                      placeholder="EG-XXX-12345"
                      value={formData.church_code.startsWith("EG-") ? formData.church_code : ""}
                      onChange={(e) => setFormData({ ...formData, church_code: e.target.value })}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full gradient-heaven" disabled={loading || cooldownSeconds > 0}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {cooldownSeconds > 0 ? `Réessayer dans ${cooldownSeconds}s` : "S'inscrire"}
                </Button>
                {cooldownSeconds > 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Vous avez tenté trop souvent. Patientez {cooldownSeconds}s avant de réessayer.
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
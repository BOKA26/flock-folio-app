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

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
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
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (formData.role === "admin") {
        // Create new church for pastor/admin
        const churchCode = await supabase.rpc("generate_church_code");
        
        const { data: churchData, error: churchError } = await supabase
          .from("churches")
          .insert({
            nom: formData.church_name,
            code_eglise: churchCode.data,
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

        toast.success(`Église créée avec succès ! Code: ${churchCode.data}`);
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
      }

    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
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

                <Button type="submit" className="w-full gradient-heaven" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  S'inscrire
                </Button>
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
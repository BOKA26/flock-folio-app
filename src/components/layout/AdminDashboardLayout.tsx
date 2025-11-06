import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Church,
  Users,
  Megaphone,
  Heart,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  Home,
  BookOpen,
  Calendar,
  HandHeart,
  MessageCircle,
  BarChart3,
  Shield,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [churchName, setChurchName] = useState<string>("");
  const [churchLogo, setChurchLogo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    setUserName(session.user.user_metadata?.full_name || "Pasteur");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, church_id")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);

      const { data: churchData } = await supabase
        .from("churches")
        .select("nom, logo_url")
        .eq("id", roleData.church_id)
        .single();

      if (churchData) {
        setChurchName(churchData.nom);
        setChurchLogo(churchData.logo_url);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const menuItems = [
    { icon: Home, label: "Tableau de bord", path: "/dashboard" },
    { icon: Settings, label: "Paramètres Généraux", path: "/church", roles: ["admin"] },
    { icon: Shield, label: "Équipe et Accès", path: "/teams", roles: ["admin"] },
    { icon: Users, label: "Membres", path: "/members", roles: ["admin", "operateur"] },
    { icon: DollarSign, label: "Dons & Finances", path: "/donations", roles: ["admin", "operateur"] },
    { icon: Calendar, label: "Cultes & Événements", path: "/announcements" },
    { icon: HandHeart, label: "Ministères", path: "/ministries", roles: ["admin", "operateur"] },
    { icon: MessageCircle, label: "Messagerie interne", path: "/communication", roles: ["admin", "operateur"] },
    { icon: BookOpen, label: "Ressources spirituelles", path: "/spiritual-resources", roles: ["admin", "operateur"] },
    { icon: Heart, label: "Demandes de Prière", path: "/prayers" },
    { icon: BookOpen, label: "Base de connaissances", path: "/knowledge", roles: ["admin", "operateur"] },
    { icon: BarChart3, label: "Rapports & Analyses", path: "/reports", roles: ["admin"] },
    { icon: Settings, label: "Paramètres avancés", path: "/advanced-settings", roles: ["admin"] },
    { icon: HelpCircle, label: "Support & Aide", path: "/support" },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#0A2540] to-[#1a3a5c] text-white">
      {/* Logo & Church Name */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          {churchLogo ? (
            <img 
              src={churchLogo} 
              alt={churchName || "Logo"} 
              className="h-14 w-14 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg">
              <Church className="h-7 w-7 text-white" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-base text-white">
              {churchName || "VC"}
            </h2>
            <p className="text-xs text-[#D4AF37] capitalize flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {userRole === "admin" ? "Admin" : userRole || "Membre"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-[#0A2540] shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="border-t border-white/10 p-4">
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full border-white/30 text-white hover:bg-white hover:text-[#0A2540] hover:border-white rounded-[10px] bg-white/5 backdrop-blur-sm transition-all font-medium shadow-sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,40%,98%)] via-white to-[hsl(202,85%,95%)]">
      {/* Header - Always visible */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4 lg:px-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-[10px]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            {churchLogo ? (
              <img 
                src={churchLogo} 
                alt={churchName || "Logo"} 
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <Church className="h-5 w-5 text-primary" />
            )}
            <span className="font-bold text-foreground">{churchName || "EgliConnect"}</span>
          </div>

          {/* Church Name & Welcome - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{churchName || "EgliConnect"}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>Bonjour, {userName}</span>
                <span className="text-primary">🙏</span>
                <span className="hidden xl:inline">que la paix du Seigneur vous accompagne</span>
              </p>
            </div>
          </div>

          {/* User Avatar */}
          <Avatar className="h-10 w-10 border-2 border-primary shadow-md">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - Fixed */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:top-[73px] shadow-xl">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;

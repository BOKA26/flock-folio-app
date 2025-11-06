import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Church,
  Users,
  Megaphone,
  Heart,
  DollarSign,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Home,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [churchName, setChurchName] = useState<string>("");
  const [churchLogo, setChurchLogo] = useState<string | null>(null);
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
    { icon: Megaphone, label: "Annonces", path: "/announcements" },
    { icon: Users, label: "Membres", path: "/members", roles: ["admin", "operateur"] },
    { icon: Heart, label: "Prières", path: "/prayers" },
    { icon: DollarSign, label: "Dons", path: "/donations" },
    { icon: CreditCard, label: "Faire un don", path: "/online-donations" },
    { icon: Church, label: "Paramètres de l'église", path: "/church", roles: ["admin"] },
    { icon: BookOpen, label: "Base de Connaissances", path: "/knowledge", roles: ["admin", "operateur"] },
    { icon: Settings, label: "Paramètres", path: "/settings" },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#0A2540] to-[#1a3a5c] text-white">
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
              {userRole || "Membre"}
            </p>
          </div>
        </div>
      </div>

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
    <div className="min-h-screen gradient-blessing">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {churchLogo ? (
            <img 
              src={churchLogo} 
              alt={churchName || "Logo"} 
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <Church className="h-5 w-5 text-primary" />
          )}
          <span className="font-display font-bold text-foreground">{churchName || "EgliConnect"}</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card/80 backdrop-blur-sm border-r border-border/40">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="lg:pl-64 flex-1">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

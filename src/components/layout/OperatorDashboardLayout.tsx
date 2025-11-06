import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface OperatorDashboardLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

const OperatorDashboardLayout = ({ children }: OperatorDashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [churchName, setChurchName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Get user role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, full_name, church_id")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || (roleData.role !== "operateur" && roleData.role !== "admin")) {
      navigate("/member-space");
      return;
    }

    setOperatorName(roleData.full_name || session.user.email || "Opérateur");

    // Get church info
    const { data: churchData } = await supabase
      .from("churches")
      .select("nom, logo_url")
      .eq("id", roleData.church_id)
      .single();

    if (churchData) {
      setChurchName(churchData.nom);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Accueil", path: "/operator-dashboard" },
    { icon: Users, label: "Membres", path: "/members" },
    { icon: Calendar, label: "Cultes & Événements", path: "/announcements" },
    { icon: DollarSign, label: "Dons & Finances", path: "/donations" },
    { icon: BookOpen, label: "Ressources spirituelles", path: "/spiritual-resources" },
    { icon: Heart, label: "Prières", path: "/prayers" },
    { icon: MessageCircle, label: "Communication", path: "/communication" },
    { icon: BarChart3, label: "Rapports & Statistiques", path: "/reports" },
    { icon: HelpCircle, label: "Assistance", path: "/support" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0A2540] to-[#1a3a5c] text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">{churchName || "VC"}</h2>
            <p className="text-xs text-[#D4AF37] flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Opérateur
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-[#0A2540] shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="px-4 py-3 bg-white/5 rounded-[10px] backdrop-blur-sm">
          <p className="text-xs text-white/70">Connecté en tant que</p>
          <p className="font-medium text-sm truncate text-white">{operatorName}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full bg-white/5 border-white/30 text-white hover:bg-white hover:text-[#0A2540] hover:border-white rounded-[10px] backdrop-blur-sm transition-all font-medium shadow-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-200/30 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[hsl(var(--operator-gold))]" />
            <span className="font-semibold text-[hsl(var(--operator-deep-blue))]">
              {churchName}
            </span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[hsl(var(--operator-deep-blue))]">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] shadow-xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="lg:ml-0 mt-12 py-6 border-t border-blue-200/30 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm text-[hsl(var(--operator-deep-blue))]/70 font-medium">
              EgliConnect — Servir Dieu à travers la technologie 🕊️
            </p>
            <p className="text-xs text-[hsl(var(--operator-deep-blue))]/50 mt-1">
              © 2025 Tous droits réservés.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default OperatorDashboardLayout;

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
  Settings,
  LogOut,
  Menu,
  Home,
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
    { icon: Church, label: "Mon Église", path: "/church", roles: ["admin"] },
    { icon: Settings, label: "Paramètres", path: "/settings" },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          {churchLogo ? (
            <img 
              src={churchLogo} 
              alt={churchName || "Logo"} 
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <Church className="h-10 w-10 text-primary" />
          )}
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {churchName || "EgliConnect"}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">{userRole || "Membre"}</p>
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/40 p-4">
        <Button onClick={handleLogout} variant="outline" className="w-full">
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

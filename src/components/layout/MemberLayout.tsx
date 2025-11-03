import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  User,
  Heart,
  DollarSign,
  Megaphone,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  useEffect(() => {
    loadChurchInfo();
  }, []);

  const loadChurchInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: memberData } = await supabase
        .from("members")
        .select("*, churches(*)")
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        setMemberInfo(memberData);
        setChurchInfo(memberData.churches);
      }
    } catch (error) {
      console.error("Error loading church info:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/auth");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const menuItems = [
    { icon: Home, label: "Accueil", path: "/member-space" },
    { icon: User, label: "Mon Profil", path: "/member-profile" },
    { icon: DollarSign, label: "Mes Dons", path: "/member-donations" },
    { icon: Megaphone, label: "Annonces", path: "/member-announcements" },
    { icon: Heart, label: "Prières", path: "/member-prayers" },
    { icon: BookOpen, label: "Ressources", path: "/member-resources" },
    { icon: BarChart3, label: "Statistiques", path: "/member-stats" },
    { icon: Settings, label: "Paramètres", path: "/member-settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-blessing">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-soft"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-64 bg-card border-r shadow-divine
        `}
      >
        <div className="h-full flex flex-col">
          {/* Church Header */}
          <div className="p-6 border-b bg-gradient-heaven">
            {churchInfo?.logo_url ? (
              <img
                src={churchInfo.logo_url}
                alt="Logo"
                className="h-16 w-16 mx-auto rounded-lg object-cover shadow-lg mb-3"
              />
            ) : (
              <div className="h-16 w-16 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                <Home className="h-8 w-8 text-primary" />
              </div>
            )}
            <h2 className="text-center font-semibold text-sm text-white">
              {churchInfo?.nom || "Mon Église"}
            </h2>
            <p className="text-center text-xs text-white/80 mt-1">
              {memberInfo?.prenom} {memberInfo?.nom}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MemberLayout;

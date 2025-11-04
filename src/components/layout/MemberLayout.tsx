import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, Church, Calendar, DollarSign, BookOpen, Heart, Users, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      // Try to get member data
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("*, churches(*)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberData) {
        setMemberInfo(memberData);
        setChurchInfo(memberData.churches);
      } else if (!memberError || memberError.code === 'PGRST116') {
        // Member doesn't exist yet, try to get church from user_roles
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("church_id, churches(*)")
          .eq("user_id", user.id)
          .single();

        if (roleData) {
          setChurchInfo(roleData.churches);
          // Set basic member info from auth
          setMemberInfo({
            prenom: user.user_metadata?.nom_complet?.split(" ")[0] || "Membre",
            nom: user.user_metadata?.nom_complet?.split(" ").slice(1).join(" ") || "",
            email: user.email
          });
        }
      }
    } catch (error) {
      console.error("Error loading church info:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success("Déconnexion réussie");
  };

  const menuItems = [
    { icon: Home, label: "Accueil", path: "/member-space" },
    { icon: Church, label: "Mon Église", path: "/member-church" },
    { icon: Calendar, label: "Cultes & Événements", path: "/member-announcements" },
    { icon: DollarSign, label: "Dons & Finances", path: "/member-donations" },
    { icon: BookOpen, label: "Ressources Spirituelles", path: "/member-resources" },
    { icon: Heart, label: "Prières", path: "/member-prayers" },
    { icon: Users, label: "Communauté", path: "/member-community" },
    { icon: HelpCircle, label: "Aide & Support", path: "/member-support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-member-sky via-white to-member-blue">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-member glow-gold"
      >
        {sidebarOpen ? <X className="h-6 w-6 text-member-deep" /> : <Menu className="h-6 w-6 text-member-deep" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#0A2540] to-[#1a3a5c] shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo & Church Name */}
          <div className="mb-8 pb-6 border-b border-white/10">
            {churchInfo?.logo_url ? (
              <img 
                src={churchInfo.logo_url} 
                alt="Logo" 
                className="h-14 w-14 mx-auto mb-3 rounded-xl shadow-lg object-cover"
              />
            ) : (
              <div className="h-14 w-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg">
                <Church className="h-7 w-7 text-white" />
              </div>
            )}
            <h2 className="text-white font-bold text-base text-center">{churchInfo?.nom || "VC"}</h2>
            <p className="text-[#D4AF37] text-xs mt-1 text-center">👋 {memberInfo?.prenom} {memberInfo?.nom}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all ${
                    isActive
                      ? "bg-[#D4AF37] text-[#0A2540] shadow-lg font-medium"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile & Logout */}
          <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
            <Link
              to="/member-profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-white hover:bg-white/10 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-sm">
                {memberInfo?.prenom?.[0]}{memberInfo?.nom?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mon Profil</p>
              </div>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white rounded-[10px] bg-transparent"
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MemberLayout;

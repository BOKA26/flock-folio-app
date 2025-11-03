import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/layout/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Church, Calendar, Phone, Mail, MapPin, Edit, Save, Upload, Lock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const MemberProfile = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from("members")
        .select("*, churches(*)")
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        setMember(memberData);
        setChurchInfo(memberData.churches);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        setFormData({
          nom: memberData.nom || "",
          prenom: memberData.prenom || "",
          email: memberData.email || "",
          telephone: memberData.telephone || "",
          sexe: memberData.sexe || "",
        });
      }
    } catch (error) {
      console.error("Error loading member data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("members")
        .update(formData)
        .eq("id", member.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      loadMemberData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Photo de profil mise à jour");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Mon Profil
          </h1>
          <Button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Modifier
              </>
            )}
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-3xl bg-gradient-divine">
                    {member?.prenom?.[0]}{member?.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    disabled={uploading}
                  />
                  <Button 
                    size="icon" 
                    className="rounded-full h-10 w-10 shadow-3d bg-secondary hover:bg-secondary/90" 
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">
                  {member?.prenom} {member?.nom}
                </h2>
                <p className="text-muted-foreground">{member?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Membre depuis le {member?.date_adhesion ? new Date(member.date_adhesion).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label htmlFor="sexe">Sexe</Label>
                <Input
                  id="sexe"
                  value={formData.sexe}
                  onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Input
                  value={member?.statut || "N/A"}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Church Information */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />
              Mon Église
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {churchInfo?.logo_url ? (
                <img
                  src={churchInfo.logo_url}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Church className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{churchInfo?.nom}</h3>
                <p className="text-sm text-muted-foreground">{churchInfo?.description}</p>
              </div>
            </div>

            {churchInfo?.verset_clef && (
              <div className="p-4 bg-gradient-divine rounded-lg border-l-4 border-l-primary">
                <p className="text-sm italic">"{churchInfo.verset_clef}"</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {churchInfo?.adresse && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Adresse</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.adresse}</p>
                  </div>
                </div>
              )}
              {churchInfo?.contact && (
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Contact</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.contact}</p>
                  </div>
                </div>
              )}
              {churchInfo?.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <p className="text-sm text-muted-foreground">{churchInfo.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Adhésion</p>
                  <p className="text-sm text-muted-foreground">
                    {member?.date_adhesion ? new Date(member.date_adhesion).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Mes Activités
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/member/donations')}
            >
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Mes dons</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/member/announcements')}
            >
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Événements</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/member/settings')}
            >
              <Lock className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Sécurité</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberProfile;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Vérifier l'authentification de l'utilisateur appelant
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role, church_id')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Permission refusée. Seuls les admins peuvent inviter des utilisateurs.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.fullName ?? '').trim();
    const role = body.role;
    const churchId = body.churchId;

    // Validation email côté serveur (plus stricte que le simple format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Adresse email invalide. Exemple: jean@gmail.com ou jean@exemple.com' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const domain = email.split('@')[1] || '';
    const freeProviders = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','live.com'];
    if (freeProviders.some(p => domain.endsWith('.' + p))) {
      return new Response(
        JSON.stringify({ error: "Adresse email invalide: n'utilisez pas de sous-domaine pour Gmail/Outlook/etc. Utilisez par ex. nom@gmail.com" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que c'est bien l'église de l'admin
    if (churchId !== roleData.church_id) {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez inviter que des utilisateurs dans votre église' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Envoyer l'invitation
    const origin = req.headers.get('origin');
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        church_id: churchId,
        role: role,
      },
      ...(origin ? { redirectTo: `${origin}/auth` } : {}),
    });

    if (inviteError) {
      console.error('Erreur invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le rôle pour le nouvel utilisateur
    if (inviteData.user) {
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: inviteData.user.id,
          church_id: churchId,
          role: role,
          email: email,
          full_name: fullName,
        });

      if (roleInsertError) {
        console.error('Erreur création rôle:', roleInsertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: inviteData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

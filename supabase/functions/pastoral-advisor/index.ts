import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { churchData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY n'est pas configuré");
    }

    // Construire le contexte avec les données de l'église
    const contextPrompt = `
Vous êtes un conseiller pastoral intelligent pour la gestion d'église. 
Analysez les données suivantes et donnez 3-5 recommandations concrètes et actionnables.

Données de l'église:
- Nombre total de membres: ${churchData.totalMembers}
- Membres actifs: ${churchData.activeMembers}
- Total des dons ce mois: ${churchData.totalDonations} FCFA
- Événements prévus: ${churchData.upcomingEvents}
- Demandes de prière en attente: ${churchData.pendingPrayers}
- Nouveaux membres ce mois: ${churchData.newMembers}
- Taux de fréquentation moyen: ${churchData.attendanceRate}%

Donnez des suggestions pratiques pour améliorer l'engagement, la communication ou la gestion spirituelle.
Répondez en français, de manière bienveillante et pastorale.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Vous êtes un conseiller pastoral expérimenté qui aide les églises à mieux gérer leur communauté. Donnez des conseils pratiques et bienveillants."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Paiement requis, veuillez ajouter des crédits à votre espace Lovable AI." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("Erreur du service IA:", response.status, errorText);
      throw new Error("Erreur lors de l'appel au service IA");
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || "Aucune suggestion disponible";

    return new Response(
      JSON.stringify({ suggestion }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erreur dans pastoral-advisor:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

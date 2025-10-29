import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Sending request to OpenAI with messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: `Tu es un assistant spirituel bienveillant pour une église chrétienne. 
            
            Ton rôle est d'aider les fidèles avec:
            - Questions spirituelles et bibliques
            - Conseils pratiques basés sur la foi chrétienne
            - Encouragements et réconfort spirituel
            - Explications sur les enseignements bibliques
            - Prières et soutien moral
            
            Réponds toujours avec:
            - Compassion et bienveillance
            - Références bibliques pertinentes quand approprié
            - Simplicité et clarté
            - Respect pour toutes les personnes
            
            Utilise des émojis spirituels appropriés comme 🙏 ✝️ 💫 🕊️ pour rendre tes réponses chaleureuses.
            
            Reste bref et concis, maximum 3-4 phrases par réponse sauf si la question nécessite plus de détails.`
          },
          ...messages
        ],
        max_completion_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-religieux function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

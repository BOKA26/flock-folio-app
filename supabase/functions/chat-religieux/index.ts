import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_TEMPLATE = (churchName: string) => `Tu es l'assistant officiel et bienveillant de l'église "${churchName}".
Tu réponds UNIQUEMENT avec les informations fournies par le CONTEXTE/FAQ ci-dessous.
Si l'information n'est pas disponible dans le contexte, tu le dis clairement et tu proposes une action (contacter l'église, consulter la page Annonces, faire un don, etc.).
Tu refuses les conseils médicaux/juridiques.
Tu restes bref, clair, pastoral et utile.
Tu réponds en français, avec un ton respectueux et chaleureux.`;

function buildPrompt({ faq, context, question }: { faq: string; context: string; question: string }) {
  return `[FAQ PRIORITAIRE]
${faq || "Aucune FAQ prioritaire disponible."}

[CONTEXTE]
${context || "Aucun extrait pertinent trouvé."}

[QUESTION]
${question}

[INSTRUCTIONS]
1) Réponds d'abord si la FAQ couvre déjà la question.
2) Sinon, appuie-toi sur le CONTEXTE.
3) Si tu n'as pas assez d'info, réponds: "Je n'ai pas cette information pour le moment. Contactez l'église via la page Contacts."
4) Termine par une suggestion d'action (ex: "Voir la page Annonces", "Faire un don", "Contacter le secrétariat").`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, churchId, churchName } = await req.json();
    
    if (!churchId || !churchName) {
      throw new Error('churchId and churchName are required');
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    console.log(`Processing question for church ${churchName}: ${lastUserMessage}`);

    // 1) Chercher une FAQ très proche
    const { data: faqs } = await supabase
      .from('kb_faq')
      .select('question,answer')
      .eq('church_id', churchId)
      .ilike('question', `%${lastUserMessage.slice(0, 40)}%`)
      .limit(3);

    const faqText = (faqs || []).map((f: any) => `Q: ${f.question}\nR: ${f.answer}`).join('\n---\n');
    console.log(`Found ${faqs?.length || 0} FAQ matches`);

    // 2) Créer l'embedding de la question
    const embeddingResp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-large',
        input: lastUserMessage,
      }),
    });

    if (!embeddingResp.ok) {
      const errorText = await embeddingResp.text();
      console.error('OpenAI embeddings error:', embeddingResp.status, errorText);
      throw new Error(`OpenAI embeddings error: ${embeddingResp.status}`);
    }

    const embeddingData = await embeddingResp.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // 3) Récupération des chunks similaires
    const { data: chunks, error: chunksError } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_count: 6,
      filter_church_id: churchId,
    });

    if (chunksError) {
      console.error('Error matching chunks:', chunksError);
      throw chunksError;
    }

    const context = (chunks || []).map((c: any) => c.content).join('\n---\n');
    console.log(`Found ${chunks?.length || 0} relevant chunks`);

    // 4) Construire le prompt avec FAQ + contexte
    const systemPrompt = SYSTEM_TEMPLATE(churchName);
    const userPrompt = buildPrompt({ faq: faqText, context, question: lastUserMessage });

    // 5) Appel OpenAI pour la réponse
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        max_completion_tokens: 600,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('OpenAI chat error:', chatResponse.status, errorText);
      throw new Error(`OpenAI chat error: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const assistantMessage = chatData.choices[0].message.content;

    console.log('RAG response generated successfully');

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-religieux function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_TEXT_LENGTH = 500000; // 500KB of text

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { churchId, title, text, sourceType = 'text' } = await req.json();

    // Input validation
    if (!churchId || !title || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: churchId, title, text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (title.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Title too long - maximum 500 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long - maximum ${MAX_TEXT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has admin or operateur role for the church
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _church_id: churchId,
      _role: 'admin'
    });

    const { data: hasOperateurRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _church_id: churchId,
      _role: 'operateur'
    });

    if (!hasAdminRole && !hasOperateurRole) {
      console.error('Access denied - user does not have admin/operateur role:', user.id, churchId);
      return new Response(
        JSON.stringify({ error: 'Access denied - Admin or operateur role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated request from user ${user.id} ingesting document: ${title} for church ${churchId}`);

    // 1) Créer un enregistrement document
    const { data: doc, error: docError } = await supabase
      .from('kb_documents')
      .insert({ 
        church_id: churchId, 
        title, 
        source_type: sourceType 
      })
      .select()
      .single();

    if (docError) throw docError;
    console.log(`Document created with id: ${doc.id}`);

    // 2) Découper le texte en chunks (900 caractères avec chevauchement de 100)
    const chunkSize = 900;
    const chunkOverlap = 100;
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }

    console.log(`Text split into ${chunks.length} chunks`);

    // 3) Créer les embeddings par batch
    const batchSize = 50;
    const allRows = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      
      const embeddingsResp = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-large',
          input: batch,
        }),
      });

      if (!embeddingsResp.ok) {
        const errorText = await embeddingsResp.text();
        console.error('OpenAI embeddings error:', embeddingsResp.status, errorText);
        throw new Error(`OpenAI API error: ${embeddingsResp.status}`);
      }

      const embeddingsData = await embeddingsResp.json();
      
      for (let j = 0; j < batch.length; j++) {
        allRows.push({
          church_id: churchId,
          document_id: doc.id,
          chunk_index: i + j,
          content: batch[j],
          embedding: embeddingsData.data[j].embedding,
        });
      }
    }

    console.log(`Inserting ${allRows.length} chunks into database`);

    // 4) Insérer tous les chunks
    const { error: chunksError } = await supabase
      .from('kb_chunks')
      .insert(allRows);

    if (chunksError) throw chunksError;

    console.log(`Successfully ingested document with ${allRows.length} chunks`);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        documentId: doc.id, 
        count: allRows.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ingest-document function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

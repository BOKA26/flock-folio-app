import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Paystack webhook received');

    // Verify Paystack signature
    const paystackSignature = req.headers.get('x-paystack-signature');
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    
    // Verify signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(secret + body)
    );
    const computedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (paystackSignature !== computedSignature) {
      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event:', event.event);

    // Handle successful charge
    if (event.event === 'charge.success') {
      const data = event.data;
      console.log('Processing successful charge:', data.reference);

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Extract metadata
      const metadata = data.metadata || {};
      const churchId = metadata.church_id;
      const donationType = metadata.donation_type || 'offrande';

      if (!churchId) {
        console.error('Missing church_id in metadata');
        return new Response(
          JSON.stringify({ error: 'Invalid metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if donation already exists
      const { data: existingDonation } = await supabase
        .from('donations')
        .select('id')
        .eq('reference_transaction', data.reference)
        .single();

      if (existingDonation) {
        console.log('Donation already recorded');
        return new Response(
          JSON.stringify({ message: 'Donation already recorded' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert donation
      const { error: insertError } = await supabase.from('donations').insert({
        montant: data.amount / 100, // Convert from kobo/cents
        type_don: donationType,
        church_id: churchId,
        reference_transaction: data.reference,
        statut: 'completed',
        date_don: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting donation:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save donation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Donation saved successfully');
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

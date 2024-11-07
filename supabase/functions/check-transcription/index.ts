import { serve } from 'https://deno.fresh.dev/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcriptionId } = await req.json();

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('URL') ?? '',
      Deno.env.get('SERVICE_ROLE') ?? ''
    );

    // Get transcription record
    const { data: transcription, error: getError } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single();

    if (getError) throw getError;
    if (!transcription.external_id) throw new Error('No external ID found');

    // Check status from AssemblyAI
    const statusResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcription.external_id}`,
      {
        headers: {
          'Authorization': Deno.env.get('ASSEMBLYAI_API_KEY') ?? '',
        },
      }
    );

    if (!statusResponse.ok) {
      throw new Error('Failed to check transcription status');
    }

    const result = await statusResponse.json();

    // Update transcription record based on status
    if (result.status === 'completed') {
      await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'completed',
          transcription_text: result.text,
        })
        .eq('id', transcriptionId);
    } else if (result.status === 'error') {
      await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', transcriptionId);
    }

    return new Response(
      JSON.stringify({ status: result.status, text: result.text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
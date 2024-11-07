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
    
    if (!transcriptionId) {
      throw new Error('Transcription ID is required');
    }

    const apiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      throw new Error('AssemblyAI API key is not configured');
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Get transcription record
    const { data: transcription, error: getError } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single();

    if (getError) {
      console.error('Database fetch error:', getError);
      throw new Error('Failed to fetch transcription record');
    }

    if (!transcription.external_id) {
      throw new Error('No external ID found for transcription');
    }

    // Check status from AssemblyAI
    const statusResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcription.external_id}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      console.error('AssemblyAI status error:', errorData);
      throw new Error(`Failed to check transcription status: ${statusResponse.statusText}`);
    }

    const result = await statusResponse.json();

    // Update transcription record based on status
    if (result.status === 'completed') {
      const { error: updateError } = await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'completed',
          transcription_text: result.text,
        })
        .eq('id', transcriptionId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error('Failed to update transcription record');
      }
    } else if (result.status === 'error') {
      const { error: updateError } = await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', transcriptionId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error('Failed to update transcription record');
      }
    }

    return new Response(
      JSON.stringify({
        status: result.status,
        text: result.text,
        error: result.error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

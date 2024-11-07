// @ts-ignore: Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { videoUrl, transcriptionId } = await req.json();

    if (!videoUrl || !transcriptionId) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('DB_URL');
    const supabaseKey = Deno.env.get('SERVICE_KEY');
    const assemblyKey = Deno.env.get('ASSEMBLYAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !assemblyKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_detection: true,
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(`AssemblyAI Error: ${error.message || 'Failed to submit transcription job'}`);
    }

    const { id: assemblyId } = await submitResponse.json();

    const { error: updateError } = await supabaseAdmin
      .from('transcriptions')
      .update({
        external_id: assemblyId,
        status: 'processing'
      })
      .eq('id', transcriptionId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ id: transcriptionId, status: 'processing', external_id: assemblyId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Transcription error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
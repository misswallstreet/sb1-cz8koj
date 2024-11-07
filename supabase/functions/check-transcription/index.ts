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
    const { transcriptionId } = await req.json();

    if (!transcriptionId) {
      throw new Error('Missing transcription ID');
    }

    const supabaseUrl = Deno.env.get('DB_URL');
    const supabaseKey = Deno.env.get('SERVICE_KEY');
    const assemblyKey = Deno.env.get('ASSEMBLYAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !assemblyKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { data: transcription, error: getError } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single();

    if (getError) throw getError;
    if (!transcription?.external_id) {
      throw new Error('No external ID found for transcription');
    }

    const statusResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcription.external_id}`,
      {
        headers: {
          'Authorization': assemblyKey,
        },
      }
    );

    if (!statusResponse.ok) {
      const error = await statusResponse.json();
      throw new Error(`AssemblyAI Error: ${error.message || 'Failed to check transcription status'}`);
    }

    const result = await statusResponse.json();

    const updateData: Record<string, any> = {
      status: result.status === 'completed' ? 'completed' : result.status === 'error' ? 'failed' : 'processing'
    };

    if (result.status === 'completed') {
      updateData.transcription_text = result.text;
    } else if (result.status === 'error') {
      updateData.error_message = result.error;
    }

    const { error: updateError } = await supabaseAdmin
      .from('transcriptions')
      .update(updateData)
      .eq('id', transcriptionId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        id: transcriptionId,
        status: updateData.status,
        transcription_text: updateData.transcription_text,
        error_message: updateData.error_message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Status check error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
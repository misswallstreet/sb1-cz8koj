// @ts-ignore: Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateMinutes(text: string): number {
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = words / 150;
  return Math.max(0.1, Number(minutes.toFixed(2)));
}

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

    // Get transcription details
    const { data: transcription, error: getError } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single();

    if (getError) {
      console.error('Error fetching transcription:', getError);
      throw getError;
    }

    if (!transcription?.external_id) {
      throw new Error('No external ID found for transcription');
    }

    // Check transcription status with AssemblyAI
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

    if (result.status === 'completed' && result.text) {
      const minutes = calculateMinutes(result.text);
      console.log(`Calculated minutes for transcription ${transcriptionId}:`, minutes);

      // First, verify the current state
      const { data: currentState, error: stateError } = await supabaseAdmin
        .from('transcriptions')
        .select('minutes, status')
        .eq('id', transcriptionId)
        .single();

      if (stateError) {
        console.error('Error checking current state:', stateError);
        throw stateError;
      }

      console.log('Current state:', currentState);

      // Update with minutes
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'completed',
          transcription_text: result.text,
          minutes: minutes
        })
        .eq('id', transcriptionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating transcription:', updateError);
        throw updateError;
      }

      console.log('Update result:', updateData);

      return new Response(
        JSON.stringify({
          id: transcriptionId,
          status: 'completed',
          transcription_text: result.text,
          minutes: minutes
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (result.status === 'error') {
      const { error: updateError } = await supabaseAdmin
        .from('transcriptions')
        .update({
          status: 'failed',
          error_message: result.error
        })
        .eq('id', transcriptionId);

      if (updateError) {
        console.error('Error updating failed status:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          id: transcriptionId,
          status: 'failed',
          error_message: result.error
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Still processing
    return new Response(
      JSON.stringify({
        id: transcriptionId,
        status: 'processing'
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
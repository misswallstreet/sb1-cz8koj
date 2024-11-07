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
    const { videoUrl } = await req.json();

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('URL') ?? '',
      Deno.env.get('SERVICE_ROLE') ?? ''
    );

    // Create a new transcription record
    const { data: transcription, error: insertError } = await supabaseAdmin
      .from('transcriptions')
      .insert([
        {
          video_url: videoUrl,
          status: 'processing',
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Submit transcription to AssemblyAI
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': Deno.env.get('ASSEMBLYAI_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_detection: true,
      }),
    });

    if (!submitResponse.ok) {
      throw new Error('Failed to submit transcription job');
    }

    const { id: assemblyId } = await submitResponse.json();

    // Update transcription record with AssemblyAI ID
    await supabaseAdmin
      .from('transcriptions')
      .update({
        external_id: assemblyId,
      })
      .eq('id', transcription.id);

    return new Response(
      JSON.stringify({ id: transcription.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
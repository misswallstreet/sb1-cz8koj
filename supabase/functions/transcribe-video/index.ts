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
    
    if (!videoUrl) {
      throw new Error('Video URL is required');
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

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to create transcription record');
    }

    // Submit transcription to AssemblyAI
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_detection: true,
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      console.error('AssemblyAI error:', errorData);
      throw new Error(`Failed to submit transcription job: ${submitResponse.statusText}`);
    }

    const assemblyData = await submitResponse.json();
    
    if (!assemblyData.id) {
      throw new Error('No transcription ID received from AssemblyAI');
    }

    // Update transcription record with AssemblyAI ID
    const { error: updateError } = await supabaseAdmin
      .from('transcriptions')
      .update({
        external_id: assemblyData.id,
      })
      .eq('id', transcription.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update transcription record');
    }

    return new Response(
      JSON.stringify({ 
        id: transcription.id,
        status: 'processing',
        message: 'Transcription job created successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

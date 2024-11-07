import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const assemblyAiKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface TranscriptionJob {
  id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_text?: string;
  error_message?: string;
  external_id?: string;
  user_id: string;
  filename?: string;
  minutes?: number;
}

export class TranscriptionError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

function calculateMinutes(text: string): number {
  // Average speaking rate is about 150 words per minute
  const words = text.split(/\s+/).length;
  return Math.max(0.5, Math.ceil(words / 150)); // Minimum of 0.5 minutes
}

export async function uploadVideo(file: File): Promise<{ url: string; filename: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2);
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (error) {
      throw new TranscriptionError('Failed to upload video', error);
    }

    if (!data?.path) {
      throw new TranscriptionError('Upload successful but file path is missing');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new TranscriptionError('Failed to generate public URL for uploaded video');
    }

    return { url: publicUrl, filename: file.name };
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error;
    }
    throw new TranscriptionError('Failed to upload video', error);
  }
}

export async function createTranscriptionJob(videoUrl: string, filename?: string): Promise<TranscriptionJob> {
  if (!assemblyAiKey) {
    throw new TranscriptionError('AssemblyAI API key not configured');
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new TranscriptionError('User must be authenticated to create transcription jobs');
    }

    const { data, error } = await supabase
      .from('transcriptions')
      .insert([
        {
          video_url: videoUrl,
          status: 'pending',
          user_id: user.id,
          filename: filename
        }
      ])
      .select()
      .single();

    if (error) {
      throw new TranscriptionError('Failed to create transcription record', error);
    }

    if (!data) {
      throw new TranscriptionError('No data returned from transcription creation');
    }

    try {
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': assemblyAiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: videoUrl,
          language_detection: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TranscriptionError(
          `AssemblyAI Error: ${errorData.error || 'Unknown error'}`,
          errorData
        );
      }

      const result = await response.json();
      
      if (!result.id) {
        throw new TranscriptionError('No transcription ID returned from AssemblyAI');
      }

      const { error: updateError } = await supabase
        .from('transcriptions')
        .update({
          external_id: result.id,
          status: 'processing'
        })
        .eq('id', data.id);

      if (updateError) {
        throw new TranscriptionError('Failed to update transcription status', updateError);
      }

      return {
        ...data,
        status: 'processing',
        external_id: result.id
      };
    } catch (error) {
      // Clean up the transcription record if the API call fails
      await supabase
        .from('transcriptions')
        .delete()
        .eq('id', data.id);

      throw error;
    }
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error;
    }
    throw new TranscriptionError('Failed to start transcription process', error);
  }
}

export async function getTranscriptionStatus(jobId: string): Promise<TranscriptionJob> {
  if (!assemblyAiKey) {
    throw new TranscriptionError('AssemblyAI API key not configured');
  }

  try {
    const { data: transcription, error: getError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', jobId)
      .single();

    if (getError) {
      throw new TranscriptionError('Failed to fetch transcription status', getError);
    }

    if (!transcription?.external_id) {
      throw new TranscriptionError('No external ID found for transcription');
    }

    const response = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcription.external_id}`,
      {
        headers: {
          'Authorization': assemblyAiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new TranscriptionError(
        `AssemblyAI Error: ${errorData.error || 'Unknown error'}`,
        errorData
      );
    }

    const result = await response.json();

    const updateData: Record<string, any> = {
      status: result.status === 'completed' ? 'completed' : result.status === 'error' ? 'failed' : 'processing'
    };

    if (result.status === 'completed') {
      updateData.transcription_text = result.text;
      updateData.minutes = calculateMinutes(result.text);
    } else if (result.status === 'error') {
      updateData.error_message = result.error;
    }

    const { error: updateError } = await supabase
      .from('transcriptions')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      throw new TranscriptionError('Failed to update transcription status', updateError);
    }

    return {
      ...transcription,
      ...updateData
    };
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error;
    }
    throw new TranscriptionError('Failed to check transcription status', error);
  }
}
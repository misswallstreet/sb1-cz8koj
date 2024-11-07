import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

interface TranscriptionJob {
  id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_text?: string;
  error_message?: string;
  external_id?: string;
}

export async function uploadVideo(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filePath, file);

  if (error) throw error;
  return data.path;
}

export async function createTranscriptionJob(videoUrl: string): Promise<TranscriptionJob> {
  const { data, error } = await supabase.functions.invoke('transcribe-video', {
    body: { videoUrl }
  });

  if (error) throw error;
  return data;
}

export async function getTranscriptionStatus(jobId: string): Promise<TranscriptionJob> {
  const { data, error } = await supabase.functions.invoke('check-transcription', {
    body: { transcriptionId: jobId }
  });

  if (error) throw error;
  return data;
}
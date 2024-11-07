import React, { useState } from 'react';
import { FileVideo } from 'lucide-react';
import { useAuth } from './AuthContext';
import { VideoUpload } from './VideoUpload';
import { TranscriptionStatus } from './TranscriptionStatus';
import { supabase } from '../lib/supabase';
import { uploadVideo, createTranscriptionJob, getTranscriptionStatus } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const handleVideoSelect = async (fileOrUrl: File | string) => {
    setTranscriptionStatus('uploading');
    setProgress(0);
    
    try {
      let videoUrl: string;

      if (fileOrUrl instanceof File) {
        const path = await uploadVideo(fileOrUrl);
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(path);
        videoUrl = publicUrl;
      } else {
        videoUrl = fileOrUrl;
      }

      setTranscriptionStatus('transcribing');
      
      const job = await createTranscriptionJob(videoUrl);
      setCurrentJobId(job.id);

      const pollInterval = setInterval(async () => {
        try {
          const status = await getTranscriptionStatus(job.id);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setTranscriptionStatus('completed');
            setTranscriptionResult(status.transcription_text);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setTranscriptionStatus('error');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setTranscriptionStatus('error');
          console.error('Error polling transcription status:', error);
        }
      }, 5000);

    } catch (error) {
      setTranscriptionStatus('error');
      console.error('Transcription error:', error);
      toast.error('Failed to process video');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FileVideo className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Video Transcriber</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">{user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Upload Video for Transcription
          </h1>
          <VideoUpload onVideoSelect={handleVideoSelect} />
          <TranscriptionStatus
            status={transcriptionStatus}
            progress={progress}
            result={transcriptionResult}
          />
        </div>
      </main>
    </div>
  );
};
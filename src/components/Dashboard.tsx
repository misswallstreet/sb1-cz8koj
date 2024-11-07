import React, { useState } from 'react';
import { FileVideo, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import { VideoUpload } from './VideoUpload';
import { TranscriptionStatus } from './TranscriptionStatus';
import { supabase } from '../lib/supabase';
import { uploadVideo, createTranscriptionJob, getTranscriptionStatus, TranscriptionError } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error instanceof TranscriptionError) {
      message = error.message;
      if (error.details?.message) {
        message += `: ${error.details.message}`;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    setErrorMessage(message);
    setTranscriptionStatus('error');
    toast.error(message);
  };

  const handleVideoSelect = async (fileOrUrl: File | string) => {
    if (!user) {
      toast.error('Please sign in to process videos');
      return;
    }

    setTranscriptionStatus('uploading');
    setProgress(0);
    setErrorMessage('');
    setCurrentJobId(null);
    setTranscriptionResult('');
    
    try {
      let videoUrl: string;

      if (fileOrUrl instanceof File) {
        videoUrl = await uploadVideo(fileOrUrl);
        toast.success('Video uploaded successfully!');
      } else {
        videoUrl = fileOrUrl;
      }

      setTranscriptionStatus('transcribing');
      
      const job = await createTranscriptionJob(videoUrl);
      
      if (!job?.id) {
        throw new TranscriptionError('Failed to create transcription job');
      }
      
      setCurrentJobId(job.id);
      toast.success('Transcription started!');

      let retryCount = 0;
      const maxRetries = 3;

      const pollInterval = setInterval(async () => {
        if (retryCount >= maxRetries) {
          clearInterval(pollInterval);
          throw new TranscriptionError('Failed to check transcription status after multiple attempts');
        }

        try {
          if (!job.id) {
            clearInterval(pollInterval);
            return;
          }

          const status = await getTranscriptionStatus(job.id);
          
          if (status.status === 'completed' && status.transcription_text) {
            clearInterval(pollInterval);
            setTranscriptionStatus('completed');
            setTranscriptionResult(status.transcription_text);
            toast.success('Transcription completed!');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            throw new TranscriptionError(status.error_message || 'Transcription failed');
          }
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            clearInterval(pollInterval);
            handleError(error);
          }
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FileVideo className="h-8 w-8 text-[#81b29a]" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Transcriptor</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
              >
                <LogOut className="h-4 w-4 mr-2" />
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
            error={errorMessage}
          />
        </div>
      </main>
    </div>
  );
};

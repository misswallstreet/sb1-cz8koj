import React, { useState, useEffect } from 'react';
import { FileVideo, LogOut, Clock } from 'lucide-react';
import { useAuth } from './AuthContext';
import { VideoUpload } from './VideoUpload';
import { TranscriptionStatus } from './TranscriptionStatus';
import { TranscriptionHistory } from './TranscriptionHistory';
import { Footer } from './Footer';
import { supabase } from '../lib/supabase';
import { uploadVideo, createTranscriptionJob, getTranscriptionStatus, TranscriptionError } from '../lib/supabase';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      loadTranscriptions();
      calculateTotalMinutes();
    }
  }, [user]);

  const calculateTotalMinutes = async () => {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('minutes')
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      if (error) throw error;

      const total = data.reduce((sum, item) => sum + (item.minutes || 0), 0);
      setTotalMinutes(total);
    } catch (error) {
      console.error('Error calculating total minutes:', error);
    }
  };

  const loadTranscriptions = async (startIndex = 0) => {
    if (loading) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (startIndex === 0) {
        setTranscriptions(data);
      } else {
        setTranscriptions(prev => [...prev, ...data]);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      toast.error('Failed to load transcriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    loadTranscriptions(transcriptions.length);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleVideoSelect = async (fileOrUrl: File | string) => {
    setTranscriptionStatus('uploading');
    setProgress(0);
    setErrorMessage(undefined);
    setTranscriptionResult(undefined);

    try {
      let videoUrl: string;
      if (fileOrUrl instanceof File) {
        const uploadResult = await uploadVideo(fileOrUrl);
        videoUrl = uploadResult.url;
        setProgress(50);
      } else {
        videoUrl = fileOrUrl;
        setProgress(50);
      }

      setTranscriptionStatus('transcribing');
      const transcription = await createTranscriptionJob(videoUrl);
      
      if (transcription.status === 'failed') {
        throw new TranscriptionError(transcription.error_message || 'Transcription failed');
      }

      setTranscriptionResult(transcription.transcription_text);
      setTranscriptionStatus('completed');
      loadTranscriptions();
      calculateTotalMinutes();
    } catch (error) {
      setTranscriptionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDownload = (transcription: any) => {
    if (!transcription.transcription_text) {
      toast.error('No transcription text available');
      return;
    }

    const blob = new Blob([transcription.transcription_text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${transcription.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FileVideo className="h-8 w-8 text-[#81b29a]" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Transcriptor</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1 text-[#81b29a]" />
                <span>{totalMinutes.toFixed(1)} minutes transcribed</span>
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
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Transcription History
          </h2>
          <TranscriptionHistory
            transcriptions={transcriptions}
            onDownload={handleDownload}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={loading}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};
import React from 'react';
import { Download, Clock, Loader2, XCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Transcription {
  id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_text?: string;
  created_at: string;
  filename?: string;
}

interface TranscriptionHistoryProps {
  transcriptions: Transcription[];
  onDownload: (transcription: Transcription) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

export const TranscriptionHistory: React.FC<TranscriptionHistoryProps> = ({
  transcriptions,
  onDownload,
  hasMore,
  onLoadMore,
  loading,
}) => {
  if (!transcriptions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No transcription history yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-[#81b29a]" />;
      default:
        return null;
    }
  };

  const getDisplayName = (transcription: Transcription) => {
    if (transcription.filename) {
      return transcription.filename;
    }
    try {
      return new URL(transcription.video_url).pathname.split('/').pop() || 'Untitled';
    } catch {
      return 'Untitled';
    }
  };

  return (
    <div className="space-y-4">
      {transcriptions.map((transcription) => (
        <div
          key={transcription.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(transcription.status)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayName(transcription)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(transcription.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            {transcription.status === 'completed' && (
              <button
                onClick={() => onDownload(transcription)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-[#81b29a] bg-[#81b29a]/10 hover:bg-[#81b29a]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            )}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
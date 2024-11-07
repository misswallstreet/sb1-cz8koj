import React from 'react';
import { Loader2 } from 'lucide-react';

interface TranscriptionStatusProps {
  status: 'idle' | 'uploading' | 'transcribing' | 'completed' | 'error';
  progress?: number;
  result?: string;
}

export const TranscriptionStatus: React.FC<TranscriptionStatusProps> = ({
  status,
  progress = 0,
  result
}) => {
  return (
    <div className="mt-8">
      {status !== 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status !== 'completed' && status !== 'error' && (
                <Loader2 className="animate-spin h-5 w-5 mr-2 text-purple-500" />
              )}
              <span className="font-medium capitalize">{status}</span>
            </div>
            {(status === 'uploading' || status === 'transcribing') && (
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            )}
          </div>

          {status === 'completed' && result && (
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Transcription Result:</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{result}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700">An error occurred during transcription. Please try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
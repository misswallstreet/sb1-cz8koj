import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TranscriptionStatusProps {
  status: 'idle' | 'uploading' | 'transcribing' | 'completed' | 'error';
  progress?: number;
  result?: string;
  error?: string;
}

export const TranscriptionStatus: React.FC<TranscriptionStatusProps> = ({
  status,
  progress = 0,
  result,
  error
}) => {
  return (
    <div className="mt-8">
      {status !== 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status === 'completed' && (
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
              )}
              {(status === 'uploading' || status === 'transcribing') && (
                <Loader2 className="animate-spin h-5 w-5 mr-2 text-[#81b29a]" />
              )}
              <span className="font-medium capitalize">{status}</span>
            </div>
            {(status === 'uploading' || status === 'transcribing') && (
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            )}
          </div>

          {status === 'completed' && result && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transcription Result:</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{result}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-[#81b29a] bg-[#81b29a]/10 hover:bg-[#81b29a]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700">{error || 'An error occurred during transcription. Please try again.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
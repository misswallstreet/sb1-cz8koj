import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link as LinkIcon, FileVideo } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface VideoUploadProps {
  onVideoSelect: (file: File | string) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoSelect }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Please sign in to upload videos');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      onVideoSelect(file);
    }
  }, [onVideoSelect, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    disabled: !user
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to add videos');
      return;
    }

    if (videoUrl.trim()) {
      onVideoSelect(videoUrl);
      setVideoUrl('');
    }
  };

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-[#81b29a] bg-[#81b29a]/10' : 'border-gray-300 hover:border-[#81b29a]'}
          ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {!user
            ? 'Please sign in to upload videos'
            : isDragActive
            ? 'Drop the video here...'
            : 'Drag & drop a video file here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Supported formats: MP4, MOV, AVI, MKV (max 50MB)</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste video URL here"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#81b29a] focus:border-[#81b29a]"
          disabled={!user}
        />
        <button
          type="submit"
          disabled={!user}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Add URL
        </button>
      </form>
    </div>
  );
};
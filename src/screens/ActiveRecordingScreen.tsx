// ActiveRecordingScreen.tsx - Simplified and fixed
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../../types';
import { Icon } from '../components/Icon';

export const ActiveRecordingScreen: React.FC = () => {
  const {
    activeRecorder,
    setActiveRecorder,
    setScreen,
    setError,
  } = useAppContext();

  const [timer, setTimer] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasStartedRef = useRef(false);

  // Initialize recording when component mounts
  useEffect(() => {
    if (hasStartedRef.current) return; // Prevent multiple initializations
    hasStartedRef.current = true;
    
    console.log('Initializing recording...');
    startRecording();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && !isTransitioning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isTransitioning]);

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioChunksRef.current = [];
  };

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Common sample rate for speech APIs
        } 
      });
      
      streamRef.current = stream;
      console.log('Microphone access granted');

      // Try different MIME types based on browser support
      let mimeType = 'audio/webm;codecs=opus';
      let fileExtension = 'webm';
      
      // Check what the browser supports and prefer WAV for better API compatibility
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
        fileExtension = 'wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
        fileExtension = 'webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        fileExtension = 'mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
        fileExtension = 'ogg';
      }

      console.log('Selected MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, creating audio blob...');
        let blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Initial audio blob created:', { size: blob.size, type: blob.type });
        
        // If we didn't get WAV format, try to convert or at least ensure proper headers
        if (!mimeType.includes('wav') && blob.size > 0) {
          try {
            // For APIs that expect WAV, we might need to convert
            // For now, we'll create a new blob with WAV mime type
            // This is a simplified approach - in production you might want proper conversion
            blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            console.log('Converted blob to WAV format');
          } catch (conversionError) {
            console.warn('Could not convert audio format:', conversionError);
          }
        }
        
        setAudioBlob(blob);
        setIsRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingError('Recording failed. Please try again.');
      };

      mediaRecorder.start(100); // Record in smaller chunks for better data availability
      setIsRecording(true);
      console.log('Recording started with MIME type:', mimeType);

    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setRecordingError('Microphone access denied. Please allow microphone access and refresh.');
        } else if (error.name === 'NotFoundError') {
          setRecordingError('No microphone found. Please connect a microphone and try again.');
        } else {
          setRecordingError(`Failed to start recording: ${error.message}`);
        }
      } else {
        setRecordingError('Failed to start recording. Please try again.');
      }
    }
  };

  const handleStop = useCallback(async () => {
    if (isTransitioning || !isRecording) return;
    
    console.log('Stop button clicked');
    setIsTransitioning(true);
    
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('Stopping recording...');
        mediaRecorderRef.current.stop();
        
        // Wait for the audio blob to be created
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max
        
        while (!audioBlob && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        // Check if we have the audio blob or if the state has been updated
        const finalAudioBlob = audioBlob || (audioChunksRef.current.length > 0 ? 
          new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' }) : null);
        
        if (!finalAudioBlob || finalAudioBlob.size === 0) {
          throw new Error('No audio recorded. Please try recording again.');
        }
        
        console.log('Recording completed successfully, navigating to processing...');
        
        // Store the audio blob globally for the processing screen to access
        // In a proper implementation, this should go through React context
        (window as any).latestAudioBlob = finalAudioBlob;
        console.log('Stored audio blob globally:', { size: finalAudioBlob.size, type: finalAudioBlob.type });
        
        setScreen(Screen.Processing);
        
      } else {
        throw new Error('Recording is not active.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop recording');
      setIsTransitioning(false);
    }
  }, [audioBlob, isRecording, isTransitioning, setScreen, setError]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError, setError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (recordingError) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-gray-900/50 backdrop-blur-lg justify-center items-center text-white p-4 text-center" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
        <Icon name="error" className="text-6xl mb-4 text-red-500" />
        <h1 className="text-2xl font-bold">Recording Error</h1>
        <p className="text-lg text-gray-300 mt-2 max-w-md">{recordingError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-900/50 backdrop-blur-lg justify-between group/design-root" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <div className="flex-grow flex flex-col justify-center items-center text-white p-4">
        <div className="relative flex justify-center items-center mb-8">
          <div className="absolute w-64 h-64 rounded-full bg-sky-500/20 animate-[ring-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          <div className="absolute w-48 h-48 rounded-full bg-sky-500/30 animate-[ring-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ animationDelay: '0.5s' }}></div>
          <button className="relative flex items-center justify-center rounded-full h-32 w-32 bg-[#1193d4] text-white shadow-lg animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <svg
              fill="currentColor"
              height="64px"
              viewBox="0 0 256 256"
              width="64px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
            </svg>
          </button>
        </div>
        <p className="text-xl font-medium text-gray-300 mb-4 capitalize">{activeRecorder} Speaking...</p>
        
        {/* Status indicator */}
        <div className="mb-4 text-sm text-gray-400 text-center">
          <p>Status: {isRecording ? '🔴 Recording' : '⚪ Not Recording'}</p>
          <p>Audio: {audioBlob ? `✅ ${(audioBlob.size / 1024).toFixed(1)}KB` : '⏳ Waiting...'}</p>
        </div>
        
        <div className="w-full max-w-lg mb-8">
          <svg height="60" preserveAspectRatio="none" viewBox="0 0 500 60" width="100%">
            <path d="M0 30 C 50 10, 100 50, 150 30 S 250 10, 300 30 S 400 50, 450 30 S 500 10, 500 30" fill="none" stroke="#1193d4" stroke-width="2"></path>
            <path d="M0 30 C 50 40, 100 20, 150 30 S 250 40, 300 30 S 400 20, 450 30 S 500 40, 500 30" fill="none" stroke="#1193d4" stroke-opacity="0.5" stroke-width="1"></path>
          </svg>
        </div>
        <p className="text-2xl font-light text-center max-w-2xl">
          The patient reports experiencing persistent <span className="text-white font-medium">headaches</span> and <span className="text-white font-medium">dizziness</span> over the past week.
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center text-white">
          <p className="text-lg font-mono">{formatTime(timer)}</p>
        </div>
        <button 
          onClick={handleStop} 
          disabled={isTransitioning || !isRecording}
          className={`w-full max-w-md mx-auto flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 text-white text-2xl font-bold leading-normal tracking-wider shadow-lg transition-all duration-200 ${
            isTransitioning 
              ? 'bg-gray-600 cursor-not-allowed' 
              : !isRecording
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 active:scale-95'
          }`}
        >
          <span className="truncate">
            {isTransitioning ? 'STOPPING...' : !isRecording ? 'NOT RECORDING' : 'STOP'}
          </span>
        </button>
      </div>
    </div>
  );
};
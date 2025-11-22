import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { elevenlabs, upload } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';

interface MicrophoneInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function MicrophoneInput({ onTranscript, disabled }: MicrophoneInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use more compatible audio format
      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus'
      };
      
      // Fallback to any supported format
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        console.warn('audio/webm;codecs=opus not supported, using default');
        delete options.mimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingStartTime(Date.now());

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordingDuration = (Date.now() - recordingStartTime) / 1000; // in seconds
        
        // Check minimum duration
        if (recordingDuration < 1) {
          toast({
            title: '🎤 Recording Too Short',
            description: 'Please speak for at least 1 second. Try again!',
            variant: 'destructive'
          });
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setIsProcessing(true);
        
        try {
          // Validate audio chunks
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data captured');
          }
          
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          
          // Validate blob size
          if (audioBlob.size === 0) {
            throw new Error('Audio file is empty (0 bytes)');
          }
          
          console.log('🎤 Audio captured:', {
            duration: `${recordingDuration.toFixed(1)}s`,
            size: `${(audioBlob.size / 1024).toFixed(1)} KB`,
            type: audioBlob.type
          });
          
          // Convert to File with proper extension
          const fileExtension = audioBlob.type.includes('webm') ? 'webm' : 'wav';
          const audioFile = new File(
            [audioBlob], 
            `recording-${Date.now()}.${fileExtension}`, 
            { type: audioBlob.type }
          );
          
          // Upload file first (required for STT)
          console.log('📤 Uploading audio file...');
          const uploadResult = await upload.uploadFile(audioFile);
          
          if (upload.isErrorResponse(uploadResult)) {
            throw new Error('Upload failed: Audio file could not be uploaded');
          }
          
          console.log('✅ Upload successful:', uploadResult.link);
          
          // Transcribe with ElevenLabs STT
          console.log('🔊 Transcribing with ElevenLabs...');
          const sttResult = await elevenlabs.speechToText({
            audio_url: uploadResult.link
          });
          
          console.log('✅ Transcription successful:', {
            text: sttResult.text,
            language: sttResult.language_code,
            confidence: `${Math.round(sttResult.language_probability * 100)}%`
          });
          
          // Pass transcript to parent
          onTranscript(sttResult.text);
          
          toast({
            title: '🎤 Transcribed!',
            description: `"${sttResult.text.substring(0, 50)}${sttResult.text.length > 50 ? '...' : ''}" (${sttResult.language_code.toUpperCase()}, ${Math.round(sttResult.language_probability * 100)}% confident)`,
          });
        } catch (error) {
          console.error('❌ STT error:', error instanceof Error ? { 
            message: error.message, 
            name: error.name, 
            stack: error.stack 
          } : error);
          console.error('Raw error:', error);
          
          // Enhanced error message
          let errorMessage = 'Could not transcribe audio. Try speaking again!';
          if (error instanceof Error) {
            if (error.message.includes('400')) {
              errorMessage = 'Audio format not supported. Try recording for longer (2-3 seconds minimum).';
            } else if (error.message.includes('upload')) {
              errorMessage = 'Failed to upload audio. Check your connection and try again.';
            } else if (error.message.includes('empty')) {
              errorMessage = 'No audio detected. Make sure your microphone is working.';
            }
          }
          
          toast({
            title: 'Transcription Failed',
            description: errorMessage,
            variant: 'destructive'
          });
        } finally {
          setIsProcessing(false);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      // Request data every 100ms for better chunking
      mediaRecorder.start(100);
      setIsRecording(true);
      
      toast({
        title: '🎤 Recording...',
        description: 'Speak now! Click stop when finished (minimum 1 second).',
      });
    } catch (error) {
      console.error('Microphone access error:', error instanceof Error ? { 
        message: error.message, 
        name: error.name, 
        stack: error.stack 
      } : error);
      console.error('Raw error:', error);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className="shrink-0"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

/**
 * Speech-to-Text Input Component
 * Records audio, uploads to server, transcribes with ElevenLabs
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { elevenlabs, upload } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';

interface STTInputProps {
  onTranscript: (text: string) => void;
  style?: React.CSSProperties;
}

export function STTInput({ onTranscript, style }: STTInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('[STT] 🎤 Recording started');
    } catch (err) {
      console.error('[STT] ❌ Mic access denied:', err);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('[STT] 🛑 Recording stopped');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Step 1: Upload audio file
      console.log('[STT] ⬆️ Uploading audio...');
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const uploadResult = await upload.uploadFile(audioFile);

      if (upload.isErrorResponse(uploadResult)) {
        throw new Error('Upload failed');
      }

      console.log('[STT] ✅ Audio uploaded:', uploadResult.link);

      // Step 2: Transcribe with ElevenLabs
      console.log('[STT] 🔊 Transcribing...');
      const sttResult = await elevenlabs.speechToText({
        audio_url: uploadResult.link
      });

      console.log('[STT] ✅ Transcription:', sttResult.text);
      console.log('[STT] 🌐 Language:', sttResult.language_code, `(${sttResult.language_probability})`);

      // Step 3: Send transcript to parent
      if (sttResult.text && sttResult.text.trim()) {
        onTranscript(sttResult.text.trim());
        toast({
          title: "Voice Transcribed ✨",
          description: `"${sttResult.text.substring(0, 50)}${sttResult.text.length > 50 ? '...' : ''}"`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking more clearly.",
          variant: "destructive"
        });
      }

    } catch (err) {
      console.error('[STT] ❌ Transcription failed:', err);
      toast({
        title: "Transcription Failed",
        description: "Could not process your voice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      style={style}
      className="p-2"
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4 text-red-500" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}

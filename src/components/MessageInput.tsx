import { useState, useRef } from 'react';
import { Send, Mic, Square, Trash2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string, audioBlob?: Blob) => void;
  disabled: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop()); // Zatrzymaj mikrofon
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Nie udało się uzyskać dostępu do mikrofonu.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !audioBlob) return;
    onSendMessage(text, audioBlob || undefined);
    setText('');
    setAudioBlob(null);
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        
        {/* Podgląd nagranego audio przed wysłaniem */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg border border-blue-200 w-fit">
            <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-48" />
            <button 
              onClick={() => setAudioBlob(null)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Usuń nagranie"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? 'Nagrywanie w toku...' : 'Wpisz wiadomość...'}
            disabled={disabled || isRecording}
            className="flex-1 resize-none overflow-hidden rounded-xl border border-gray-300 p-3 max-h-32 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            rows={1}
          />
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`p-3 rounded-full flex-shrink-0 transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50`}
            title={isRecording ? 'Zatrzymaj nagrywanie' : 'Nagraj audio'}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !audioBlob) || isRecording}
            className="p-3 bg-blue-500 text-white rounded-full flex-shrink-0 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

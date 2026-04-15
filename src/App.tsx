import { useState, useEffect } from 'react';
import type { Settings, Message, MessagePart } from './types';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SettingsModal } from './components/SettingsModal';
import { fetchChatCompletion } from './api';
import { Settings as SettingsIcon, Mic2 } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'google/gemini-1.5-pro',
};

// Konwersja Bloba na string Base64 Data URI
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wczytywanie z localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('vocalCoachSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedMessages = localStorage.getItem('vocalCoachMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Zapis do localStorage
  useEffect(() => {
    localStorage.setItem('vocalCoachSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vocalCoachMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (text: string, audioBlob?: Blob) => {
    if (!settings.apiKey) {
      alert('Proszę najpierw ustawić klucz API OpenRouter w ustawieniach!');
      setIsSettingsOpen(true);
      return;
    }

    let content: string | MessagePart[] = text;
    let audioUrl: string | undefined = undefined;

    if (audioBlob) {
      try {
        const base64Audio = await convertBlobToBase64(audioBlob);
        const parts: MessagePart[] = [];
        if (text.trim()) {
          parts.push({ type: 'text', text });
        }
        parts.push({ type: 'image_url', image_url: { url: base64Audio } }); // OpenRouter używa image_url do multimediów
        content = parts;
        audioUrl = URL.createObjectURL(audioBlob); // URL do odtwarzania w UI
      } catch (err) {
        console.error('Błąd konwersji audio:', err);
        alert('Wystąpił błąd podczas przetwarzania nagrania.');
        return;
      }
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      audioUrl,
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const assistantText = await fetchChatCompletion(newMessages, settings);
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
      };
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      alert(error.message || 'Wystąpił błąd podczas komunikacji z API.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Czy na pewno chcesz wyczyścić historię rozmowy?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-blue-600">
          <Mic2 size={24} />
          <h1 className="text-xl font-bold">Vocal Coach AI</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Wyczyść czat
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Ustawienia"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <ChatWindow messages={messages} isLoading={isLoading} />
      
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}

export default App;

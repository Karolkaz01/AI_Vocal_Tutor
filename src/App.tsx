import { useState, useEffect } from 'react';
import type { Settings, Message, MessagePart } from './types';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SettingsModal } from './components/SettingsModal';
import { fetchChatCompletion } from './api';
import { Settings as SettingsIcon, Mic2, Moon, Sun, Bot } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'google/gemini-1.5-pro',
  theme: 'dark',
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
    const savedSettings = localStorage.getItem('vocalTutorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedMessages = localStorage.getItem('vocalTutorMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Zapis do localStorage
  useEffect(() => {
    localStorage.setItem('vocalTutorSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vocalTutorMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

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
    } catch (error: unknown) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas komunikacji z API.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Czy na pewno chcesz wyczyścić historię rozmowy?')) {
      setMessages([]);
    }
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-950 font-sans transition-colors duration-200">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm px-6 py-3 flex justify-between items-center z-10 transition-colors duration-200">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
          <Mic2 size={24} />
          <h1 className="text-xl font-bold dark:text-gray-100">AI Vocal Tutor</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Wyczyść czat
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Przełącz motyw"
          >
            {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Ustawienia"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="flex flex-col items-center justify-center mb-8 text-gray-500 dark:text-gray-400">
              <Bot size={64} className="mb-4 text-blue-500 dark:text-blue-400" />
              <p className="text-2xl font-semibold dark:text-gray-200 text-center">Twój wirtualny trener wokalny</p>
              <p className="text-sm text-center max-w-md mt-2 dark:text-gray-400">
                Nagraj swój śpiew, a ja przeanalizuję go pod kątem intonacji, barwy i techniki!
              </p>
            </div>
            <div className="w-full">
              <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} isFloating={true} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ChatWindow messages={messages} isLoading={isLoading} />
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </main>

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

import type { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 p-4 rounded-lg shadow-sm max-w-3xl mx-auto transition-colors duration-200 ${msg.role === 'user' ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50'
            }`}
        >
          <div className="flex-shrink-0 mt-1">
            {msg.role === 'user' ? (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                <User size={20} className="text-gray-600 dark:text-gray-300" />
              </div>
            ) : (
              <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-2">
                <Bot size={20} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              {msg.role === 'user' ? 'Ty' : 'Vocal Tutor'}
            </div>

            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {typeof msg.content === 'string' ? (
                msg.content
              ) : (
                msg.content.map((part, index) => {
                  if (part.type === 'text') return <span key={index}>{part.text}</span>;
                  return null; // Don't render huge base64 strings
                })
              )}
            </div>

            {msg.audioUrl && (
              <div className="mt-2">
                <audio controls src={msg.audioUrl} className="w-full max-w-sm h-10" />
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-4 p-4 rounded-lg max-w-3xl mx-auto bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 animate-pulse">
          <div className="bg-blue-300 dark:bg-blue-700 rounded-full w-9 h-9 flex-shrink-0" />
          <div className="flex-1 flex items-center">
            <div className="h-4 bg-blue-300 dark:bg-blue-700 rounded w-1/4"></div>
          </div>
        </div>
      )}
    </div>
  );
}

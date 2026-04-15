import type { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Bot size={48} className="mb-4 text-blue-500" />
          <p className="text-xl font-semibold">Twój wirtualny trener wokalny</p>
          <p className="text-sm text-center max-w-md mt-2">
            Nagraj swój śpiew, a ja przeanalizuję go pod kątem intonacji, barwy i techniki!
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 p-4 rounded-lg shadow-sm max-w-3xl mx-auto ${
            msg.role === 'user' ? 'bg-white' : 'bg-blue-50 border border-blue-100'
          }`}
        >
          <div className="flex-shrink-0 mt-1">
            {msg.role === 'user' ? (
              <div className="bg-gray-200 rounded-full p-2">
                <User size={20} className="text-gray-600" />
              </div>
            ) : (
              <div className="bg-blue-500 rounded-full p-2">
                <Bot size={20} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="font-semibold text-sm text-gray-800">
              {msg.role === 'user' ? 'Ty' : 'Vocal Coach'}
            </div>
            
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
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
        <div className="flex gap-4 p-4 rounded-lg max-w-3xl mx-auto bg-blue-50 border border-blue-100 animate-pulse">
           <div className="bg-blue-300 rounded-full w-9 h-9 flex-shrink-0" />
           <div className="flex-1 flex items-center">
             <div className="h-4 bg-blue-300 rounded w-1/4"></div>
           </div>
        </div>
      )}
    </div>
  );
}

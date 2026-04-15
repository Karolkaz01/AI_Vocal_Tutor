export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessagePart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string | MessagePart[];
  // Opcjonalnie przechowujemy oryginalny plik blob/URL do odtwarzania w UI
  audioUrl?: string; 
}

export interface Settings {
  apiKey: string;
  model: string;
  theme?: 'light' | 'dark';
}

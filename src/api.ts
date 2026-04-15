import type { Message, Settings } from './types';

export const SYSTEM_PROMPT = `You are an expert vocal coach. Analyze the user's audio recordings for pitch accuracy, breath support, tone, vocal fry, and resonance. Provide constructive, specific feedback and exercises. Never just summarize the lyrics; focus purely on the vocal performance. Treat the provided media (audio/video) as the student's performance.`;

export async function fetchChatCompletion(
  messages: Message[],
  settings: Settings
): Promise<string> {
  // Przygotowanie historii z uwzględnieniem System Prompt
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => {
      // Usuwamy atrybuty pomocnicze (jak id czy audioUrl), które nie są w standardzie API
      return { role: m.role, content: m.content };
    })
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href, // Wymagane przez OpenRouter
      'X-Title': 'Vocal Coach Bot', // Opcjonalne
    },
    body: JSON.stringify({
      model: settings.model,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

import type { Settings } from '../types';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  settings: Settings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export function SettingsModal({ settings, isOpen, onClose, onSave }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ustawienia API</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSave({
              apiKey: formData.get('apiKey') as string,
              model: formData.get('model') as string,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenRouter API Key
            </label>
            <input
              type="password"
              name="apiKey"
              defaultValue={settings.apiKey}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-or-v1-..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Klucz jest zapisywany tylko lokalnie w przeglądarce (localStorage).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              name="model"
              defaultValue={settings.model}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="google/gemini-1.5-pro">Google Gemini 1.5 Pro (Natywne wsparcie Audio)</option>
              <option value="google/gemini-3.1-pro-preview">Google Gemini 3.1 Pro Preview (Natywne wsparcie Audio)</option>
              <option value="openai/gpt-4o">OpenAI GPT-4o (Natywne wsparcie Audio)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

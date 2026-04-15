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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ustawienia API</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSave({
              ...settings,
              apiKey: formData.get('apiKey') as string,
              model: formData.get('model') as string,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              OpenRouter API Key
            </label>
            <input
              type="password"
              name="apiKey"
              defaultValue={settings.apiKey}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="sk-or-v1-..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Klucz jest zapisywany tylko lokalnie w przeglądarce (localStorage).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select
              name="model"
              defaultValue={settings.model}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <option value="google/gemini-3.1-pro-preview">Google Gemini 3.1 Pro Preview</option>
              <option value="google/gemini-3-flash-preview">Google Gemini 3 Flash Preview</option>
              <option value="anthropic/claude-opus-4.6">Anthropic Claude Opus 4.6</option>
              <option value="openai/gpt-5.4">OpenAI GPT-5.4</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

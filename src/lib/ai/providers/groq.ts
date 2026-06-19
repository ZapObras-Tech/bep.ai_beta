import type { AIProvider, GenerateRequest } from '../types';
import { GROQ_MODELS } from '../config';

// Groq exposes an OpenAI-compatible REST API, so we call it with plain fetch
// (no SDK needed). https://api.groq.com/openai/v1/chat/completions
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

export const groqProvider: AIProvider = {
  id: 'groq',

  isConfigured() {
    return Boolean(apiKey);
  },

  async generate({ prompt, system, json, tier = 'fast' }: GenerateRequest): Promise<string> {
    if (!apiKey) throw new Error('GROQ_API_KEY não configurada.');

    const messages: Array<{ role: string; content: string }> = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODELS[tier],
        messages,
        // JSON Object mode: requires the prompt to mention "json" (ours do).
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Groq API error ${res.status}: ${detail}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  },
};

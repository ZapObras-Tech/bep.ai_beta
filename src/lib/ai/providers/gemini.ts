import { GoogleGenAI } from '@google/genai';
import type { AIProvider, GenerateRequest } from '../types';
import { GEMINI_MODELS } from '../config';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Lazy client: instantiating GoogleGenAI without a key THROWS, and this module is
// imported by the provider registry even when Groq is the active provider. So we
// only build the client on first actual use.
let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY não configurada.');
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export const geminiProvider: AIProvider = {
  id: 'gemini',

  isConfigured() {
    return Boolean(apiKey);
  },

  async generate({ prompt, system, json, tier = 'fast' }: GenerateRequest): Promise<string> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODELS[tier],
      contents: prompt,
      config: {
        ...(system ? { systemInstruction: system } : {}),
        responseMimeType: json ? 'application/json' : 'text/plain',
      },
    });

    return response.text ?? '';
  },
};

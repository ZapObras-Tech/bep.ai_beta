import type { ModelTier } from './types';

// ────────────────────────────────────────────────────────────────────────
// Central AI configuration. Change models / provider HERE — nowhere else.
//
// Model IDs are read from .env (Vite `VITE_*` vars) so you can swap them
// without touching code. The project runs entirely on Groq by default; the
// Gemini provider stays registered as an alternative (just change
// ACTIVE_PROVIDER to 'gemini' and set GEMINI_API_KEY).
// ────────────────────────────────────────────────────────────────────────

/** Active provider. Swap to 'gemini' to use Google instead. */
export const ACTIVE_PROVIDER = 'groq' as const;

// ── Groq (default) ───────────────────────────────────────────────────────
// Confirm the exact model IDs available to you at https://console.groq.com/docs/models
const GROQ_DEFAULTS = {
  fast: 'llama-3.3-70b-versatile',
  pro: 'llama-3.3-70b-versatile',
} satisfies Record<ModelTier, string>;

export const GROQ_MODELS: Record<ModelTier, string> = {
  fast: import.meta.env.VITE_GROQ_MODEL || GROQ_DEFAULTS.fast,
  pro: import.meta.env.VITE_GROQ_MODEL_PRO || import.meta.env.VITE_GROQ_MODEL || GROQ_DEFAULTS.pro,
};

// ── Gemini (alternative) ─────────────────────────────────────────────────
const GEMINI_DEFAULTS = {
  fast: 'gemini-2.0-flash',
  pro: 'gemini-2.0-flash',
} satisfies Record<ModelTier, string>;

export const GEMINI_MODELS: Record<ModelTier, string> = {
  fast: import.meta.env.VITE_GEMINI_MODEL_FAST || GEMINI_DEFAULTS.fast,
  pro: import.meta.env.VITE_GEMINI_MODEL_PRO || GEMINI_DEFAULTS.pro,
};

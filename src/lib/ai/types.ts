// Provider-agnostic AI layer.
// Add a new provider by implementing AIProvider and registering it in ./index.ts.

export type ModelTier = 'fast' | 'pro';

export interface GenerateRequest {
  /** The user/task prompt. */
  prompt: string;
  /** Optional system instruction (persona / guardrails). */
  system?: string;
  /** When true, the provider must return strictly valid JSON (no code fences). */
  json?: boolean;
  /** Which configured model tier to use. Defaults to 'fast'. */
  tier?: ModelTier;
}

export interface AIProvider {
  /** Stable identifier, e.g. 'gemini' | 'claude'. */
  readonly id: string;
  /** Returns true if the provider is configured (API key present, etc.). */
  isConfigured(): boolean;
  /** Generate text. Returns the raw model text. */
  generate(req: GenerateRequest): Promise<string>;
}

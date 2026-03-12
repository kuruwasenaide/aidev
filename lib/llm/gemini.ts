/**
 * Gemini LLM client — server-side only. Never expose GEMINI_API_KEY to the client.
 * Uses GEMINI_MODEL (default gemini-2.0-flash) with fallback to GEMINI_FALLBACK_MODEL (e.g. gemini-2.5-flash).
 */

import { GoogleGenAI, type GenerateContentConfig, type GenerateContentParameters } from "@google/genai";
import type { GeminiContent } from "./mapMessages";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";

/** Resolve which model to use: primary if key present, else fallback (e.g. when 2.0 is deprecated). */
function getModel(): string {
  const useFallback = process.env.GEMINI_USE_FALLBACK_MODEL === "true";
  return useFallback ? GEMINI_FALLBACK_MODEL : GEMINI_MODEL;
}

let client: GoogleGenAI | null = null;

/**
 * Creates (or returns cached) Gemini client. Reads GEMINI_API_KEY from env.
 * Throws if key is missing (caller should return 401).
 */
export function createClient(): GoogleGenAI {
  if (!GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}

export interface GenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  system?: string;
  abortSignal?: AbortSignal;
}

/**
 * Non-streaming generation. Use for simple request/response or when streaming not needed.
 */
export async function generateResponse(
  contents: GeminiContent[],
  options: GenerateOptions = {}
): Promise<{ text: string; modelUsed: string }> {
  const model = getModel();
  const ai = createClient();
  const config: GenerateContentConfig = {
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
  };
  if (options.system?.trim()) {
    config.systemInstruction = options.system;
  }
  const params: GenerateContentParameters = {
    model,
    contents,
    config,
  };
  const response = await ai.models.generateContent(params);
  const text = response.text ?? "";
  return { text, modelUsed: model };
}

/**
 * Streaming generation. Yields text deltas; caller can stream to client (e.g. SSE).
 */
export async function* streamResponse(
  contents: GeminiContent[],
  options: GenerateOptions = {}
): AsyncGenerator<string, void, undefined> {
  const model = getModel();
  const ai = createClient();
  const config: GenerateContentConfig = {
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
  };
  if (options.system?.trim()) {
    config.systemInstruction = options.system;
  }
  const params: GenerateContentParameters = {
    model,
    contents,
    config,
  };
  const stream = await ai.models.generateContentStream(params);
  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}

export { getModel };

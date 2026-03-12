/**
 * Maps app chat messages to Gemini API format (Content[]).
 * Truncates history to avoid context overflow; keeps last N messages.
 * Gemini expects alternating user/model roles; we map assistant -> model.
 */

import type { ChatMessage } from "@/contexts/ChatContext";

/** Max messages to send as history (user + assistant pairs). Safety + context limit. */
export const DEFAULT_MAX_HISTORY_MESSAGES = 40;

/** Minimal shape accepted by Gemini generateContent (role + parts with text). */
export interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/**
 * Converts app messages ({ role: "user"|"assistant", content }) to Gemini Content[].
 * - "assistant" -> role "model"
 * - Truncates to last maxMessages (keeps most recent context).
 */
export function mapMessagesToGemini(
  messages: ChatMessage[],
  maxMessages: number = DEFAULT_MAX_HISTORY_MESSAGES
): GeminiContent[] {
  const truncated =
    messages.length > maxMessages
      ? messages.slice(-maxMessages)
      : [...messages];

  return truncated.map((msg) => ({
    role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: msg.content }],
  }));
}

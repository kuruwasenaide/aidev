"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "aidev-chat-messages";
const MAX_USER_MESSAGES = 5;

/** Mantém no máximo `max` mensagens do usuário (e as respostas correspondentes). */
function trimToMaxUserMessages(
  messages: ChatMessage[],
  max: number
): ChatMessage[] {
  const userIndices = messages
    .map((m, i) => (m.role === "user" ? i : -1))
    .filter((i) => i >= 0);
  if (userIndices.length <= max) return messages;
  const startIndex = userIndices[userIndices.length - max];
  return messages.slice(startIndex);
}

function loadFromStorage(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        m &&
        typeof m === "object" &&
        typeof m.id === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

function saveToStorage(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // quota or private mode
  }
}

type ChatContextValue = {
  messages: ChatMessage[];
  isTyping: boolean;
  /** When streaming, incremental text for the next assistant message. */
  streamingContent: string | null;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  /** Abort current generation (e.g. cancel button). */
  abortGeneration: () => void;
  /** Máximo de mensagens do usuário permitidas (5). */
  maxUserMessages: number;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadFromStorage);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveToStorage(messages);
  }, [messages]);

  const abortGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    // Limite de 5 mensagens do usuário: mantém as últimas 4 e adiciona a nova.
    const prevTrimmed = trimToMaxUserMessages(messages, MAX_USER_MESSAGES - 1);
    const historyPlusNew = [...prevTrimmed, userMsg];
    setMessages(historyPlusNew);
    setIsTyping(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPlusNew,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorText =
          data?.error ?? `Error ${res.status}. Try again or check API key.`;
        setMessages((prev) =>
          trimToMaxUserMessages(
            [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                role: "assistant",
                content: errorText,
              },
            ],
            MAX_USER_MESSAGES
          )
        );
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMessages((prev) =>
          trimToMaxUserMessages(
            [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                role: "assistant",
                content: "No response body.",
              },
            ],
            MAX_USER_MESSAGES
          )
        );
        return;
      }

      const decoder = new TextDecoder();
      let full = "";
      let lastPaint = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        const now = Date.now();
        if (now - lastPaint >= 80) {
          setStreamingContent(full);
          lastPaint = now;
        }
      }
      setStreamingContent(full);

      setMessages((prev) =>
        trimToMaxUserMessages(
          [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: "assistant",
              content: full,
            },
          ],
          MAX_USER_MESSAGES
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStreamingContent(null);
        return;
      }
      setMessages((prev) =>
        trimToMaxUserMessages(
          [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: "assistant",
              content: "Request failed. Check connection and try again.",
            },
          ],
          MAX_USER_MESSAGES
        )
      );
    } finally {
      setIsTyping(false);
      setStreamingContent(null);
      abortRef.current = null;
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsTyping(false);
    setStreamingContent(null);
    try {
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isTyping,
        streamingContent,
        sendMessage,
        clearChat,
        abortGeneration,
        maxUserMessages: MAX_USER_MESSAGES,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

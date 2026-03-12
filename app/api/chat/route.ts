/**
 * POST /api/chat — Server-side Gemini chat. API key never sent to client.
 * Body: { messages, system?, temperature?, maxOutputTokens?, stream?: boolean }
 * Stream: SSE text chunks. Non-stream: JSON { reply, modelUsed }.
 */

import { mapMessagesToGemini } from "@/lib/llm/mapMessages";
import {
  createClient,
  generateResponse,
  getModel,
  streamResponse,
} from "@/lib/llm/gemini";
import type { ChatMessage } from "@/contexts/ChatContext";

const REQUEST_ID_HEADER = "x-request-id";
const RATE_LIMIT_MAX_REQUESTS = positiveIntFromEnv(
  process.env.CHAT_RATE_LIMIT_MAX_REQUESTS,
  8
);
const RATE_LIMIT_WINDOW_MS = positiveIntFromEnv(
  process.env.CHAT_RATE_LIMIT_WINDOW_MS,
  60_000
);
const RATE_LIMIT_MIN_INTERVAL_MS = positiveIntFromEnv(
  process.env.CHAT_RATE_LIMIT_MIN_INTERVAL_MS,
  1_200
);
const MAX_RATE_LIMIT_ENTRIES = 10_000;
const rateLimitStore = new Map<string, number[]>();

/** Default system instruction for the chat. Override with body.system or env GEMINI_SYSTEM_INSTRUCTION. */
const DEFAULT_SYSTEM_INSTRUCTION = `
**Persona:** Olá! Sou Aiko, a sua assistente virtual. Falo em primeira pessoa, sempre buscando ser útil para ambos.

**Objetivo Principal:** Ser uma assistente geral de IA.

**Base de Conhecimento (Kauê Moreira):**
- **Profissão:** Dev Full-Stack e Engenheiro de IA.
- **Serviços:** Criação de dashboards, apps mobile, automações, chatbots e e-commerce.
- **Tecnologias:** React, Node, Tailwind, React Native, IA e Automação.
- **Diferencial:** Velocidade de execução e IA aplicada a negócios.
- **Público:** Foco em B2B, mas aberto a todos os segmentos.
- **Portfólio:** [GitHub](https://github.com/kuruwasenaide)
- **Contato:** [LinkedIn](https://www.linkedin.com/in/kauemoreirak/) | [WhatsApp](https://wa.me/+5587991174472)

**Regras de Comportamento e Fluxo:**
1.  **Tom e Clareza:** Seja gentil, amigavel, clara e objetiva. Respostas curtas por padrão. Evite usar emojis.
2.  **Fidelidade à Informação:** Não invente dados. Se não souber algo, diga que não tem a informação.
3.  **Compreensão da Necessidade:** Faça no máximo uma pergunta para entender melhor como posso ajudar o usuário, apenas quando for realmente necessário.
4.  **Facilitação de Contato:** Quando houver interesse em um serviço ou projeto, guie a conversa para o contato:
6.  **Perguntas Gerais:** Responda normalmente e de forma útil. Evite ou responda com cautela a temas sensíveis (política, medicina, jurídico, investimentos).
7.  **Proibições:** Não prometa prazos ou preços fixos.
`;

function requestId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: Request) {
  const id = request.headers.get(REQUEST_ID_HEADER) ?? requestId();
  const start = Date.now();
  const clientId = clientIdentifier(request);

  const rateLimitResult = consumeMessageSlot(clientId, Date.now());
  if (!rateLimitResult.allowed) {
    return Response.json(
      {
        error: "Too many messages in a short period. Please wait a bit.",
        retryAfterMs: rateLimitResult.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          [REQUEST_ID_HEADER]: id,
        },
      }
    );
  }

  // 401 if API key not configured
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.warn(`[${id}] GEMINI_API_KEY missing`);
    return Response.json(
      { error: "Chat not configured: missing API key" },
      { status: 503 }
    );
  }

  let body: {
    messages?: ChatMessage[];
    system?: string;
    temperature?: number;
    maxOutputTokens?: number;
    stream?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "Body must include non-empty messages array" },
      { status: 400 }
    );
  }

  const contents = mapMessagesToGemini(messages);
  const system =
    typeof body.system === "string" && body.system.trim()
      ? body.system.trim()
      : (process.env.GEMINI_SYSTEM_INSTRUCTION?.trim() ||
          DEFAULT_SYSTEM_INSTRUCTION);
  const temperature =
    typeof body.temperature === "number" ? body.temperature : undefined;
  const maxOutputTokens =
    typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : undefined;
  const stream = body.stream !== false;

  const options = {
    system,
    temperature,
    maxOutputTokens,
    abortSignal: request.signal,
  };

  try {
    const model = getModel();

    if (stream) {
      const streamGenerator = streamResponse(contents, options);
      let firstChunk: string | null = null;
      try {
        const result = await streamGenerator.next();
        if (!result.done && result.value != null) firstChunk = result.value;
      } catch (streamErr) {
        const msg = errMessage(streamErr);
        const status = errStatus(streamErr);
        if (
          status === 429 ||
          msg.includes("429") ||
          msg.includes("rate limit") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("quota")
        ) {
          console.warn(`[${id}] rate limit / quota`);
          return Response.json(
            {
              error:
                "Quota or rate limit exceeded. Try again later or use GEMINI_USE_FALLBACK_MODEL=true with another model.",
            },
            { status: 429 }
          );
        }
        if (
          status === 403 ||
          msg.includes("403") ||
          msg.includes("PERMISSION_DENIED")
        ) {
          console.warn(`[${id}] permission denied`);
          return Response.json(
            { error: "Permission or quota issue" },
            { status: 403 }
          );
        }
        console.error(`[${id}] stream start error`, msg);
        return Response.json(
          { error: "Chat request failed; try again later" },
          { status: 500 }
        );
      }

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            if (firstChunk !== null) controller.enqueue(encoder.encode(firstChunk));
            for await (const chunk of streamGenerator) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (err) {
            console.error(`[${id}] stream pipe error`, errMessage(err));
            controller.error(err);
          }
        },
      });
      const latency = Date.now() - start;
      console.info(
        `[${id}] stream model=${model} latency=${latency}ms messages=${messages.length}`
      );
      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          [REQUEST_ID_HEADER]: id,
        },
      });
    }

    const { text, modelUsed } = await generateResponse(contents, options);
    const latency = Date.now() - start;
    console.info(
      `[${id}] generate model=${modelUsed} latency=${latency}ms messages=${messages.length}`
    );
    return Response.json({ reply: text ?? "", modelUsed });
  } catch (err) {
    const latency = Date.now() - start;
    const message = errMessage(err);
    const status = errStatus(err);

    if (message.includes("API key") || message.includes("GEMINI_API_KEY")) {
      console.warn(`[${id}] auth error`);
      return Response.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    if (
      status === 429 ||
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota")
    ) {
      console.warn(`[${id}] rate limit / quota`);
      return Response.json(
        {
          error:
            "Quota or rate limit exceeded. Try again later or use GEMINI_USE_FALLBACK_MODEL=true with another model.",
        },
        { status: 429 }
      );
    }

    if (
      status === 403 ||
      message.includes("403") ||
      message.includes("PERMISSION_DENIED")
    ) {
      console.warn(`[${id}] permission/quota`);
      return Response.json(
        { error: "Permission or quota issue" },
        { status: 403 }
      );
    }

    console.error(`[${id}] chat error latency=${latency}ms`, message);
    return Response.json(
      { error: "Chat request failed; try again later" },
      { status: 500 }
    );
  }
}

function errMessage(err: unknown): string {
  const e = err as Error & { cause?: Error };
  return e.cause?.message ?? (err instanceof Error ? err.message : String(err));
}

function errStatus(err: unknown): number | undefined {
  const e = err as { status?: number; cause?: { status?: number } };
  return e.status ?? e.cause?.status;
}

function positiveIntFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function clientIdentifier(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const userAgent = request.headers.get("user-agent")?.trim();
  return userAgent ? `ua:${userAgent}` : "anonymous";
}

function consumeMessageSlot(
  clientId: string,
  now: number
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const minIntervalCutoff = now - RATE_LIMIT_MIN_INTERVAL_MS;
  const windowCutoff = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = rateLimitStore.get(clientId) ?? [];

  const recent = timestamps.filter((timestamp) => timestamp > windowCutoff);
  const lastTimestamp = recent[recent.length - 1];
  if (lastTimestamp && lastTimestamp > minIntervalCutoff) {
    return { allowed: false, retryAfterMs: lastTimestamp - minIntervalCutoff };
  }

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = recent[0];
    if (oldestInWindow) {
      return {
        allowed: false,
        retryAfterMs: Math.max(1, oldestInWindow + RATE_LIMIT_WINDOW_MS - now),
      };
    }
  }

  recent.push(now);
  rateLimitStore.set(clientId, recent);

  if (rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
    // Keep memory bounded: drop entries whose window has expired.
    for (const [key, values] of rateLimitStore) {
      const active = values.filter((timestamp) => timestamp > windowCutoff);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else if (active.length !== values.length) {
        rateLimitStore.set(key, active);
      }
    }
  }

  return { allowed: true };
}

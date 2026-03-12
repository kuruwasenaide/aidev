This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Como configurar Gemini (chat)

O chat usa **Gemini** (Google) como LLM. A API key **nunca** é exposta no cliente; todas as chamadas passam pelo endpoint `/api/chat`.

1. **Criar chave**: em [Google AI Studio](https://aistudio.google.com/apikey), crie uma API key.
2. **Arquivo de ambiente**: copie `.env.local.example` para `.env.local` e preencha:
   - `GEMINI_API_KEY=<sua-chave>`
   - Opcional: `GEMINI_MODEL=gemini-2.0-flash` (padrão; descontinuado em 31/03/2026).
   - Opcional: `GEMINI_FALLBACK_MODEL=gemini-2.5-flash` e `GEMINI_USE_FALLBACK_MODEL=true` para usar o modelo de fallback sem alterar código.
   - Opcional (anti-spam do chat):
     - `CHAT_RATE_LIMIT_MAX_REQUESTS=8`
     - `CHAT_RATE_LIMIT_WINDOW_MS=60000`
     - `CHAT_RATE_LIMIT_MIN_INTERVAL_MS=1200`
3. **Rodar**: `npm run dev` e usar o input do chat na página. A conversa aparece na aba **Chat**.

Streaming está ativo: a resposta aparece em tempo real. Em caso de erro (chave inválida, rate limit, etc.), a mensagem de erro é exibida na própria conversa.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

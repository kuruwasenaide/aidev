/*
 * ChatSpotlight — Input only (below avatar). Conversation lives in SectionContent.
 * - On focus/click or ⌘K: transitions to Spotlight mode (centered overlay).
 * - On send: message goes to ChatContext; conversation is shown in Chat tab.
 */

import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Command, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatSpotlightProps {
  /** Called when user sends a message (e.g. switch to Chat tab). */
  onMessageSent?: () => void;
}

export default function ChatSpotlight({ onMessageSent }: ChatSpotlightProps) {
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const spotlightInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChat();

  // ⌘K / Ctrl+K shortcut to open spotlight
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSpotlight(true);
        setTimeout(() => spotlightInputRef.current?.focus(), 150);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const openSpotlight = useCallback(() => {
    setIsSpotlight(true);
    setTimeout(() => spotlightInputRef.current?.focus(), 150);
  }, []);

  const closeSpotlight = useCallback(() => {
    setIsSpotlight(false);
    setInputValue("");
  }, []);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    sendMessage(text);
    setInputValue("");
    setIsSpotlight(false);
    onMessageSent?.();
  }, [inputValue, sendMessage, onMessageSent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      closeSpotlight();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* ============================================
          INLINE INPUT (always visible, triggers spotlight)
          ============================================ */}
      <div
        onClick={openSpotlight}
        className={cn(
          "relative flex items-center gap-3 px-5 py-5 rounded-full cursor-text group",
          "glass-input",
          "hover:bg-[var(--glass-bg-hover)]"
        )}
      >
        <Sparkles className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="flex-1 text-sm text-muted-foreground/60">
          Faça uma pergunta...
        </span>
        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-1 text-muted-foreground/30">
          <Command className="w-3 h-3" />
          <span className="text-[10px] font-mono">K</span>
        </div>
      </div>

      {/* ============================================
          SPOTLIGHT OVERLAY + CENTERED INPUT
          ============================================ */}
      <AnimatePresence>
        {isSpotlight && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{
                background: "var(--spotlight-overlay)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSpotlight}
            />

            {/* Centered Spotlight Input */}
            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center pt-[25vh] sm:pt-[28vh] px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeSpotlight}
            >
              <motion.div
                className="w-full max-w-lg relative"
                initial={{ scale: 0.9, y: -150, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow behind input */}
                <div
                  className="absolute -inset-8 rounded-3xl"
                  style={{
                    background: "var(--spotlight-glow)",
                    filter: "blur(40px)",
                    opacity: 0.7,
                  }}
                />

                {/* Input container */}
                <div
                  className={cn(
                    "relative flex items-center gap-3 px-6 py-2 h-15 rounded-full",
                    "bg-[var(--glass-bg)] backdrop-blur-3xl",
                    "border border-[var(--glass-border)]",
                    "shadow-2xl",
                    "ring-1 ring-primary/15"
                  )}
                >
                  <Sparkles className="w-5 h-5 shrink-0 text-primary animate-pulse" />
                  <input
                    ref={spotlightInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva sua pergunta..."
                    className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50
                               outline-none"
                    maxLength={500}
                    aria-label="Spotlight chat input"
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {inputValue.trim() && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleSend}
                        className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center
                                   hover:bg-primary/90 active:scale-90 transition-all shrink-0"
                        aria-label="Send message"
                      >
                        <ArrowUp className="w-4 h-4 text-primary-foreground" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Keyboard hints */}
                <motion.div
                  className="flex items-center justify-center gap-4 mt-4"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="text-xs text-muted-foreground/35 flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                      Enter
                    </kbd>
                    enviar
                  </span>
                  <span className="text-xs text-muted-foreground/35 flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                      Esc
                    </kbd>
                    fechar
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

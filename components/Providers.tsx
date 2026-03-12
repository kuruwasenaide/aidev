"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </ChatProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

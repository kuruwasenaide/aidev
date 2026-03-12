/*
 * TabsNav — Glass tab bar with animated sliding background indicator.
 * Design: Horizontal scrollable on mobile, centered on desktop.
 * Tabs: Me / Projects / Skills / Fun / Contact
 */

import { cn } from "@/lib/utils";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { UserRound, FolderKanban, Cpu, CircleUserRound, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export type TabId = "profile" | "about" | "projects" | "skills" | "chat" | "contact";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "profile", label: "Perfil", icon: <UserRound strokeWidth={1.5} className="w-4 h-4" /> },
  { id: "about", label: "Sobre", icon: <CircleUserRound strokeWidth={1.5} className="w-4 h-4" /> },
  { id: "projects", label: "Projetos", icon: <FolderKanban strokeWidth={1.5} className="w-4 h-4" /> },
  { id: "skills", label: "Skills", icon: <Cpu strokeWidth={1.5} className="w-4 h-4" /> },
  { id: "chat", label: "Chat", icon: <MessageSquare strokeWidth={1.5} className="w-4 h-4" /> },
  { id: "contact", label: "Contato", icon: <Mail strokeWidth={1.5} className="w-4 h-4" /> },
];

interface TabsNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabsNav({ activeTab, onTabChange }: TabsNavProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div className="liquid-glass px-1.5 py-1.5 sm:px-2">
      <div
        ref={containerRef}
        className="relative flex items-center gap-0.5 overflow-x-auto scrollbar-none"
      >
        {/* Animated background indicator */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-lg"
          style={{
            background: "var(--glass-bg-hover)",
            border: "1px solid var(--glass-border-subtle)",
          }}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: "spring", stiffness: 600, damping: 40 }}
        />

        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-[1] flex flex-1 sm:flex-initial items-center justify-center gap-2 min-w-0 px-2 py-3 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium",
              "transition-colors duration-200 whitespace-nowrap",
              "active:scale-[0.97]",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
            aria-label={tab.label}
          >
            <span className="flex shrink-0 w-8 h-8 sm:w-4 sm:h-4 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center">
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

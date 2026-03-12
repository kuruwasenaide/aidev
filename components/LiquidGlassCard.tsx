/*
 * LiquidGlassCard — A glass panel with specular highlights that follow the mouse.
 * Uses CSS classes from index.css (.liquid-glass) + mouse-reactive specular layer.
 */

import { cn } from "@/lib/utils";
import { useMousePosition } from "@/hooks/useMousePosition";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useRef, type ReactNode } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
}

export default function LiquidGlassCard({
  children,
  className,
  elevated = false,
  interactive = true,
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();
  const reducedMotion = usePrefersReducedMotion();

  // Calculate specular highlight position relative to card
  const getSpecularStyle = () => {
    if (!interactive || reducedMotion || !cardRef.current) {
      return { opacity: 0 };
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((mouse.x - rect.left) / rect.width) * 100;
    const y = ((mouse.y - rect.top) / rect.height) * 100;
    const isInside =
      mouse.x >= rect.left &&
      mouse.x <= rect.right &&
      mouse.y >= rect.top &&
      mouse.y <= rect.bottom;

    return {
      background: `radial-gradient(circle at ${x}% ${y}%, var(--glass-glow), transparent 60%)`,
      opacity: isInside ? 1 : 0,
      transition: "opacity 0.4s ease",
    };
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "liquid-glass",
        elevated && "liquid-glass-elevated",
        className
      )}
    >
      {/* Mouse-reactive specular highlight */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] rounded-[inherit]"
        style={getSpecularStyle()}
      />
      {/* Content */}
      <div className="relative z-[4]">{children}</div>
    </div>
  );
}

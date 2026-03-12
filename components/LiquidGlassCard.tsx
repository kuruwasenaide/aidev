/*
 * LiquidGlassCard — A glass panel with specular highlights that follow the mouse.
 * Uses CSS classes from index.css (.liquid-glass) + mouse-reactive specular layer.
 */

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useCallback, useRef, type PointerEvent, type ReactNode } from "react";

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
  const specularRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isInteractive = interactive && !reducedMotion;

  const handlePointerEnter = useCallback(() => {
    if (!isInteractive || !specularRef.current) return;
    specularRef.current.style.opacity = "1";
  }, [isInteractive]);

  const handlePointerLeave = useCallback(() => {
    if (!specularRef.current) return;
    specularRef.current.style.opacity = "0";
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isInteractive || !specularRef.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      specularRef.current.style.setProperty("--specular-x", `${x}%`);
      specularRef.current.style.setProperty("--specular-y", `${y}%`);
    },
    [isInteractive]
  );

  return (
    <div
      className={cn(
        "liquid-glass",
        elevated && "liquid-glass-elevated",
        className
      )}
      onPointerMove={isInteractive ? handlePointerMove : undefined}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
    >
      {/* Mouse-reactive specular highlight */}
      <div
        ref={specularRef}
        className="absolute inset-0 pointer-events-none z-[3] rounded-[inherit]"
        style={{
          background:
            "radial-gradient(circle at var(--specular-x, 50%) var(--specular-y, 50%), var(--glass-glow), transparent 60%)",
          opacity: 0,
          transition: "opacity 0.35s ease",
        }}
      />
      {/* Content */}
      <div className="relative z-[4]">{children}</div>
    </div>
  );
}

/*
 * AvatarFloat — Large memoji-style avatar with floating animation + mouse parallax.
 * Design: Floats gently, tilts subtly toward cursor. Glow halo behind.
 */

"use client";

import { useMousePosition } from "@/hooks/useMousePosition";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function AvatarFloat() {
  const reducedMotion = usePrefersReducedMotion();
  const mouse = useMousePosition({ disabled: reducedMotion });

  const parallaxX = reducedMotion ? 0 : mouse.normalizedX * 10;
  const parallaxY = reducedMotion ? 0 : mouse.normalizedY * 8;

  return (
    <div className="relative flex items-center justify-center py-2">
      {/* Avatar image */}
      <div
        className="relative w-full max-w-md flex items-center justify-center min-h-[7rem] sm:min-h-[9rem]"
        style={{
          animation: reducedMotion ? "none" : "float 6s ease-in-out infinite",
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
          transition: "transform 0.5s ease-out",
        }}
      >
        {/* <MorphingText
          texts={MORPH_WORDS}
          className="h-20 sm:h-28 md:h-32 w-full max-w-md text-center
                     text-[44pt] sm:text-[44pt] md:text-[52pt] lg:text-[64pt]
                     text-foreground/90 leading-none"
        /> */}
      </div>
    </div>
  );
}

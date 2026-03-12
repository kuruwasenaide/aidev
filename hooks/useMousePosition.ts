import { useMemo, useSyncExternalStore } from "react";

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

const INITIAL_POSITION: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0,
};

let mousePosition: MousePosition = INITIAL_POSITION;
let rafId = 0;
let pendingMouseEvent: MouseEvent | null = null;
const listeners = new Set<() => void>();
let isListening = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function commitPendingMouseEvent() {
  rafId = 0;
  if (!pendingMouseEvent) return;
  const event = pendingMouseEvent;
  pendingMouseEvent = null;
  mousePosition = {
    x: event.clientX,
    y: event.clientY,
    normalizedX: (event.clientX / window.innerWidth - 0.5) * 2,
    normalizedY: (event.clientY / window.innerHeight - 0.5) * 2,
  };
  emit();
}

function handleMouseMove(event: MouseEvent) {
  pendingMouseEvent = event;
  if (rafId !== 0) return;
  rafId = requestAnimationFrame(commitPendingMouseEvent);
}

function startListening() {
  if (isListening || typeof window === "undefined") return;
  isListening = true;
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
}

function stopListening() {
  if (!isListening || typeof window === "undefined") return;
  isListening = false;
  window.removeEventListener("mousemove", handleMouseMove);
  if (rafId !== 0) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  pendingMouseEvent = null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  startListening();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopListening();
    }
  };
}

type UseMousePositionOptions = {
  disabled?: boolean;
};

export function useMousePosition(options?: UseMousePositionOptions): MousePosition {
  const disabled = options?.disabled ?? false;
  const value = useSyncExternalStore(subscribe, () => mousePosition, () => INITIAL_POSITION);

  return useMemo(() => (disabled ? INITIAL_POSITION : value), [disabled, value]);
}

const MAX_RENDER_RESOLUTION = 2.5;

export function getRenderResolution(): number {
  if (typeof window === "undefined") {
    return 1;
  }
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_RENDER_RESOLUTION);
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
}

export function isNarrowViewport(width = window.innerWidth): boolean {
  return width < 768;
}

export function isCompactViewport(width = window.innerWidth, height = window.innerHeight): boolean {
  return width < 900 || height < 700;
}

export function safeInset(side: "top" | "right" | "bottom" | "left"): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;${side}:0;visibility:hidden;pointer-events:none;padding-${side}:env(safe-area-inset-${side})`;
  document.body.appendChild(probe);
  const value = Number.parseFloat(getComputedStyle(probe).getPropertyValue(`padding-${side}`)) || 0;
  probe.remove();
  return value;
}

export function joystickRadius(): number {
  return isTouchDevice() ? 72 : 56;
}

export function joystickThumbRadius(): number {
  return isTouchDevice() ? 30 : 24;
}

export function playerDisplayHeight(): number {
  return isTouchDevice() ? 78 : 66;
}

export function minionDisplayDiameter(): number {
  return isTouchDevice() ? 36 : 32;
}

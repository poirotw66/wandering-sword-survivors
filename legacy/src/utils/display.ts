const MAX_RENDER_RESOLUTION = 2.5;

type SafeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

let cachedSafeInsets: SafeInsets | null = null;

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

/** Menu hub uses a scrollable, compact layout on phones and narrow viewports. */
export function isMobileHubLayout(width = window.innerWidth, height = window.innerHeight): boolean {
  return isNarrowViewport(width) || (isTouchDevice() && height < 920);
}

/** Combat HUD / upgrade panels use phone layout on narrow screens or compact touch widths. */
export function isMobileCombatLayout(width = window.innerWidth, height = window.innerHeight): boolean {
  void height;
  return isNarrowViewport(width) || (isTouchDevice() && width < 900);
}

function probeSafeInset(side: keyof SafeInsets): number {
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

export function refreshSafeInsets(): SafeInsets {
  cachedSafeInsets = {
    top: probeSafeInset("top"),
    right: probeSafeInset("right"),
    bottom: probeSafeInset("bottom"),
    left: probeSafeInset("left")
  };
  return cachedSafeInsets;
}

export function getSafeInsets(): SafeInsets {
  return cachedSafeInsets ?? refreshSafeInsets();
}

export function safeInset(side: keyof SafeInsets): number {
  return getSafeInsets()[side];
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

/** Minions use the same on-screen height as the player. */
export function minionDisplayHeight(): number {
  return playerDisplayHeight();
}

export type WuxiaBgmMode = "hub" | "combat" | "boss";

export const BGM_KEYS: Record<WuxiaBgmMode, string> = {
  hub: "bgm-hub",
  combat: "bgm-combat",
  boss: "bgm-boss"
};

export const BGM_ASSET_PATH = "assets/audio/bgm";

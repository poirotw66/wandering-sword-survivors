import Phaser from "phaser";
import { buildUpgradePool, type UpgradeOption } from "../data/upgrades";
import { EVOLUTION_CONFIGS } from "../data/evolutions";
import { trackedEvolutionProgress } from "../data/evolutionProgress";
import type { GameState } from "../game/GameState";
import { t } from "../i18n";
import { shuffle } from "../utils/random";

export class UpgradeSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState
  ) {}

  open(): void {
    if (this.state.pausedForUpgrade) {
      return;
    }
    this.state.pausedForUpgrade = true;
    this.scene.physics.world.pause();
    this.scene.scene.get("UIScene").events.emit("pause-changed", false);
    const options = this.rollOptions();
    this.scene.scene.get("UIScene").events.emit("show-upgrades", options);
  }

  reroll(): void {
    if (!this.state.pausedForUpgrade || this.state.rerolls <= 0) {
      return;
    }
    this.state.rerolls -= 1;
    this.scene.scene.get("UIScene").events.emit("show-upgrades", this.rollOptions());
  }

  banish(option: UpgradeOption): void {
    if (!this.state.pausedForUpgrade || this.state.banishCharges <= 0 || !option.banishable) {
      return;
    }

    this.state.banishCharges -= 1;
    this.state.banishedUpgradeIds.add(option.id);
    this.scene.events.emit("milestone-unlocked", t("sealedUpgradeToast", { name: option.title }));
    this.scene.scene.get("UIScene").events.emit("show-upgrades", this.rollOptions());
  }

  apply(option: UpgradeOption): void {
    option.apply(this.state);
    this.state.pausedForUpgrade = false;
    this.scene.physics.world.resume();
    this.scene.scene.get("UIScene").events.emit("hide-upgrades");
    this.scene.events.emit("sync-state", this.state);
    this.scene.scene.get("UIScene").events.emit("loadout-changed", this.state);
  }

  private rollOptions(): UpgradeOption[] {
    return chooseUpgradeOptions(this.state, buildUpgradePool(this.state), 3);
  }
}

export function chooseUpgradeOptions(
  state: GameState,
  pool: readonly UpgradeOption[],
  count = 3,
  random: () => number = Math.random
): UpgradeOption[] {
  const selected: UpgradeOption[] = [];
  const availablePool = pool.filter((option) => !state.banishedUpgradeIds.has(option.id));
  const readyEvolution = shuffle(availablePool.filter((option) => option.kind === "evolution")).slice(0, 1);
  selected.push(...readyEvolution);

  const pickedIds = new Set(selected.map((option) => option.id));
  const nearRoutes = trackedEvolutionProgress(state, 3).filter((progress) => !progress.alreadyEvolved);
  let statCount = selected.filter((option) => option.kind === "stat").length;

  while (selected.length < count) {
    const candidates = availablePool
      .filter((option) => !pickedIds.has(option.id))
      .filter((option) => option.kind !== "evolution")
      .filter((option) => option.kind !== "stat" || statCount < 1)
      .map((option) => ({ option, weight: upgradeWeight(option, nearRoutes) }))
      .filter((candidate) => candidate.weight > 0)
      .sort((a, b) => b.weight - a.weight || a.option.id.localeCompare(b.option.id));

    if (candidates.length === 0) {
      break;
    }

    const picked = weightedPick(candidates, random);
    selected.push(picked);
    pickedIds.add(picked.id);
    if (picked.kind === "stat") {
      statCount += 1;
    }
  }

  if (selected.length < count) {
    for (const option of shuffle(availablePool.filter((candidate) => !pickedIds.has(candidate.id)))) {
      selected.push(option);
      pickedIds.add(option.id);
      if (selected.length >= count) {
        break;
      }
    }
  }

  return capRecommendations(selected);
}

function upgradeWeight(
  option: UpgradeOption,
  nearRoutes: ReturnType<typeof trackedEvolutionProgress>
): number {
  if (option.kind === "stat") {
    return 0.65;
  }
  if (option.kind === "standaloneSkill") {
    return 1.3;
  }
  if (option.kind === "build") {
    const buildPathId = option.id.replace("build-", "");
    const route = nearRoutes.find((progress) => EVOLUTION_CONFIGS[progress.evolutionId].preferredBuildPathId === buildPathId);
    return route ? 4.4 + route.progressScore * 0.25 : 1.9;
  }
  if (option.kind === "weapon" || option.kind === "skill") {
    if (!option.recipeHint) {
      return 1.8;
    }
    const route = nearRoutes.find(
      (progress) =>
        option.id === `weapon-${progress.config.baseWeaponId}` ||
        option.id === `skill-${progress.config.requiredSkillId}`
    );
    if (!route) {
      return 3.1;
    }
    const required = route.requiredWeaponLevel + route.requiredSkillLevel;
    const missing = required - route.progressScore;
    return missing <= 2 ? 8.2 : 4.2 + route.progressScore * 0.35;
  }
  return 1;
}

function weightedPick(
  candidates: readonly { option: UpgradeOption; weight: number }[],
  random: () => number
): UpgradeOption {
  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  let roll = random() * total;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) {
      return candidate.option;
    }
  }
  return candidates[candidates.length - 1].option;
}

function capRecommendations(options: UpgradeOption[]): UpgradeOption[] {
  let nonEvolutionRecommendations = 0;
  return options.map((option) => {
    if (!option.recommendedText || option.kind === "evolution") {
      return option;
    }

    nonEvolutionRecommendations += 1;
    if (nonEvolutionRecommendations <= 2) {
      return option;
    }

    return {
      ...option,
      recommendedText: undefined,
      recommendationReason: undefined
    };
  });
}

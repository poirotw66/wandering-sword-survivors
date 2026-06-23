import Phaser from "phaser";
import { BUILD_PATH_CONFIGS } from "../data/buildPaths";
import { ENEMY_CONFIGS, type EnemyId } from "../data/enemies";
import { EVOLUTION_CONFIGS, type EvolutionId } from "../data/evolutions";
import { SKILL_CONFIGS, type SkillId } from "../data/skills";
import { WEAPON_CONFIGS } from "../data/weapons";
import { AchievementSystem, type RunRecord } from "../systems/AchievementSystem";
import { buildPathName, enemyName, skillName, t, weaponName } from "../i18n";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import { formatClock } from "../utils/math";

const BOSS_IDS: EnemyId[] = ["minorBoss", "midBoss", "greatBoss", "megaBoss", "finalBoss"];

export class CollectionScene extends Phaser.Scene {
  private content?: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;

  constructor() {
    super("CollectionScene");
  }

  create(): void {
    const record = AchievementSystem.readRecord();
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17);
    this.add
      .text(width / 2, 34, t("collectionTitle"), {
        fontFamily: TITLE_FONT,
        fontSize: "34px",
        color: "#f7efd8"
      })
      .setPadding(0, 8, 0, 8)
      .setOrigin(0.5, 0);

    const back = this.add
      .text(24, 22, t("backToMenu"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#10121f",
        backgroundColor: "#84f7b2",
        padding: { left: 12, right: 12, top: 8, bottom: 8 }
      })
      .setInteractive({ useHandCursor: true });
    back.on("pointerdown", () => this.scene.start("MenuScene"));

    this.content = this.add.container(0, 92);
    let y = 0;
    y = this.addRecords(record, width, y);
    y = this.addMartialSection(record, width, y);
    y = this.addBossSection(record, width, y);
    this.maxScroll = Math.max(0, y - (height - 118));

    this.input.on("wheel", (_pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number) => this.scrollBy(dy));
    this.input.keyboard?.on("keydown-UP", () => this.scrollBy(-48));
    this.input.keyboard?.on("keydown-DOWN", () => this.scrollBy(48));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MenuScene"));
  }

  private addRecords(record: RunRecord, width: number, y: number): number {
    this.addSectionTitle(t("recordBookTitle"), width, y);
    y += 46;
    const fastest = record.fastestClearSec === undefined ? t("none") : formatClock(record.fastestClearSec);
    const favoriteBuild = record.favoriteBuildPathId ? buildPathName(record.favoriteBuildPathId) : t("none");
    const lines = [
      t("collectionRecordLine", {
        best: record.bestRenown,
        total: record.totalRenown,
        difficulty: record.highestDifficulty,
        fastest
      }),
      t("collectionBuildLine", {
        favoriteBuild,
        achievements: record.achievements.length
      })
    ];
    this.addTextBlock(width / 2, y, lines.join("\n"), "#d8e2eb", 18, width - 80);
    return y + 96;
  }

  private addMartialSection(record: RunRecord, width: number, y: number): number {
    this.addSectionTitle(t("martialCodexTitle"), width, y);
    y += 44;

    y = this.addIconRows(
      t("forms"),
      Object.keys(WEAPON_CONFIGS).map((weaponId) => ({
        iconKey: WEAPON_CONFIGS[weaponId as keyof typeof WEAPON_CONFIGS].iconKey,
        label: weaponName(weaponId as keyof typeof WEAPON_CONFIGS),
        unlocked: true
      })),
      width,
      y
    );

    y = this.addIconRows(
      t("martialSkills"),
      Object.keys(SKILL_CONFIGS).map((skillId) => ({
        iconKey: SKILL_CONFIGS[skillId as SkillId].iconKey,
        label: skillName(skillId as SkillId),
        unlocked: record.skillsSeen.includes(skillId as SkillId) || record.standaloneSkillsSeen.includes(skillId as SkillId)
      })),
      width,
      y + 12
    );

    y = this.addIconRows(
      t("ultimateCodexTitle"),
      Object.keys(EVOLUTION_CONFIGS).map((evolutionId) => {
        const config = EVOLUTION_CONFIGS[evolutionId as EvolutionId];
        return {
          iconKey: config.iconKey,
          label: t(config.nameKey as Parameters<typeof t>[0]),
          unlocked: record.evolvedArtsSeen.includes(evolutionId as EvolutionId)
        };
      }),
      width,
      y + 12
    );

    y = this.addIconRows(
      t("buildPaths"),
      Object.keys(BUILD_PATH_CONFIGS).map((buildPathId) => {
        const count = record.buildPathCounts[buildPathId as keyof typeof BUILD_PATH_CONFIGS] ?? 0;
        return {
          iconKey: BUILD_PATH_CONFIGS[buildPathId as keyof typeof BUILD_PATH_CONFIGS].iconKey,
          label: `${buildPathName(buildPathId as keyof typeof BUILD_PATH_CONFIGS)} x${count}`,
          unlocked: count > 0
        };
      }),
      width,
      y + 12
    );

    return y + 12;
  }

  private addBossSection(record: RunRecord, width: number, y: number): number {
    this.addSectionTitle(t("bossCodexTitle"), width, y);
    y += 44;
    return this.addIconRows(
      t("bossCodexTitle"),
      BOSS_IDS.map((enemyId) => ({
        iconKey: "boss-master",
        label: `${enemyName(enemyId)} · ${ENEMY_CONFIGS[enemyId].score}`,
        unlocked: record.bossDefeatsSeen.includes(enemyId)
      })),
      width,
      y
    );
  }

  private addIconRows(
    title: string,
    items: { iconKey: string; label: string; unlocked: boolean }[],
    width: number,
    y: number
  ): number {
    this.addTextBlock(52, y, title, "#f7c66b", 18, 220, 0);
    y += 34;
    const columns = width >= 980 ? 4 : width >= 720 ? 3 : 2;
    const cellWidth = Math.min(230, (width - 86) / columns);
    const startX = (width - cellWidth * columns) / 2 + 28;
    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * cellWidth;
      const itemY = y + row * 74;
      const alpha = item.unlocked ? 1 : 0.32;
      this.content?.add(this.add.image(x, itemY + 24, item.iconKey).setDisplaySize(46, 46).setAlpha(alpha).setOrigin(0, 0.5));
      this.addTextBlock(x + 56, itemY + 10, item.unlocked ? item.label : t("lockedCodexItem"), item.unlocked ? "#d8e2eb" : "#6f7d91", 14, cellWidth - 64, 0);
    });
    return y + Math.ceil(items.length / columns) * 74 + 8;
  }

  private addSectionTitle(text: string, width: number, y: number): void {
    this.addTextBlock(width / 2, y, text, "#ffe09a", 22, width - 72, 0.5);
  }

  private addTextBlock(x: number, y: number, text: string, color: string, fontSize: number, wrapWidth: number, originX = 0.5): void {
    const block = this.add
      .text(x, y, text, {
        fontFamily: UI_FONT,
        fontSize: `${fontSize}px`,
        color,
        lineSpacing: 8,
        wordWrap: { width: wrapWidth }
      })
      .setPadding(0, 5, 0, 5)
      .setOrigin(originX, 0);
    this.content?.add(block);
  }

  private scrollBy(delta: number): void {
    this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScroll);
    this.content?.setY(92 - this.scrollY);
  }
}

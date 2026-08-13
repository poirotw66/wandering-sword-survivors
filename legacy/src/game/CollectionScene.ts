import Phaser from "phaser";
import { BUILD_PATH_CONFIGS } from "../data/buildPaths";
import { ENEMY_CONFIGS, type EnemyId } from "../data/enemies";
import { EVOLUTION_CONFIGS, type EvolutionId } from "../data/evolutions";
import { SKILL_CONFIGS, type SkillId } from "../data/skills";
import { WEAPON_CONFIGS } from "../data/weapons";
import { formatBossUnlockDetail, formatEvolutionRecipeDetail, type CodexDetail } from "../data/codexDetails";
import { AchievementSystem, ACHIEVEMENT_IDS, type RunRecord } from "../systems/AchievementSystem";
import { buildPathName, achievementName, enemyName, skillName, t, weaponName } from "../i18n";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import { formatClock } from "../utils/math";
import {
  drawHubBorderFrame,
  drawHubSectionTitle,
  drawInkSwordStrokes,
  drawScrollPanel,
  paintHubMapLayer,
  paintMenuBackdrop,
  spawnHubPetals
} from "../ui/menuHubTheme";
import { mountHubBgm } from "../audio/mountHubBgm";

const BOSS_IDS: EnemyId[] = ["minorBoss", "midBoss", "greatBoss", "megaBoss", "finalBoss"];

export class CollectionScene extends Phaser.Scene {
  private content?: Phaser.GameObjects.Container;
  private detailTitle?: Phaser.GameObjects.Text;
  private detailBody?: Phaser.GameObjects.Text;
  private contentTop = 92;
  private scrollY = 0;
  private maxScroll = 0;

  constructor() {
    super("CollectionScene");
  }

  create(): void {
    const record = AchievementSystem.readRecord();
    const { width, height } = this.scale;
    paintMenuBackdrop(this, width, height);
    paintHubMapLayer(this, width, height, 1, 0.06);
    drawHubBorderFrame(this, width, height, 2);
    drawInkSwordStrokes(this, width, height, 2);
    spawnHubPetals(this, width, height, 6);

    drawHubSectionTitle(this, width / 2, 34, t("collectionTitle"), TITLE_FONT, 8, width < 520 ? 26 : 32);
    this.add
      .text(width / 2, 72, t("collectionSubtitle"), {
        fontFamily: UI_FONT,
        fontSize: "14px",
        color: "#9eb4c8",
        align: "center",
        wordWrap: { width: Math.max(200, width - 120) }
      })
      .setOrigin(0.5, 0)
      .setDepth(8);

    const back = this.add
      .text(16, 16, t("backToMenu"), {
        fontFamily: TITLE_FONT,
        fontSize: "16px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: 12, right: 12, top: 8, bottom: 8 }
      })
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    back.on("pointerdown", () => this.scene.start("MenuScene"));
    this.createDetailPanel(record, width);

    const listWidth = width >= 980 ? width - 470 : width;
    this.contentTop = width >= 980 ? 104 : 292;
    this.content = this.add.container(0, this.contentTop);
    let y = 0;
    y = this.addRecords(record, listWidth, y);
    y = this.addAchievementSection(record, listWidth, y);
    y = this.addMartialSection(record, listWidth, y);
    y = this.addBossSection(record, listWidth, y);
    this.maxScroll = Math.max(0, y - (height - this.contentTop - 26));

    this.input.on("wheel", (_pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number) => this.scrollBy(dy));
    this.input.keyboard?.on("keydown-UP", () => this.scrollBy(-48));
    this.input.keyboard?.on("keydown-DOWN", () => this.scrollBy(48));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MenuScene"));
    mountHubBgm(this);
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

  private addAchievementSection(record: RunRecord, width: number, y: number): number {
    this.addSectionTitle(t("achievementCodexTitle"), width, y);
    y += 44;
    return this.addIconRows(
      "",
      ACHIEVEMENT_IDS.map((achievementId) => ({
        iconKey: "icon-upgrade-default",
        label: achievementName(achievementId),
        unlocked: record.achievements.includes(achievementId)
      })),
      width,
      y
    );
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
          unlocked: record.evolvedArtsSeen.includes(evolutionId as EvolutionId),
          onSelect: () => this.showDetail(formatEvolutionRecipeDetail(record, evolutionId as EvolutionId))
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
        iconKey: ENEMY_CONFIGS[enemyId].spriteKey,
        label: `${enemyName(enemyId)} · ${ENEMY_CONFIGS[enemyId].score}`,
        unlocked: record.bossDefeatsSeen.includes(enemyId),
        onSelect: () => this.showDetail(formatBossUnlockDetail(record, enemyId))
      })),
      width,
      y
    );
  }

  private addIconRows(
    title: string,
    items: { iconKey: string; label: string; unlocked: boolean; onSelect?: () => void }[],
    width: number,
    y: number
  ): number {
    if (title) {
      this.addTextBlock(52, y, title, "#f7c66b", 18, 220, 0);
      y += 34;
    }
    const columns = width >= 980 ? 4 : width >= 720 ? 3 : 2;
    const cellWidth = Math.min(210, (width - 86) / columns);
    const cellHeight = 98;
    const startX = (width - cellWidth * columns) / 2 + cellWidth / 2;
    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * cellWidth;
      const itemY = y + row * cellHeight;
      const alpha = item.unlocked ? 1 : 0.32;
      const image = this.add
        .image(x, itemY + 24, item.iconKey)
        .setDisplaySize(42, 42)
        .setAlpha(alpha)
        .setOrigin(0.5);
      this.content?.add(image);
      const label = this.addTextBlock(
        x,
        itemY + 52,
        item.unlocked ? item.label : t("lockedCodexItem"),
        item.unlocked ? "#d8e2eb" : "#6f7d91",
        13,
        cellWidth - 14,
        0.5
      );
      if (item.onSelect) {
        image.setInteractive({ useHandCursor: true }).on("pointerdown", item.onSelect);
        label.setInteractive({ useHandCursor: true }).on("pointerdown", item.onSelect);
      }
    });
    return y + Math.ceil(items.length / columns) * cellHeight + 8;
  }

  private addSectionTitle(text: string, width: number, y: number): void {
    this.addTextBlock(width / 2, y, text, "#ffe09a", 22, width - 72, 0.5);
  }

  private addTextBlock(x: number, y: number, text: string, color: string, fontSize: number, wrapWidth: number, originX = 0.5): Phaser.GameObjects.Text {
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
    return block;
  }

  private createDetailPanel(record: RunRecord, width: number): void {
    const panelWidth = Math.min(430, width - 64);
    const x = width >= 980 ? width - panelWidth / 2 - 24 : width / 2;
    const y = width >= 980 ? 104 : 108;
    const panelTop = y;
    const panelHeight = width >= 980 ? 168 : 148;
    drawScrollPanel(this, x, panelTop, panelHeight, panelWidth, 18);
    this.detailTitle = this.add
      .text(x, y + 16, t("codexDetailHint"), {
        fontFamily: TITLE_FONT,
        fontSize: "17px",
        color: "#ffe09a",
        align: "center",
        wordWrap: { width: panelWidth - 32 }
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);
    this.detailBody = this.add
      .text(x, y + 54, t("codexDetailEmpty"), {
        fontFamily: UI_FONT,
        fontSize: "13px",
        color: "#d8e2eb",
        lineSpacing: 6,
        align: "center",
        wordWrap: { width: panelWidth - 34 }
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);

    const firstUndiscovered = (Object.keys(EVOLUTION_CONFIGS) as EvolutionId[]).find(
      (evolutionId) => !record.evolvedArtsSeen.includes(evolutionId)
    );
    if (firstUndiscovered) {
      this.showDetail(formatEvolutionRecipeDetail(record, firstUndiscovered));
    }
  }

  private showDetail(detail: CodexDetail): void {
    this.detailTitle?.setText(detail.title);
    this.detailBody?.setText(detail.body);
  }

  private scrollBy(delta: number): void {
    this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScroll);
    this.content?.setY(this.contentTop - this.scrollY);
  }
}

import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";
import { t } from "../i18n";
import { TITLE_FONT, UI_FONT } from "./textStyle";

const CARD_HEIGHT = 252;

export class UpgradePanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly cards: Phaser.GameObjects.Container[] = [];
  private currentOptions: UpgradeOption[] = [];
  private currentPick?: (option: UpgradeOption) => void;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
  }

  show(
    options: UpgradeOption[],
    onPick: (option: UpgradeOption) => void,
    rerolls = 0,
    onReroll?: () => void,
    banishCharges = 0,
    onBanish?: (option: UpgradeOption) => void
  ): void {
    this.clear();
    this.currentOptions = options;
    this.currentPick = onPick;
    const { width, height } = this.scene.scale;
    const panelWidth = Math.min(1080, width - 48);
    const panelHeight = Math.min(440, height - 120);
    this.container.setVisible(true);
    this.container.add(this.scene.add.rectangle(width / 2, height / 2, width, height, 0x05080f, 0.82));
    this.container.add(
      this.scene.add
        .rectangle(width / 2, height * 0.52, panelWidth, panelHeight, 0x0d1018, 0.94)
        .setStrokeStyle(2, 0x5f4a2a, 0.92)
    );
    this.container.add(
      this.scene.add.rectangle(width / 2, height * 0.52 - panelHeight / 2 + 1, panelWidth - 4, 3, 0xc9a24d, 0.55)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.2, t("manualTitle"), {
          fontFamily: TITLE_FONT,
          fontSize: "34px",
          color: "#f7efd8"
        })
        .setPadding(0, 8, 0, 8)
        .setOrigin(0.5)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.265, t("manualHint"), {
          fontFamily: UI_FONT,
          fontSize: "15px",
          color: "#aac7d8"
        })
        .setPadding(0, 4, 0, 4)
        .setOrigin(0.5)
    );
    this.addCategoryLegend(width, height * 0.305);
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.335, t("upgradeKeyHint"), {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: "#6f8296"
        })
        .setOrigin(0.5)
    );

    if (rerolls > 0 && onReroll) {
      const reroll = this.scene.add
        .text(width / 2, height * 0.79, t("rerollUpgrades", { count: rerolls }), {
          fontFamily: UI_FONT,
          fontSize: "16px",
          color: "#10121f",
          backgroundColor: "#8ff4ff",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      reroll.on("pointerdown", () => onReroll());
      this.container.add(reroll);
    }
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.825, t("banishRemaining", { count: banishCharges }), {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: banishCharges > 0 ? "#ffcf9f" : "#6f7d91"
        })
        .setOrigin(0.5)
    );

    const cardWidth = Math.min(300, (panelWidth - 64) / 3);
    const cardGap = Math.max(16, (panelWidth - cardWidth * 3) / 4);
    const cardY = height * 0.54;

    options.forEach((option, index) => {
      const x = width / 2 + (index - 1) * (cardWidth + cardGap);
      this.cards.push(this.createCard(option, index, x, cardY, cardWidth, banishCharges, onPick, onBanish));
    });
  }

  hide(): void {
    this.clear();
    this.container.setVisible(false);
  }

  pickByIndex(index: number): void {
    const option = this.currentOptions[index];
    if (option && this.currentPick) {
      this.currentPick(option);
    }
  }

  private createCard(
    option: UpgradeOption,
    index: number,
    x: number,
    y: number,
    cardWidth: number,
    banishCharges: number,
    onPick: (option: UpgradeOption) => void,
    onBanish?: (option: UpgradeOption) => void
  ): Phaser.GameObjects.Container {
    const theme = this.cardTheme(option.kind);
    const card = this.scene.add.container(x, y);
    card.setSize(cardWidth, CARD_HEIGHT);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-cardWidth / 2, -CARD_HEIGHT / 2, cardWidth, CARD_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );

    const bg = this.scene.add
      .rectangle(0, 0, cardWidth, CARD_HEIGHT, theme.fill, 0.98)
      .setStrokeStyle(option.kind === "evolution" ? 3 : 2, theme.stroke);
    const innerFrame = this.scene.add
      .rectangle(0, 0, cardWidth - 10, CARD_HEIGHT - 10, theme.fill, 0.35)
      .setStrokeStyle(1, theme.stroke, 0.22);
    const categoryBar = this.scene.add
      .rectangle(0, -CARD_HEIGHT / 2 + 14, cardWidth - 16, 26, theme.accent, 0.32)
      .setStrokeStyle(1, theme.stroke, 0.75);
    const categoryText = this.scene.add
      .text(-cardWidth / 2 + 22, -CARD_HEIGHT / 2 + 14, theme.categoryLabel, {
        fontFamily: TITLE_FONT,
        fontSize: "13px",
        color: theme.titleColor,
        fontStyle: "700"
      })
      .setOrigin(0, 0.5);
    const keySeal = this.scene.add
      .circle(cardWidth / 2 - 22, -CARD_HEIGHT / 2 + 14, 14, theme.sealFill, 0.96)
      .setStrokeStyle(2, theme.stroke);
    const indexText = this.scene.add
      .text(cardWidth / 2 - 22, -CARD_HEIGHT / 2 + 14, `${index + 1}`, {
        fontFamily: TITLE_FONT,
        fontSize: "15px",
        color: "#f7efd8",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const iconKey = this.scene.textures.exists(option.iconKey) ? option.iconKey : "icon-upgrade-default";
    const iconHalo = this.scene.add.circle(0, -58, 36, theme.halo, 0.96).setStrokeStyle(2, theme.stroke, 0.88);
    const icon = this.scene.add.image(0, -58, iconKey).setDisplaySize(56, 56);

    const title = this.scene.add
      .text(0, -4, option.title, {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: theme.titleColor,
        align: "center",
        lineSpacing: 3,
        wordWrap: { width: cardWidth - 32 }
      })
      .setOrigin(0.5, 0);
    const divider = this.scene.add
      .rectangle(0, title.y + title.height + 8, cardWidth - 36, 1, theme.stroke, 0.45)
      .setOrigin(0.5, 0);
    const description = this.scene.add
      .text(0, divider.y + 10, option.description, {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#c8d4e0",
        align: "center",
        lineSpacing: 5,
        wordWrap: { width: cardWidth - 34 }
      })
      .setOrigin(0.5, 0);

    const recipe = option.recommendationReason ?? option.recipeHint ?? option.progressText ?? "";
    const recipeY = description.y + description.height + 10;
    const recipeText = recipe
      ? this.scene.add
          .text(0, recipeY, recipe, {
            fontFamily: UI_FONT,
            fontSize: "11px",
            color: theme.recipeColor,
            align: "center",
            lineSpacing: 3,
            wordWrap: { width: cardWidth - 32 }
          })
          .setOrigin(0.5, 0)
      : undefined;

    const parts: Phaser.GameObjects.GameObject[] = [
      bg,
      innerFrame,
      categoryBar,
      categoryText,
      keySeal,
      indexText,
      iconHalo,
      icon,
      title,
      divider,
      description
    ];

    if (this.shouldShowBadge(option)) {
      parts.push(
        this.scene.add
          .text(0, CARD_HEIGHT / 2 - 46, option.badgeText ?? "", {
            fontFamily: UI_FONT,
            fontSize: "11px",
            color: theme.badgeTextColor,
            backgroundColor: theme.badgeBgColor,
            padding: { left: 7, right: 7, top: 3, bottom: 3 }
          })
          .setOrigin(0.5, 0)
      );
    }

    if (option.recommendedText) {
      parts.push(
        this.scene.add
          .text(0, -CARD_HEIGHT / 2 + 42, option.recommendedText, {
            fontFamily: UI_FONT,
            fontSize: "11px",
            color: "#111421",
            backgroundColor: "#84f7b2",
            padding: { left: 7, right: 7, top: 3, bottom: 3 }
          })
          .setOrigin(0.5, 0)
      );
    }

    if (recipeText) {
      parts.push(recipeText);
    }

    if (option.banishable && banishCharges > 0 && onBanish) {
      const banishButton = this.scene.add
        .text(0, CARD_HEIGHT / 2 - 18, t("sealUpgrade"), {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: "#ffe09a",
          backgroundColor: "#472331",
          padding: { left: 9, right: 9, top: 4, bottom: 4 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      banishButton.on(
        "pointerdown",
        (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
          event?.stopPropagation();
          onBanish(option);
        }
      );
      parts.push(banishButton);
    }

    card.add(parts);
    card.on("pointerover", () => {
      bg.setStrokeStyle(3, theme.hoverStroke);
      this.scene.tweens.add({ targets: card, scaleX: 1.03, scaleY: 1.03, duration: 90, ease: "Sine.easeOut" });
    });
    card.on("pointerout", () => {
      bg.setStrokeStyle(option.kind === "evolution" ? 3 : 2, theme.stroke);
      this.scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 90, ease: "Sine.easeOut" });
    });
    card.on("pointerdown", () => onPick(option));
    this.container.add(card);
    return card;
  }

  private addCategoryLegend(width: number, y: number): void {
    const items = [
      { label: t("forms"), color: "#b8d4f0" },
      { label: t("martialSkills"), color: "#f7c66b" },
      { label: t("evolutionBadge"), color: "#ffe09a" },
      { label: t("buildPaths"), color: "#d8b4ff" }
    ];
    const gap = 18;
    const totalWidth = items.reduce((sum, item) => sum + item.label.length * 13 + 16, 0) + gap * (items.length - 1);
    let cursor = width / 2 - totalWidth / 2;
    for (const item of items) {
      const pill = this.scene.add
        .text(cursor, y, item.label, {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: item.color,
          backgroundColor: "#121820cc",
          padding: { left: 8, right: 8, top: 3, bottom: 3 }
        })
        .setOrigin(0, 0.5);
      cursor += pill.width + gap;
      this.container.add(pill);
    }
  }

  private shouldShowBadge(option: UpgradeOption): boolean {
    if (!option.badgeText) {
      return false;
    }
    if (option.kind === "weapon" && option.badgeText === t("forms")) {
      return false;
    }
    if (option.kind === "skill" && option.badgeText === t("martialSkills")) {
      return false;
    }
    return option.kind === "evolution" || option.kind === "standaloneSkill" || option.badgeText === t("comboBadge");
  }

  private clear(): void {
    this.cards.length = 0;
    this.currentOptions = [];
    this.container.removeAll(true);
  }

  private cardTheme(kind: UpgradeOption["kind"]): {
    fill: number;
    stroke: number;
    hoverStroke: number;
    titleColor: string;
    recipeColor: string;
    halo: number;
    sealFill: number;
    accent: number;
    categoryLabel: string;
    badgeBgColor: string;
    badgeTextColor: string;
  } {
    if (kind === "weapon") {
      return {
        fill: 0x0e141f,
        stroke: 0x6f8aa8,
        hoverStroke: 0x9ec8e8,
        titleColor: "#b8d4f0",
        recipeColor: "#9ec8e8",
        halo: 0x121a28,
        sealFill: 0x1a2a3d,
        accent: 0x6f8aa8,
        categoryLabel: t("forms"),
        badgeBgColor: "#1a2a3dcc",
        badgeTextColor: "#e8f4ff"
      };
    }
    if (kind === "skill") {
      return {
        fill: 0x18120e,
        stroke: 0xc9a24d,
        hoverStroke: 0xffd36a,
        titleColor: "#f7c66b",
        recipeColor: "#e8c878",
        halo: 0x241a12,
        sealFill: 0x3a2818,
        accent: 0xc9a24d,
        categoryLabel: t("martialSkills"),
        badgeBgColor: "#3a2818cc",
        badgeTextColor: "#ffe9c2"
      };
    }
    if (kind === "evolution") {
      return {
        fill: 0x241a12,
        stroke: 0xffd36a,
        hoverStroke: 0xffe9a8,
        titleColor: "#ffe09a",
        recipeColor: "#ffe09a",
        halo: 0x2a2018,
        sealFill: 0x4a3018,
        accent: 0xffd36a,
        categoryLabel: t("evolutionBadge"),
        badgeBgColor: "#ffe09a",
        badgeTextColor: "#1b1720"
      };
    }
    if (kind === "standaloneSkill") {
      return {
        fill: 0x14242a,
        stroke: 0x8ff4ff,
        hoverStroke: 0xb8f7ff,
        titleColor: "#b8f7ff",
        recipeColor: "#b8f7ff",
        halo: 0x1a3344,
        sealFill: 0x1a3344,
        accent: 0x8ff4ff,
        categoryLabel: t("standaloneBadge"),
        badgeBgColor: "#8ff4ff",
        badgeTextColor: "#101a20"
      };
    }
    if (kind === "build") {
      return {
        fill: 0x17131f,
        stroke: 0xb86bff,
        hoverStroke: 0xd8b4ff,
        titleColor: "#e8d4ff",
        recipeColor: "#d8b4ff",
        halo: 0x241a30,
        sealFill: 0x332448,
        accent: 0xb86bff,
        categoryLabel: t("buildPaths"),
        badgeBgColor: "#d8b4ff",
        badgeTextColor: "#17131f"
      };
    }
    return {
      fill: 0x1b1720,
      stroke: 0x84f7b2,
      hoverStroke: 0xb8ffd8,
      titleColor: "#d8e2eb",
      recipeColor: "#aac7d8",
      halo: 0x22302a,
      sealFill: 0x2a3a32,
      accent: 0x84f7b2,
      categoryLabel: t("upgradeCategoryStat"),
      badgeBgColor: "#84f7b2",
      badgeTextColor: "#10121f"
    };
  }
}

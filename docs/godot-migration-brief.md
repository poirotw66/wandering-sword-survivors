# Godot 遷移說明（Phaser Prototype Archive）

本文件標記 Phaser / TypeScript 版為**可封存的原型**，並說明遷移到 Godot 時應帶走什麼、重寫什麼、以及建議的開工順序。

- 來源專案：笑傲江湖倖存者 / Wandering Sword Survivors
- 現行引擎：Vite + TypeScript + Phaser 3
- 目標引擎：Godot 4.x（建議 GDScript；若偏好靜態型別可用 C#）
- 內容規格：見 `docs/game-content.md`
- 玩測清單：見 `docs/playtest-checklist.md`
- Specs 狀態：`001`–`016` 皆為 `done`（見 `docs/specs/specs-overview.md`）

## 1. 收尾原則

Phaser 版已完成核心玩法、流派進化、Boss 階層、節奏壓力、meta、手機 UX 與一輪平衡／VFX 拋光。

建議：

1. **凍結功能擴充** — 不再新增系統或內容 Spec。
2. **只修致命 bug**（若仍部署公開試玩）。
3. **把本 repo 當設計與數值來源**，Godot 版為正式產品線。
4. 遷移前可依 `docs/playtest-checklist.md` 跑一輪 30 分鐘，把手感問題寫進 Godot backlog，而不是在本版再做大平衡。

## 2. 帶走 vs 重寫

### 2.1 帶走（設計／數值／文案）

| 領域 | Phaser 來源 | Godot 建議形態 |
| --- | --- | --- |
| 敵人與 Boss 數值 | `src/data/enemies.ts` | `EnemyDef` Resource 或 JSON |
| 刷怪與 Boss 時間線 | `src/data/waves.ts` | `SpawnWave` / `BossSchedule` Resource |
| 節奏（壓力波、喘息、主題段） | `src/data/runPacing.ts` | `RunPacingConfig` |
| 集中平衡旋鈕 | `src/data/runBalance.ts` | 單一 `RunBalance` Resource |
| 時間戰鬥縮放 | `src/data/timeCombatScale.ts` | 綁在 `RunBalance` |
| 經驗曲線 | `src/data/expCurve.ts` | 函式或曲線 Resource |
| 武器／投射物 | `src/data/weapons.ts` | `WeaponDef` |
| 心法／技能 | `src/data/skills.ts` | `SkillDef` |
| 進化配方 | `src/data/evolutions.ts` | `EvolutionRecipe` |
| 升級池與解鎖 | `src/data/upgrades.ts`, `upgradeUnlocks.ts` | `UpgradePool` + 條件 |
| 流派與里程碑 | `src/data/buildPaths.ts`, `buildPathSynergy.ts` | `BuildPathDef` |
| 小怪行為原型 | `src/data/minionBehaviors.ts` | 狀態機或 Behavior Resource |
| Boss 招式／身分 | `src/data/bossSkills.ts`, `bossIdentity.ts` | `BossSkillDef` + per-tier identity |
| 中場事件 | `src/data/runEvents.ts` | `RunEventDef` |
| 江湖遭遇修飾 | `src/data/runModifiers.ts` | 選單開局 modifier |
| Meta／聲望／商店 | `src/data/metaProgression.ts`, `renownShop.ts`, `metaChoices.ts` | 存檔 + 商店 Resource |
| 文案 i18n | `src/i18n/*` | Godot `Translation` / CSV |
| 內容總覽 | `docs/game-content.md` | 繼續當產品規格 |

### 2.2 重寫（引擎與執行層）

| Phaser | Godot |
| --- | --- |
| `GameScene` / `UIScene` / `MenuScene` | Scene 樹 + CanvasLayer UI |
| Arcade Physics overlap | `CharacterBody2D` + `Area2D` / `PhysicsBody2D` |
| `WeaponSystem` / `EnemySystem` / `SpawnSystem` | 節點或 Autoload 服務 |
| `CollisionSystem` 手動 reconcile | 物理查詢 + 必要時 ray／shape cast |
| Phaser tweens / 自繪 VFX | `Tween`、`GPUParticles2D`、自訂 draw |
| `localStorage` meta 存檔 | `ConfigFile` 或自訂 JSON |
| Vite / GitHub Pages | Godot export（Web / Android / desktop） |

**原則：移植規則與手感目標，不要移植 Phaser API 結構。**

## 3. 建議 Godot 專案骨架

```text
res://
  project.godot
  scenes/
    boot/
    hub/                 # 選單、難度、遭遇、聲望商店
    run/
      run.tscn           # 主戰鬥
      player.tscn
      enemy.tscn
      projectile.tscn
    ui/
      hud.tscn
      upgrade_panel.tscn
      boss_bar.tscn
  scripts/
    autoload/
      game_state.gd
      save_service.gd
      audio_service.gd
    combat/
    spawn/
    meta/
  resources/
    enemies/
    weapons/
    skills/
    bosses/
    balance/
      run_balance.tres
    waves/
  assets/
    sprites/
    audio/
    fonts/
  locales/
```

建議 Godot **4.3+**，渲染器用 **Compatibility** 或 **Mobile**（若以手機為主）。

## 4. 垂直切片（第一里程碑）

目標：**可玩的 5 分鐘**，不是完整 30 分鐘重製。

1. 玩家移動（鍵盤 + 虛擬搖桿預留）
2. 一種自動攻擊（對應劍氣）
3. 一種小怪（追擊型）+ 擊殺掉經驗珠
4. 升級 → 三選一升級卡（先只做傷害／冷卻／移速）
5. 一個簡單 Boss（衝刺 telegraph + 接觸傷害）
6. 結束結算畫面（擊殺、時間、是否存活）

完成後再依序接：

1. 完整刷怪表與 30 分鐘時間線
2. 四種小怪行為（chaser / dasher / tank / ranger）
3. Boss 階層身分招式
4. 流派、進化、心法解鎖
5. Meta（聲望、商店、開局選擇、遭遇修飾）
6. 手機 HUD／升級面板（本版已驗證過的痛點可直接帶入）

## 5. 系統對照表（執行層）

| 現行系統 | 職責 | Godot 第一版做法 |
| --- | --- | --- |
| `PlayerSystem` | 移動、受傷、無敵幀 | `CharacterBody2D` + 狀態旗標 |
| `WeaponSystem` | 自動開火、進化形態 | Timer + projectile 池 |
| `EnemySystem` | AI、Boss 招式、小怪行為 | 敵人腳本 + Boss 招式佇列 |
| `SpawnSystem` | 波次、Boss 時程、壓力波 | Autoload / RunDirector |
| `ExpSystem` | 掉落、吸珠、升級事件 | Area 拾取 + GameState |
| `UpgradeSystem` | 升級池、三選一 | UI 暫停樹 + Resource 池 |
| `CollisionSystem` | 傷害、擊殺、掉落 | signal / Area overlap |
| `RunEventSystem` | 中場隨機事件 | RunDirector 計時觸發 |
| `PickupSystem` | 血瓶等 | 與經驗珠同一套拾取 |
| `AudioFeedbackSystem` | BGM／SFX | Autoload AudioServer 包裝 |
| `AchievementSystem` | 解鎖紀錄 | 併入 SaveService |

## 6. 資料遷移注意事項

- **數值先原樣搬**（`runBalance`、敵人 HP／exp、Boss 時程），Godot 版用 playtest 再調，避免「邊搬邊改」失去對照基準。
- Boss / 進化 VFX 先做**可讀 telegraph**，不要一開始追求本版全部 procedural 特效。
- 投射物與小怪務必做**物件池**；本版後期有 120 小怪上限，Godot 也應保留類似 cap。
- 手機：從第一天就用 touch controls；升級面板預設可捲動（本版 PR #9–#10 的教訓）。
- i18n：第一版可只做繁中，但 key 結構沿用現有文案 key，方便之後加英文。

## 7. 明確不在第一版範圍

- 完整 10 套進化 VFX profile 重製
- Codex／圖鑑完整 UX
- 多語言完整校對
- Web 與原生雙平台同步上架
- 線上排行榜／帳號系統

## 8. 驗收標準（Godot MVP）

- [ ] 能完成一場 5 分鐘 run（含至少 1 Boss）
- [ ] 升級三選一可操作（鍵鼠 + 觸控）
- [ ] 敵人與武器數值來自 Resource／JSON，而非寫死在場景
- [ ] 存檔能記住聲望或至少「已通關／最高時間」其一
- [ ] 匯出 Android 或桌面其中一個目標平台可安裝執行

## 9. 本 repo 的角色

封存後本 repo 仍有用：

- **產品規格**：`docs/game-content.md`
- **玩測與節奏預期**：`docs/playtest-checklist.md`
- **數值與規則來源**：`src/data/*`
- **已關閉 Spec 歷史**：`docs/specs/*`

新 Godot 專案請另開 repo（或本 repo 下獨立 `godot/` 目錄）。若放在同 repo，請避免與現有 Vite 建置混用同一套 CI，除非刻意做成 monorepo。

---

文件狀態：prototype freeze / migration ready。  
下一步：建立 Godot 4 專案骨架，實作第 4 節垂直切片。

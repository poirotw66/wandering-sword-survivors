知道，**吸血鬼倖存者 Vampire Survivors** 是那種「角色自動攻擊、玩家主要負責走位、升級選技能、撐過一波波怪物」的生存型 Roguelite。
你要做 TypeScript + GitHub Pages 版本，我建議做成：

> **原創題材的 Vampire Survivors-like 瀏覽器遊戲**
> 不直接使用原作名稱、角色、怪物、美術、音效或道具名稱，避免版權與商標問題。

---

## 一、技術選型

我建議使用：

### 核心技術

| 項目   | 建議                       |
| ---- | ------------------------ |
| 語言   | TypeScript               |
| 遊戲框架 | Phaser 3                 |
| 打包工具 | Vite                     |
| 部署   | GitHub Pages             |
| 資料格式 | JSON / TypeScript config |
| 音效   | Web Audio / Phaser Sound |
| 儲存   | localStorage             |

### 為什麼用 Phaser 3？

Phaser 很適合 2D 遊戲，內建：

* Sprite、動畫、碰撞
* Tilemap 或無限地圖
* 音效
* 鍵盤 / 滑鼠 / 手機觸控
* 場景管理
* Canvas / WebGL 渲染

比起自己用 Canvas 從零寫，開發速度會快很多。

---

## 二、遊戲概念

暫定名稱可以叫：

**Nightfall Survivors**
或
**Echoes of the Abyss**

核心玩法：

玩家控制角色移動，角色會自動攻擊。怪物從四面八方湧入。玩家擊殺怪物取得經驗值，升級後選擇新技能或強化既有技能。撐過指定時間或擊敗 Boss 即勝利。

---

## 三、MVP 版本目標

第一版不要做太大，先做出可玩閉環。

### MVP 必備內容

1. 角色可移動
2. 怪物會生成並追蹤玩家
3. 玩家自動攻擊
4. 子彈可以擊中怪物
5. 怪物死亡掉經驗值
6. 玩家撿經驗值升級
7. 升級時出現三選一技能
8. 怪物碰到玩家會扣血
9. 玩家死亡後顯示結算畫面
10. 可部署到 GitHub Pages

### 第一版建議內容

| 類別   |    數量 |
| ---- | ----: |
| 玩家角色 |     1 |
| 怪物種類 |     3 |
| 武器   |     4 |
| 被動道具 |     4 |
| 關卡   |     1 |
| Boss |     1 |
| 遊玩時間 | 10 分鐘 |

---

## 四、遊戲系統規劃

### 1. Player System

玩家屬性：

```ts
type PlayerStats = {
  hp: number;
  maxHp: number;
  moveSpeed: number;
  pickupRange: number;
  damageMultiplier: number;
  cooldownMultiplier: number;
  projectileSpeedMultiplier: number;
  areaMultiplier: number;
};
```

玩家操作：

* WASD / 方向鍵移動
* 手機版用虛擬搖桿
* 不需要攻擊鍵，武器自動觸發

---

### 2. Enemy System

怪物行為第一版先簡單：

```ts
type EnemyConfig = {
  id: string;
  name: string;
  hp: number;
  damage: number;
  moveSpeed: number;
  exp: number;
  radius: number;
};
```

敵人 AI：

* 生成在畫面外圍
* 朝玩家移動
* 碰到玩家造成傷害
* 死亡掉落經驗值

怪物類型：

| 怪物    | 行為           |
| ----- | ------------ |
| Slime | 普通追蹤         |
| Bat   | 快速低血量        |
| Golem | 慢速高血量        |
| Boss  | 高血量、大體型、週期技能 |

---

### 3. Weapon System

每個武器都做成獨立 config。

```ts
type WeaponConfig = {
  id: string;
  name: string;
  baseDamage: number;
  cooldownMs: number;
  projectileSpeed: number;
  projectileCount: number;
  pierce: number;
  durationMs?: number;
};
```

第一版武器：

| 武器             | 效果        |
| -------------- | --------- |
| Magic Bolt     | 自動射向最近敵人  |
| Orbit Blade    | 圍繞玩家旋轉    |
| Flame Wave     | 朝隨機方向發射火焰 |
| Thunder Strike | 隨機打擊附近敵人  |

升級方向：

* 傷害增加
* 冷卻縮短
* 子彈數增加
* 穿透增加
* 範圍增加

---

### 4. Level Up System

玩家撿經驗值後升級。

升級時：

1. 暫停遊戲
2. 隨機抽 3 個升級選項
3. 玩家選一個
4. 套用效果
5. 繼續遊戲

升級選項格式：

```ts
type UpgradeOption = {
  id: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
};
```

---

### 5. Spawn System

怪物生成規則可以用時間表。

```ts
type SpawnWave = {
  startTimeSec: number;
  endTimeSec: number;
  enemyId: string;
  spawnIntervalMs: number;
  amountPerSpawn: number;
};
```

範例：

| 時間           | 怪物          |
| ------------ | ----------- |
| 0:00 - 2:00  | Slime       |
| 2:00 - 4:00  | Slime + Bat |
| 4:00 - 7:00  | Bat + Golem |
| 7:00 - 10:00 | 大量混合怪       |
| 10:00        | Boss        |

---

### 6. Collision System

碰撞類型：

* 子彈 vs 怪物
* 玩家 vs 怪物
* 玩家 vs 經驗寶石
* 玩家 vs 補血道具

為了效能，不建議完全依賴 Phaser Arcade Physics。
MVP 可以先用 Phaser Physics，之後再優化成自寫距離碰撞。

---

## 五、專案架構

建議 repo 結構：

```txt
survivors-ts/
├─ public/
│  ├─ assets/
│  │  ├─ sprites/
│  │  ├─ audio/
│  │  └─ ui/
│  └─ favicon.png
│
├─ src/
│  ├─ main.ts
│  ├─ game/
│  │  ├─ GameScene.ts
│  │  ├─ BootScene.ts
│  │  ├─ MenuScene.ts
│  │  ├─ UIScene.ts
│  │  └─ GameOverScene.ts
│  │
│  ├─ systems/
│  │  ├─ PlayerSystem.ts
│  │  ├─ EnemySystem.ts
│  │  ├─ WeaponSystem.ts
│  │  ├─ ProjectileSystem.ts
│  │  ├─ SpawnSystem.ts
│  │  ├─ ExpSystem.ts
│  │  ├─ UpgradeSystem.ts
│  │  └─ CollisionSystem.ts
│  │
│  ├─ entities/
│  │  ├─ Player.ts
│  │  ├─ Enemy.ts
│  │  ├─ Projectile.ts
│  │  └─ ExpGem.ts
│  │
│  ├─ data/
│  │  ├─ enemies.ts
│  │  ├─ weapons.ts
│  │  ├─ upgrades.ts
│  │  └─ waves.ts
│  │
│  ├─ ui/
│  │  ├─ HealthBar.ts
│  │  ├─ ExpBar.ts
│  │  ├─ UpgradePanel.ts
│  │  └─ TimerText.ts
│  │
│  └─ utils/
│     ├─ math.ts
│     ├─ objectPool.ts
│     └─ random.ts
│
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ .github/
   └─ workflows/
      └─ deploy.yml
```

---

## 六、開發里程碑

### Phase 1：專案初始化

目標：可以在瀏覽器看到遊戲畫面。

內容：

* 建立 Vite + TypeScript 專案
* 安裝 Phaser
* 建立 GameScene
* 加入玩家方塊或暫代圖
* 設定 GitHub Pages 部署流程

完成標準：

```txt
npm run dev 可以玩
push 到 main 後 GitHub Pages 自動部署
```

---

### Phase 2：基本戰鬥

目標：玩家可以移動、怪物會追、玩家會自動攻擊。

內容：

* 玩家移動
* 敵人生成
* 敵人追蹤玩家
* Magic Bolt 自動射擊
* 子彈擊中敵人
* 敵人死亡

完成標準：

```txt
玩家可以擊殺怪物
怪物會無限生成
```

---

### Phase 3：經驗與升級

目標：形成核心遊戲循環。

內容：

* 敵人死亡掉經驗
* 玩家撿經驗
* 經驗條
* 升級暫停
* 三選一升級
* 武器數值成長

完成標準：

```txt
殺怪 -> 撿經驗 -> 升級 -> 變強 -> 殺更多怪
```

---

### Phase 4：多武器與多怪物

目標：遊戲開始有變化。

內容：

* 加入 Orbit Blade
* 加入 Flame Wave
* 加入 Thunder Strike
* 加入不同敵人
* 加入 spawn wave 時間表

完成標準：

```txt
每場遊戲的升級路線會不同
```

---

### Phase 5：UI 與遊戲流程

目標：變成完整小遊戲。

內容：

* 主選單
* 開始遊戲
* 暫停
* 死亡畫面
* 結算畫面
* 遊玩計時器
* 擊殺數
* 等級顯示

完成標準：

```txt
玩家可以從首頁開始遊戲，死亡後重新開始
```

---

### Phase 6：美術與音效

目標：從 prototype 變成可分享版本。

內容：

* 替換暫代圖
* 加入簡單動畫
* 攻擊音效
* 怪物死亡音效
* 升級音效
* 背景音樂
* 畫面特效

完成標準：

```txt
遊戲有基本完成度，可以公開給朋友測試
```

---

## 七、GitHub Pages 部署方式

使用 Vite 最簡單。

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### vite.config.ts

如果 repo 名稱叫 `survivors-ts`：

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/survivors-ts/"
});
```

如果你部署到自訂網域或 `username.github.io` 根目錄，則用：

```ts
export default defineConfig({
  base: "/"
});
```

### GitHub Actions

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy
        uses: actions/deploy-pages@v4
```

---

## 八、最小可玩版本設計

### 操作

| 動作  | 鍵位         |
| --- | ---------- |
| 移動  | WASD / 方向鍵 |
| 選升級 | 滑鼠點擊       |
| 暫停  | Esc        |

### 遊戲目標

```txt
撐過 10 分鐘，擊敗最後 Boss。
```

### 失敗條件

```txt
HP 歸零。
```

### 核心數值

```ts
const PLAYER_BASE_STATS = {
  maxHp: 100,
  moveSpeed: 180,
  pickupRange: 64,
  damageMultiplier: 1,
  cooldownMultiplier: 1,
  projectileSpeedMultiplier: 1,
  areaMultiplier: 1
};
```

---

## 九、建議的第一批武器

### 1. Magic Bolt

自動瞄準最近敵人。

等級：

| Lv | 效果        |
| -: | --------- |
|  1 | 發射 1 顆魔法彈 |
|  2 | 傷害 +10    |
|  3 | 冷卻 -15%   |
|  4 | 子彈 +1     |
|  5 | 穿透 +1     |

---

### 2. Orbit Blade

圍繞玩家旋轉，碰到敵人造成傷害。

| Lv | 效果        |
| -: | --------- |
|  1 | 1 把旋轉刀    |
|  2 | 範圍 +20%   |
|  3 | 傷害 +20%   |
|  4 | 旋轉刀 +1    |
|  5 | 旋轉速度 +20% |

---

### 3. Flame Wave

向隨機方向噴出火焰波。

| Lv | 效果      |
| -: | ------- |
|  1 | 發射短距離火焰 |
|  2 | 範圍 +20% |
|  3 | 傷害 +20% |
|  4 | 冷卻 -20% |
|  5 | 火焰數 +1  |

---

### 4. Thunder Strike

隨機打擊附近敵人。

| Lv | 效果       |
| -: | -------- |
|  1 | 打擊 1 個敵人 |
|  2 | 傷害 +25%  |
|  3 | 目標 +1    |
|  4 | 冷卻 -20%  |
|  5 | 目標 +2    |

---

## 十、效能規劃

這類遊戲很容易因為怪物、子彈太多而卡頓，所以一開始就要設計好。

### 必做優化

1. **Object Pooling**
   子彈、怪物、經驗寶石不要一直 new / destroy。

2. **限制敵人數量**
   MVP 可以先限制 300 隻敵人。

3. **限制掉落物數量**
   經驗寶石可以合併。

4. **距離過遠的敵人重新放置**
   敵人離玩家太遠時，重新生成到畫面邊緣。

5. **碰撞分區**
   後期可以做 spatial grid，避免所有子彈都跟所有敵人檢查。

---

## 十一、資料驅動設計

不要把所有數值寫死在邏輯裡。
武器、敵人、升級、波次都用 config 管理。

例如：

```ts
export const ENEMY_CONFIGS = {
  slime: {
    id: "slime",
    name: "Slime",
    hp: 20,
    damage: 10,
    moveSpeed: 70,
    exp: 1,
    radius: 14
  },
  bat: {
    id: "bat",
    name: "Bat",
    hp: 12,
    damage: 8,
    moveSpeed: 120,
    exp: 1,
    radius: 10
  },
  golem: {
    id: "golem",
    name: "Golem",
    hp: 80,
    damage: 20,
    moveSpeed: 45,
    exp: 5,
    radius: 20
  }
} as const;
```

這樣之後調整平衡會很快。

---

## 十二、版本規劃

### v0.1 Prototype

* 玩家移動
* 敵人追蹤
* 自動射擊
* 怪物死亡

### v0.2 Core Loop

* 經驗值
* 升級
* 三選一技能
* 血量與死亡

### v0.3 Content Build

* 4 種武器
* 3 種怪物
* 1 個 Boss
* 10 分鐘關卡

### v0.4 Polish

* UI
* 音效
* 特效
* 主選單
* 結算畫面

### v1.0 Public Demo

* GitHub Pages 部署
* 手機版支援
* 排行榜 localStorage
* 平衡調整

---

## 十三、我建議你先做的第一步

先建立一個可以部署的空專案：

```bash
npm create vite@latest survivors-ts -- --template vanilla-ts
cd survivors-ts
npm install
npm install phaser
npm run dev
```

接著我會建議從這個順序做：

```txt
1. 建立 Phaser Game
2. 建立 GameScene
3. 畫出玩家
4. 加入 WASD 移動
5. 加入敵人生成
6. 敵人追玩家
7. 玩家自動射擊最近敵人
8. 加入 GitHub Pages 部署
```

---

## 我會替你定下來的開發方向

這個專案定位為：

> **TypeScript + Phaser 3 製作的瀏覽器版 Survivors-like Roguelite，自動攻擊、升級選技能、怪物海、可部署 GitHub Pages。**

第一階段不要追求完整美術，先用圓形、方塊、簡單粒子做出「好玩」的手感。等核心循環完成，再換素材、加特效與音樂。

# Going Dutch - 旅遊分帳 PWA

## 產品概述

**Going Dutch** 是一款專為旅遊團體設計的分帳應用程式，讓朋友們在旅行結束後能輕鬆結算各自的花費。

### 核心價值主張
- **零後端管理**：使用 Firebase 作為 BaaS，完全免費（在免費額度內）
- **即時同步**：所有成員可即時看到帳單更新
- **離線支援**：PWA 架構，支援離線使用
- **精美介面**：現代化 UI 設計，操作直覺

---

## 目標用戶

### 主要用戶
- 朋友旅遊團體（3-10 人）
- 室友共同生活
- 聚餐分帳需求者

### 用戶痛點
1. 旅行中誰付了什麼錢記不清楚
2. 不是每筆消費都要平分（例如：有人沒吃某餐）
3. 最後結算時計算複雜
4. 收據照片散落各處難以追蹤

---

## 功能需求

### 1. 群組管理

#### 1.1 建立群組
- 輸入群組名稱（例如：「日本東京行 2024」）
- 自動產生 8 位數邀請碼（增強安全性）
- 建立者自動成為群組成員

#### 1.2 加入群組
- **透過邀請連結加入**（推薦）：點擊連結 → 輸入暱稱 → 加入
- 手動輸入邀請碼加入
- 輸入自己的暱稱（在此群組中的顯示名稱）
- 自動分配頭像顏色

#### 1.3 群組資訊
- 顯示所有成員列表
- 顯示群組建立日期
- 顯示總支出金額
- **邀請連結分享**：一鍵複製或分享加入連結（格式：`https://domain.com/join/XXXXXXXX`）

### 2. 帳單記錄

#### 2.1 新增帳單
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| 金額 | 數字 | ✅ | 支援小數點兩位 |
| 付款人 | 選擇 | ✅ | 從群組成員中選擇 |
| 分帳對象 | 多選 | ✅ | 預設全選，可取消特定成員 |
| 描述 | 文字 | ✅ | 簡短說明（例如：晚餐、計程車） |
| 分類 | 選擇 | ❌ | 餐飲/交通/住宿/娛樂/購物/其他 |
| 日期 | 日期 | ❌ | 預設今天 |
| 圖片 | 上傳 | ❌ | 支援多張，最多 3 張 |
| 備註 | 文字 | ❌ | 詳細說明 |

#### 2.2 分帳模式
- **均分**：金額除以參與人數（預設）
- **自訂金額**：手動輸入每人應付金額
- **比例分配**：按比例分配（例如：大人小孩不同）

#### 2.3 帳單列表
- 依日期倒序排列
- 顯示付款人頭像、金額、描述
- 可點擊查看詳情
- 支援搜尋和篩選（按分類、付款人）

#### 2.4 編輯/刪除帳單
- 任何成員可編輯帳單
- 刪除需二次確認
- 記錄最後編輯時間和編輯者

### 3. 即時同步

#### 3.1 同步機制
- 使用 Firebase Realtime Database 或 Firestore
- 新增/編輯/刪除即時推送到所有成員
- 顯示「同步中...」狀態指示器

#### 3.2 衝突處理
- 最後寫入者勝出
- 顯示「資料已被其他人更新」提示

#### 3.3 離線支援
- PWA Service Worker 快取
- 離線時可瀏覽歷史帳單
- 離線新增的帳單在連線後自動同步

### 4. 結算功能

#### 4.1 結算摘要
顯示以下資訊：
- 總支出金額
- 每人總支出
- 每人應付金額
- **最終結算**：誰該付給誰多少錢

#### 4.2 結算演算法
使用最小化交易次數演算法：
```
1. 計算每人淨額（應付 - 已付）
2. 將正值（欠錢）和負值（被欠）分組
3. 配對最大欠款者和最大債權人
4. 重複直到所有人淨額為 0
```

#### 4.3 結算介面
- 視覺化顯示誰付給誰
- 金額四捨五入到整數（可設定）
- 支援標記「已付清」
- 匯出結算單（圖片格式）

### 5. 圖片管理

#### 5.1 上傳功能
- 支援相機拍照或相簿選擇
- 自動壓縮（最大 1MB）
- 上傳進度顯示

#### 5.2 儲存方案
- 使用 Firebase Storage
- 圖片與帳單關聯
- 支援點擊放大檢視

#### 5.3 限制
- 每張圖片最大 5MB（壓縮前）
- 每筆帳單最多 3 張圖片
- 每群組免費額度內約可存 1GB

### 6. 用戶識別

#### 6.1 匿名使用（MVP）
- 無需註冊/登入
- 使用 LocalStorage 存儲用戶 ID
- 設備綁定（換設備需重新加入群組）

#### 6.2 可選帳號系統（Phase 2）
- Google 登入
- 跨設備同步身份
- 歷史群組記錄

---

## 非功能需求

### 效能
- 首次載入 < 3 秒（3G 網路）
- 即時同步延遲 < 1 秒
- Lighthouse 分數 > 90

### 安全性
- **無需登入設計**：為了便利性，採用匿名使用模式
- Firebase Security Rules 保護資料（建議規則見下方）
- 8 位數邀請碼增加暴力破解難度（31^8 ≈ 8520 億組合）
- 圖片 URL 不可被猜測

#### 建議的 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, create: if true;
      allow update: if true;
      allow delete: if false;  // 禁止刪除群組
    }
    match /expenses/{expenseId} {
      allow read, create: if true;
      allow update: if true;
      allow delete: if false;  // 禁止刪除帳單（防止惡意刪除）
    }
  }
}
```

### 可用性
- 支援 iOS Safari / Android Chrome
- 響應式設計（手機優先）
- 支援 PWA 安裝到主畫面

### 免費額度估算（Firebase）
| 服務 | 免費額度 | 預估使用量（100 群組） |
|------|----------|------------------------|
| Firestore | 1GB 儲存, 50K 讀/天 | ~100MB, ~5K 讀/天 |
| Storage | 5GB | ~500MB |
| Hosting | 10GB/月 | ~1GB/月 |

---

## 技術架構

### 前端技術棧
```
├── React 18 + TypeScript
├── Vite（建置工具）
├── TailwindCSS + shadcn/ui（UI 元件）
├── React Router（路由）
├── Zustand（狀態管理）
├── React Query + Firebase SDK（資料層）
└── Workbox（PWA Service Worker）
```

### 後端服務（Firebase）
```
├── Firebase Authentication（匿名登入 + Google）
├── Cloud Firestore（資料庫）
├── Firebase Storage（圖片儲存）
└── Firebase Hosting（靜態網站託管）
```

### 資料模型

```typescript
// 群組
interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Timestamp;
  createdBy: string;
  members: Member[];
  currency: string; // 預設 TWD
}

// 成員
interface Member {
  id: string;
  name: string;
  color: string; // 頭像顏色
  joinedAt: Timestamp;
}

// 帳單
interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: Category;
  paidBy: string; // Member ID
  splitWith: string[]; // Member IDs
  splitMode: 'equal' | 'custom' | 'ratio';
  customSplit?: Record<string, number>; // Member ID -> 金額
  date: Timestamp;
  images: string[]; // Storage URLs
  note?: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// 分類
type Category =
  | 'food'      // 餐飲
  | 'transport' // 交通
  | 'lodging'   // 住宿
  | 'activity'  // 娛樂
  | 'shopping'  // 購物
  | 'other';    // 其他

// 結算記錄
interface Settlement {
  from: string;    // Member ID
  to: string;      // Member ID
  amount: number;
  isPaid: boolean;
  paidAt?: Timestamp;
}
```

---

## UI/UX 設計規範

### 設計風格
- **風格**：現代極簡、友善溫暖
- **主色調**：Teal/Cyan 系（#0D9488）
- **輔助色**：Amber 警示、Green 成功
- **字體**：Inter（英文）+ Noto Sans TC（中文）
- **圓角**：大圓角（16px）營造親和感
- **陰影**：柔和陰影增加層次

### 頁面架構
```
首頁（群組列表）
├── 建立群組
├── 加入群組
└── 群組詳情
    ├── 帳單列表（Tab 1）
    │   ├── 新增帳單（Modal）
    │   └── 帳單詳情（Modal）
    ├── 成員列表（Tab 2）
    └── 結算頁面（Tab 3）
        └── 匯出結算單
```

### 關鍵畫面

#### 1. 首頁 - 群組列表
- 大按鈕：建立群組 / 加入群組
- 群組卡片：顯示名稱、成員數、總金額
- 空狀態友善提示

#### 2. 群組詳情 - 帳單列表
- 底部固定「+ 新增帳單」按鈕
- 帳單卡片水平滑動可快速刪除
- 下拉刷新

#### 3. 新增帳單表單
- 大數字鍵盤輸入金額
- 成員選擇用 Chip 多選
- 相機圖示快速上傳收據

#### 4. 結算頁面
- 視覺化流向圖（A → B：$500）
- 點擊可標記已付清
- 分享/匯出按鈕

### 動效設計
- 頁面切換：Slide 過場
- 列表項目：Stagger 進場
- 按鈕互動：Scale + Ripple
- 載入狀態：Skeleton Screen

---

## 開發階段規劃

### Phase 1：MVP（2 週）
**目標**：核心分帳功能可用

- [x] 專案初始化（Vite + React + TypeScript）
- [ ] Firebase 專案設定
- [ ] 群組 CRUD
- [ ] 成員管理
- [ ] 帳單 CRUD（不含圖片）
- [ ] 基本結算計算
- [ ] 基礎 UI 元件

### Phase 2：完整功能（1 週）
**目標**：所有功能完成

- [ ] 圖片上傳功能
- [ ] 即時同步優化
- [ ] 結算演算法優化
- [ ] 匯出結算單
- [ ] PWA 設定

### Phase 3：體驗優化（1 週）
**目標**：打磨細節

- [ ] 動效實作
- [ ] 離線支援
- [ ] 效能優化
- [ ] 多語系（中/英）
- [ ] 深色模式

---

## 成功指標

### 功能性
- [ ] 可建立群組並邀請成員加入
- [ ] 可新增/編輯/刪除帳單
- [ ] 支援選擇性分帳
- [ ] 可上傳收據圖片
- [ ] 即時同步正常運作
- [ ] 結算金額計算正確

### 體驗性
- [ ] 3 步驟內完成新增帳單
- [ ] 首次使用無需教學即可上手
- [ ] 載入時間 < 3 秒

### 技術性
- [ ] Lighthouse 分數 > 90
- [ ] PWA 可安裝
- [ ] 離線可瀏覽歷史資料

---

## 附錄

### A. 競品分析

| 功能 | Splitwise | Tricount | Going Dutch |
|------|-----------|----------|-------------|
| 免費使用 | 有限制 | ✅ | ✅ |
| 即時同步 | ✅ | ✅ | ✅ |
| 選擇性分帳 | ✅ | ✅ | ✅ |
| 收據圖片 | 付費功能 | ✅ | ✅ |
| 離線支援 | ❌ | 部分 | ✅ |
| 中文介面 | ✅ | ❌ | ✅ |
| 無需註冊 | ❌ | ✅ | ✅ |

### B. 術語表

| 術語 | 說明 |
|------|------|
| 群組 | 一群一起分帳的人，通常對應一次旅行 |
| 帳單/支出 | 單筆消費記錄 |
| 付款人 | 實際掏錢付款的人 |
| 分帳對象 | 應該共同分擔這筆費用的人 |
| 結算 | 最終計算誰該付給誰多少錢 |

### C. 邀請碼格式
- 8 位數大寫英數字（增強安全性）
- 排除易混淆字元（0, O, I, L, 1）
- 範例：`A3B7K9XY`
- 可透過連結分享：`https://going-dutch-master.web.app/join/A3B7K9XY`

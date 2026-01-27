# Going Dutch - Claude Code 開發指南

## 快速開始

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 程式碼檢查
pnpm lint

# 部署到 Firebase
firebase deploy --only hosting
```

## 專案概述

Going Dutch 是一款旅遊分帳 PWA，讓團體成員可以記錄支出、自訂分攤金額，並自動計算結算。

### 技術棧

- **前端**: React 19 + TypeScript + Vite
- **樣式**: TailwindCSS v4 + shadcn/ui
- **狀態**: Zustand
- **後端**: Firebase (Firestore, Auth)
- **路由**: React Router v7
- **PWA**: vite-plugin-pwa

## 專案結構

```
src/
├── components/          # UI 元件
│   ├── ui/             # shadcn/ui 基礎元件
│   ├── AddExpenseDialog.tsx  # 新增支出對話框
│   ├── ExpenseList.tsx       # 支出列表
│   ├── MemberList.tsx        # 成員列表
│   └── Settlement.tsx        # 結算元件
├── hooks/              # React Hooks
│   ├── useGroup.ts     # 單一群組操作
│   ├── useGroups.ts    # 群組列表操作
│   ├── useExpenses.ts  # 支出操作
│   └── useTranslation.ts  # 多語系
├── i18n/
│   └── translations.ts # 翻譯檔（zh-TW, en, ja, ko, es）
├── lib/
│   ├── firebase.ts     # Firebase 初始化
│   └── utils.ts        # 工具函式
├── pages/              # 頁面元件
│   ├── HomePage.tsx    # 首頁
│   ├── GroupPage.tsx   # 群組詳情頁
│   └── JoinPage.tsx    # 加入群組頁
├── stores/
│   └── user-store.ts   # 使用者狀態（Zustand）
└── types/
    └── index.ts        # TypeScript 型別定義
```

## 資料結構

### Member (成員)

```typescript
interface Member {
  id: string
  name: string
  color: string
  joinedAt: Timestamp
  authUid: string       // Firebase Auth UID (Row-Level Security)
}
```

### Group (群組)

```typescript
interface Group {
  id: string
  name: string
  inviteCode: string
  createdAt: Timestamp
  createdBy: string
  createdByAuthUid: string    // Firebase Auth UID of creator
  members: Member[]
  memberAuthUids: string[]    // Array for security rules
  settlements?: SettlementRecord[]
  expiresAt: Timestamp        // TTL 用，目前需 Blaze 方案
}
```

### Expense (支出)

```typescript
interface Expense {
  id: string
  groupId: string
  amount: number
  description: string
  category: Category
  paidBy: string              // 付款人 Member ID
  splitWith: string[]         // 參與分攤的成員 ID
  splitMode: 'equal' | 'custom'
  customSplit?: Record<string, number>
  date: Timestamp
  createdBy: string
  createdByAuthUid: string    // Firebase Auth UID (Row-Level Security)
  updatedByAuthUid?: string
  expiresAt: Timestamp
}
```

## 安全規則 (Row-Level Security)

```javascript
// 群組：成員才可更新
allow update: if request.auth.uid in resource.data.memberAuthUids;

// 帳單：只有建立者可編輯/刪除
allow update, delete: if request.auth.uid == resource.data.createdByAuthUid;
```

## 開發注意事項

### 多語系

新增 UI 文字時，請在 `src/i18n/translations.ts` 中為所有 5 種語言添加翻譯：
- `zh-TW` (繁體中文)
- `en` (English)
- `ja` (日本語)
- `ko` (한국어)
- `es` (Español)

### Firebase 即時同步

所有資料操作使用 Firestore `onSnapshot` 實現即時同步，修改時請保持此模式。

### 付費功能（已準備但未啟用）

1. **TTL 自動刪除**: `expiresAt` 欄位已寫入，UI 已註解
   - 相關：`src/pages/GroupPage.tsx` 中的 TTL UI 區塊

2. **圖片上傳**: `images` 欄位已預留，功能待實作

## 常見任務

### 新增翻譯

```typescript
// src/i18n/translations.ts
export const translations = {
  'zh-TW': {
    newKey: '新的文字',
    // ...
  },
  en: {
    newKey: 'New text',
    // ...
  },
  // 其他語言...
}
```

### 新增元件

1. 使用 shadcn/ui 元件作為基礎
2. 遵循現有元件的 Props 模式
3. 使用 `useTranslation` hook 處理文字

### 修改 Firestore 結構

1. 更新 `src/types/index.ts`
2. 更新對應的 hook（`useGroup.ts` 或 `useExpenses.ts`）
3. 考慮向後相容性

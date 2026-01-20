# Going Dutch - 旅遊分帳 PWA

輕鬆分帳，旅遊無憂。一款專為旅遊團體設計的分帳應用程式。

## 功能特色

- 建立分帳群組，邀請朋友加入
- 記錄每筆支出，選擇分攤對象
- 即時同步，所有成員都能看到更新
- 智慧結算，最小化交易次數

## 開發環境設定

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 設定 Firebase

1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 啟用以下服務：
   - Authentication（啟用匿名登入）
   - Cloud Firestore
   - Storage
3. 複製 `.env.example` 為 `.env` 並填入 Firebase 設定

```bash
cp .env.example .env
```

### 3. 設定 Firestore 安全規則

在 Firebase Console 的 Firestore 中設定以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, write: if true; // MVP: 開放存取
    }
    match /expenses/{expenseId} {
      allow read, write: if true; // MVP: 開放存取
    }
  }
}
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

## 技術棧

- **前端框架**: React 18 + TypeScript
- **建置工具**: Vite
- **樣式**: TailwindCSS v4 + shadcn/ui
- **狀態管理**: Zustand
- **後端服務**: Firebase (Firestore, Storage, Auth)
- **路由**: React Router v7

## 專案結構

```
src/
├── components/     # 共用元件
│   └── ui/        # shadcn/ui 基礎元件
├── hooks/         # 自訂 hooks
├── lib/           # 工具函式
├── pages/         # 頁面元件
├── stores/        # Zustand stores
└── types/         # TypeScript 型別定義
```

## 授權

MIT

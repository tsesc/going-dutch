# Going Dutch - 旅遊分帳 PWA

輕鬆分帳，旅遊無憂。一款專為旅遊團體設計的分帳應用程式。

## 線上試用

**Demo**: https://going-dutch-master.web.app/

### 快速開始

1. 開啟上方連結
2. 點擊「建立群組」，輸入群組名稱和你的暱稱
3. 分享邀請連結給朋友
4. 開始記錄帳單，系統會自動計算結算金額

> 無需註冊登入，資料儲存在雲端，所有成員即時同步

## 功能特色

- 建立分帳群組，邀請朋友加入
- 記錄每筆支出，自訂每人分攤金額
- 即時同步，所有成員都能看到更新
- 智慧結算，最小化交易次數
- 收款人可標記「已付款」狀態
- 支援多語系（中/英/日/韓/西）
- PWA 支援，可安裝到手機主畫面

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

## 自行部署

如果你想部署自己的版本，請按照以下步驟：

### 1. Fork 專案並 Clone

```bash
git clone https://github.com/YOUR_USERNAME/going-dutch.git
cd going-dutch
pnpm install
```

### 2. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：`my-going-dutch`）
4. 完成建立後，點擊「網頁」圖示新增應用程式
5. 複製 Firebase 設定值

### 3. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env` 填入你的 Firebase 設定：

```env
VITE_FIREBASE_API_KEY=你的-api-key
VITE_FIREBASE_AUTH_DOMAIN=你的專案.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的專案-id
VITE_FIREBASE_STORAGE_BUCKET=你的專案.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的-sender-id
VITE_FIREBASE_APP_ID=你的-app-id
```

### 4. 設定 Firestore

1. 在 Firebase Console 啟用 **Cloud Firestore**
2. 選擇「測試模式」或設定以下安全規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, create: if true;
      allow update: if true;
      allow delete: if false;
    }
    match /expenses/{expenseId} {
      allow read, create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
```

### 5. 設定自動刪除 (TTL)

資料會在 14 天後自動刪除。需要在 Firebase Console 設定 TTL 政策：

1. 前往 Firebase Console > Firestore Database > Indexes > TTL policies
2. 點擊「Create policy」
3. 為 `groups` collection 新增 TTL，使用 `expiresAt` 欄位
4. 為 `expenses` collection 新增 TTL，使用 `expiresAt` 欄位

或使用 Firebase CLI：

```bash
# 設定 groups 的 TTL
gcloud firestore fields ttls update expiresAt \
  --collection-group=groups \
  --enable-ttl \
  --project=going-dutch-master

# 設定 expenses 的 TTL
gcloud firestore fields ttls update expiresAt \
  --collection-group=expenses \
  --enable-ttl \
  --project=你的專案-id
```

> 注意：TTL 刪除可能有 24-72 小時的延遲

### 6. 部署到 Firebase Hosting

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案（選擇 Hosting，使用 dist 資料夾）
firebase init hosting

# 建置並部署
pnpm build
firebase deploy --only hosting
```

部署完成後會顯示你的網站網址：`https://你的專案.web.app`

### 免費額度

Firebase 免費方案（Spark）提供：
- Firestore：1GB 儲存、每日 50K 讀取
- Hosting：10GB/月 傳輸量
- 對於小型團體使用完全足夠

## 授權

MIT

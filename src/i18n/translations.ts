import type { Language } from '@/stores/language-store'

const translations = {
  'zh-TW': {
    // Common
    cancel: '取消',
    save: '儲存',
    saving: '儲存中...',
    delete: '刪除',
    confirm: '確認',
    back: '返回',
    copy: '複製',
    copied: '已複製',
    loading: '載入中...',

    // Home Page
    appName: 'Going Dutch',
    appTagline: '旅遊分帳，輕鬆搞定',
    createGroup: '建立群組',
    joinGroup: '加入群組',
    myGroups: '我的群組',
    noGroups: '還沒有群組',
    createOrJoinHint: '建立或加入一個群組開始分帳',
    groupName: '群組名稱',
    groupNamePlaceholder: '例如：日本東京行 2024',
    nickname: '你的暱稱',
    nicknamePlaceholder: '輸入你的暱稱',
    inviteCode: '邀請碼',
    inviteCodePlaceholder: '輸入 8 位邀請碼',
    creating: '建立中...',
    joining: '加入中...',
    members: '位成員',
    totalExpense: '總支出',

    // Group Page
    inviteLink: '邀請連結',
    expenses: '帳單',
    membersTab: '成員',
    settlement: '結算',
    addExpense: '新增帳單',
    noExpenses: '還沒有帳單',
    addFirstExpenseHint: '點擊下方按鈕新增第一筆帳單',
    paidBy: '付款',
    splitCount: '人分攤',
    confirmDelete: '確定要刪除這筆帳單嗎？',
    groupNotFound: '找不到此群組',
    backToHome: '返回首頁',

    // Add Expense Dialog
    addExpenseTitle: '新增帳單',
    amount: '金額',
    description: '描述',
    descriptionPlaceholder: '例如：晚餐、計程車',
    category: '分類',
    whoPaid: '誰付的',
    selectPayer: '選擇付款人',
    splitWith: '分給誰',
    selectAll: '全選',
    saveFailed: '儲存失敗，請稍後再試',

    // Categories
    categoryFood: '餐飲',
    categoryTransport: '交通',
    categoryLodging: '住宿',
    categoryActivity: '娛樂',
    categoryShopping: '購物',
    categoryOther: '其他',

    // Member List
    totalPaid: '已付',
    shouldPay: '應付',
    balance: '結餘',
    expenseCount: '筆',

    // Settlement
    settlementTitle: '結算明細',
    noSettlement: '目前沒有需要結算的款項',
    allSettled: '大家都結清了！',
    shouldPayTo: '應付給',

    // Join Page
    joinGroupTitle: '加入分帳群組',
    yourNickname: '你的暱稱',
    joinFailed: '加入群組失敗，請稍後再試',
    inviteCodeNotFound: '找不到此邀請碼對應的群組',

    // Share
    shareTitle: '加入',
    shareText: '來加入「{groupName}」分帳群組！',
    shareTextWithLink: '來加入「{groupName}」分帳群組！\n\n點擊連結加入：\n{link}',

    // Language
    language: '語言',
    languageZhTW: '繁體中文',
    languageEn: 'English',
  },

  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    copy: 'Copy',
    copied: 'Copied',
    loading: 'Loading...',

    // Home Page
    appName: 'Going Dutch',
    appTagline: 'Split bills, stress-free',
    createGroup: 'Create Group',
    joinGroup: 'Join Group',
    myGroups: 'My Groups',
    noGroups: 'No groups yet',
    createOrJoinHint: 'Create or join a group to start splitting',
    groupName: 'Group Name',
    groupNamePlaceholder: 'e.g., Tokyo Trip 2024',
    nickname: 'Your Nickname',
    nicknamePlaceholder: 'Enter your nickname',
    inviteCode: 'Invite Code',
    inviteCodePlaceholder: 'Enter 8-digit code',
    creating: 'Creating...',
    joining: 'Joining...',
    members: 'members',
    totalExpense: 'Total',

    // Group Page
    inviteLink: 'Invite Link',
    expenses: 'Expenses',
    membersTab: 'Members',
    settlement: 'Settle',
    addExpense: 'Add Expense',
    noExpenses: 'No expenses yet',
    addFirstExpenseHint: 'Tap the button below to add your first expense',
    paidBy: 'paid',
    splitCount: 'split',
    confirmDelete: 'Are you sure you want to delete this expense?',
    groupNotFound: 'Group not found',
    backToHome: 'Back to Home',

    // Add Expense Dialog
    addExpenseTitle: 'Add Expense',
    amount: 'Amount',
    description: 'Description',
    descriptionPlaceholder: 'e.g., Dinner, Taxi',
    category: 'Category',
    whoPaid: 'Who paid',
    selectPayer: 'Select payer',
    splitWith: 'Split with',
    selectAll: 'Select All',
    saveFailed: 'Failed to save. Please try again.',

    // Categories
    categoryFood: 'Food',
    categoryTransport: 'Transport',
    categoryLodging: 'Lodging',
    categoryActivity: 'Activity',
    categoryShopping: 'Shopping',
    categoryOther: 'Other',

    // Member List
    totalPaid: 'Paid',
    shouldPay: 'Owes',
    balance: 'Balance',
    expenseCount: 'items',

    // Settlement
    settlementTitle: 'Settlement',
    noSettlement: 'No settlements needed',
    allSettled: 'All settled up!',
    shouldPayTo: 'owes',

    // Join Page
    joinGroupTitle: 'Join Group',
    yourNickname: 'Your Nickname',
    joinFailed: 'Failed to join group. Please try again.',
    inviteCodeNotFound: 'No group found with this invite code',

    // Share
    shareTitle: 'Join',
    shareText: 'Join "{groupName}" expense group!',
    shareTextWithLink: 'Join "{groupName}" expense group!\n\nClick to join:\n{link}',

    // Language
    language: 'Language',
    languageZhTW: '繁體中文',
    languageEn: 'English',
  },
} as const

export type TranslationKey = keyof typeof translations['zh-TW']

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations['zh-TW'][key] || key
}

export function t(lang: Language, key: TranslationKey, params?: Record<string, string>): string {
  let text = getTranslation(lang, key)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}

export { translations }

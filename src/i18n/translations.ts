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
    perPerson: '人均',
    shareSettlement: '分享結算單',
    toReceive: '可收回',
    toPay: '需支付',

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
    equalSplit: '均分',
    notIncluded: '未包含',
    addToSplit: '加入分帳',
    splitTotal: '分帳總計',
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
    completed: '已完成',
    paid: '已付',
    unpaid: '未付',
    markAsPaid: '標記為已付款',
    onlyReceiverCanMark: '只有收款人可以標記',

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
    perPerson: 'Per person',
    shareSettlement: 'Share Settlement',
    toReceive: 'to receive',
    toPay: 'to pay',

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
    equalSplit: 'Equal Split',
    notIncluded: 'Not included',
    addToSplit: 'Add to split',
    splitTotal: 'Split total',
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
    completed: 'completed',
    paid: 'Paid',
    unpaid: 'Unpaid',
    markAsPaid: 'Mark as paid',
    onlyReceiverCanMark: 'Only receiver can mark as paid',

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
  },

  ja: {
    // Common
    cancel: 'キャンセル',
    save: '保存',
    saving: '保存中...',
    delete: '削除',
    confirm: '確認',
    back: '戻る',
    copy: 'コピー',
    copied: 'コピー済み',
    loading: '読み込み中...',

    // Home Page
    appName: 'Going Dutch',
    appTagline: '旅行の割り勘を簡単に',
    createGroup: 'グループ作成',
    joinGroup: 'グループ参加',
    myGroups: 'マイグループ',
    noGroups: 'グループがありません',
    createOrJoinHint: 'グループを作成または参加して割り勘を始めましょう',
    groupName: 'グループ名',
    groupNamePlaceholder: '例：東京旅行 2024',
    nickname: 'ニックネーム',
    nicknamePlaceholder: 'ニックネームを入力',
    inviteCode: '招待コード',
    inviteCodePlaceholder: '8桁のコードを入力',
    creating: '作成中...',
    joining: '参加中...',
    members: '人',
    totalExpense: '合計',

    // Group Page
    inviteLink: '招待リンク',
    expenses: '支出',
    membersTab: 'メンバー',
    settlement: '精算',
    addExpense: '支出を追加',
    noExpenses: '支出がありません',
    addFirstExpenseHint: '下のボタンをタップして最初の支出を追加',
    paidBy: '支払い',
    splitCount: '人で割り勘',
    confirmDelete: 'この支出を削除しますか？',
    groupNotFound: 'グループが見つかりません',
    backToHome: 'ホームに戻る',
    perPerson: '一人当たり',
    shareSettlement: '精算を共有',
    toReceive: '受け取り',
    toPay: '支払い',

    // Add Expense Dialog
    addExpenseTitle: '支出を追加',
    amount: '金額',
    description: '説明',
    descriptionPlaceholder: '例：夕食、タクシー',
    category: 'カテゴリ',
    whoPaid: '支払った人',
    selectPayer: '支払者を選択',
    splitWith: '割り勘する人',
    selectAll: '全選択',
    equalSplit: '均等に分ける',
    notIncluded: '含まれていない',
    addToSplit: '割り勘に追加',
    splitTotal: '割り勘合計',
    saveFailed: '保存に失敗しました。再度お試しください。',

    // Categories
    categoryFood: '食事',
    categoryTransport: '交通',
    categoryLodging: '宿泊',
    categoryActivity: 'アクティビティ',
    categoryShopping: 'ショッピング',
    categoryOther: 'その他',

    // Member List
    totalPaid: '支払済',
    shouldPay: '負担額',
    balance: '残高',
    expenseCount: '件',

    // Settlement
    settlementTitle: '精算明細',
    noSettlement: '精算の必要はありません',
    allSettled: '全員精算済み！',
    shouldPayTo: 'に支払う',
    completed: '完了',
    paid: '支払済',
    unpaid: '未払い',
    markAsPaid: '支払済にする',
    onlyReceiverCanMark: '受取人のみ確認できます',

    // Join Page
    joinGroupTitle: 'グループに参加',
    yourNickname: 'あなたのニックネーム',
    joinFailed: 'グループへの参加に失敗しました。再度お試しください。',
    inviteCodeNotFound: 'この招待コードのグループが見つかりません',

    // Share
    shareTitle: '参加',
    shareText: '「{groupName}」の割り勘グループに参加しよう！',
    shareTextWithLink: '「{groupName}」の割り勘グループに参加しよう！\n\n参加はこちら：\n{link}',

    // Language
    language: '言語',
  },

  ko: {
    // Common
    cancel: '취소',
    save: '저장',
    saving: '저장 중...',
    delete: '삭제',
    confirm: '확인',
    back: '뒤로',
    copy: '복사',
    copied: '복사됨',
    loading: '로딩 중...',

    // Home Page
    appName: 'Going Dutch',
    appTagline: '여행 경비, 쉽게 정산',
    createGroup: '그룹 만들기',
    joinGroup: '그룹 참여',
    myGroups: '내 그룹',
    noGroups: '그룹이 없습니다',
    createOrJoinHint: '그룹을 만들거나 참여하여 정산을 시작하세요',
    groupName: '그룹 이름',
    groupNamePlaceholder: '예: 도쿄 여행 2024',
    nickname: '닉네임',
    nicknamePlaceholder: '닉네임 입력',
    inviteCode: '초대 코드',
    inviteCodePlaceholder: '8자리 코드 입력',
    creating: '생성 중...',
    joining: '참여 중...',
    members: '명',
    totalExpense: '총액',

    // Group Page
    inviteLink: '초대 링크',
    expenses: '지출',
    membersTab: '멤버',
    settlement: '정산',
    addExpense: '지출 추가',
    noExpenses: '지출이 없습니다',
    addFirstExpenseHint: '아래 버튼을 눌러 첫 번째 지출을 추가하세요',
    paidBy: '결제',
    splitCount: '명이 나눔',
    confirmDelete: '이 지출을 삭제하시겠습니까?',
    groupNotFound: '그룹을 찾을 수 없습니다',
    backToHome: '홈으로 돌아가기',
    perPerson: '1인당',
    shareSettlement: '정산 공유',
    toReceive: '받을 금액',
    toPay: '지불할 금액',

    // Add Expense Dialog
    addExpenseTitle: '지출 추가',
    amount: '금액',
    description: '설명',
    descriptionPlaceholder: '예: 저녁, 택시',
    category: '카테고리',
    whoPaid: '누가 결제',
    selectPayer: '결제자 선택',
    splitWith: '나눌 사람',
    selectAll: '전체 선택',
    equalSplit: '균등 분배',
    notIncluded: '미포함',
    addToSplit: '분배에 추가',
    splitTotal: '분배 합계',
    saveFailed: '저장에 실패했습니다. 다시 시도해주세요.',

    // Categories
    categoryFood: '식사',
    categoryTransport: '교통',
    categoryLodging: '숙박',
    categoryActivity: '액티비티',
    categoryShopping: '쇼핑',
    categoryOther: '기타',

    // Member List
    totalPaid: '지불',
    shouldPay: '부담액',
    balance: '잔액',
    expenseCount: '건',

    // Settlement
    settlementTitle: '정산 내역',
    noSettlement: '정산할 내역이 없습니다',
    allSettled: '모두 정산 완료!',
    shouldPayTo: '에게 지불',
    completed: '완료',
    paid: '완료',
    unpaid: '미완료',
    markAsPaid: '완료로 표시',
    onlyReceiverCanMark: '수령인만 표시할 수 있습니다',

    // Join Page
    joinGroupTitle: '그룹 참여',
    yourNickname: '닉네임',
    joinFailed: '그룹 참여에 실패했습니다. 다시 시도해주세요.',
    inviteCodeNotFound: '이 초대 코드에 해당하는 그룹이 없습니다',

    // Share
    shareTitle: '참여',
    shareText: '"{groupName}" 정산 그룹에 참여하세요!',
    shareTextWithLink: '"{groupName}" 정산 그룹에 참여하세요!\n\n참여 링크:\n{link}',

    // Language
    language: '언어',
  },

  es: {
    // Common
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando...',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    back: 'Volver',
    copy: 'Copiar',
    copied: 'Copiado',
    loading: 'Cargando...',

    // Home Page
    appName: 'Going Dutch',
    appTagline: 'Divide gastos fácilmente',
    createGroup: 'Crear grupo',
    joinGroup: 'Unirse al grupo',
    myGroups: 'Mis grupos',
    noGroups: 'No hay grupos',
    createOrJoinHint: 'Crea o únete a un grupo para dividir gastos',
    groupName: 'Nombre del grupo',
    groupNamePlaceholder: 'Ej: Viaje a Tokio 2024',
    nickname: 'Tu apodo',
    nicknamePlaceholder: 'Ingresa tu apodo',
    inviteCode: 'Código de invitación',
    inviteCodePlaceholder: 'Ingresa código de 8 dígitos',
    creating: 'Creando...',
    joining: 'Uniéndose...',
    members: 'miembros',
    totalExpense: 'Total',

    // Group Page
    inviteLink: 'Enlace de invitación',
    expenses: 'Gastos',
    membersTab: 'Miembros',
    settlement: 'Liquidar',
    addExpense: 'Agregar gasto',
    noExpenses: 'No hay gastos',
    addFirstExpenseHint: 'Toca el botón para agregar tu primer gasto',
    paidBy: 'pagó',
    splitCount: 'dividen',
    confirmDelete: '¿Estás seguro de eliminar este gasto?',
    groupNotFound: 'Grupo no encontrado',
    backToHome: 'Volver al inicio',
    perPerson: 'Por persona',
    shareSettlement: 'Compartir liquidación',
    toReceive: 'a recibir',
    toPay: 'a pagar',

    // Add Expense Dialog
    addExpenseTitle: 'Agregar gasto',
    amount: 'Monto',
    description: 'Descripción',
    descriptionPlaceholder: 'Ej: Cena, Taxi',
    category: 'Categoría',
    whoPaid: 'Quién pagó',
    selectPayer: 'Seleccionar pagador',
    splitWith: 'Dividir con',
    selectAll: 'Seleccionar todo',
    equalSplit: 'División igual',
    notIncluded: 'No incluido',
    addToSplit: 'Añadir a división',
    splitTotal: 'Total dividido',
    saveFailed: 'Error al guardar. Inténtalo de nuevo.',

    // Categories
    categoryFood: 'Comida',
    categoryTransport: 'Transporte',
    categoryLodging: 'Alojamiento',
    categoryActivity: 'Actividad',
    categoryShopping: 'Compras',
    categoryOther: 'Otro',

    // Member List
    totalPaid: 'Pagado',
    shouldPay: 'Debe',
    balance: 'Balance',
    expenseCount: 'items',

    // Settlement
    settlementTitle: 'Liquidación',
    noSettlement: 'No hay liquidaciones pendientes',
    allSettled: '¡Todo liquidado!',
    shouldPayTo: 'debe a',
    completed: 'completado',
    paid: 'Pagado',
    unpaid: 'Pendiente',
    markAsPaid: 'Marcar como pagado',
    onlyReceiverCanMark: 'Solo el receptor puede marcar',

    // Join Page
    joinGroupTitle: 'Unirse al grupo',
    yourNickname: 'Tu apodo',
    joinFailed: 'Error al unirse. Inténtalo de nuevo.',
    inviteCodeNotFound: 'No se encontró grupo con este código',

    // Share
    shareTitle: 'Unirse',
    shareText: '¡Únete al grupo "{groupName}"!',
    shareTextWithLink: '¡Únete al grupo "{groupName}"!\n\nHaz clic para unirte:\n{link}',

    // Language
    language: 'Idioma',
  },
} as const

export type TranslationKey = keyof typeof translations['zh-TW']

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations['en'][key] || key
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

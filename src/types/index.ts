import type { Timestamp } from 'firebase/firestore'

export type Category =
  | 'food'
  | 'transport'
  | 'lodging'
  | 'activity'
  | 'shopping'
  | 'other'

export const CATEGORY_LABELS: Record<Category, string> = {
  food: '餐飲',
  transport: '交通',
  lodging: '住宿',
  activity: '娛樂',
  shopping: '購物',
  other: '其他',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  food: '🍽️',
  transport: '🚗',
  lodging: '🏨',
  activity: '🎮',
  shopping: '🛍️',
  other: '📦',
}

export type SplitMode = 'equal' | 'custom' | 'ratio'

export interface Member {
  id: string
  name: string
  color: string
  joinedAt: Timestamp
}

export interface Group {
  id: string
  name: string
  inviteCode: string
  createdAt: Timestamp
  createdBy: string
  members: Member[]
  currency: string
}

export interface Expense {
  id: string
  groupId: string
  amount: number
  description: string
  category: Category
  paidBy: string
  splitWith: string[]
  splitMode: SplitMode
  customSplit?: Record<string, number>
  date: Timestamp
  images: string[]
  note?: string
  createdAt: Timestamp
  createdBy: string
  updatedAt?: Timestamp
  updatedBy?: string
}

export interface Settlement {
  from: string
  to: string
  amount: number
  isPaid: boolean
  paidAt?: Timestamp
}

export interface UserIdentity {
  id: string
  currentGroupMemberId?: string
}

export const MEMBER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const

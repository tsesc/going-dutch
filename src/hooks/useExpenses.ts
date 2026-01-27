import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useUserStore } from '@/stores/user-store'
import type { Expense, Category, SplitMode } from '@/types'
import { getExpirationTimestamp } from './useGroups'

function getAuthUid(): string {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
  return user.uid
}

export interface AddExpenseInput {
  amount: number
  description: string
  category: Category
  paidBy: string
  splitWith: string[]
  splitMode: SplitMode
  customSplit?: Record<string, number>
  date?: Date
  note?: string
}

export function useExpenses(groupId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getMemberId } = useUserStore()

  useEffect(() => {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[]
        setExpenses(expensesData)
        setIsLoading(false)
      },
      (error) => {
        console.error('Firestore query error:', error)
        // If it's an index error, the error message will contain a link to create the index
        if (error.message.includes('index')) {
          console.error('需要建立 Firestore 索引，請查看上方連結')
        }
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [groupId])

  const addExpense = async (input: AddExpenseInput): Promise<string> => {
    const memberId = getMemberId(groupId)
    if (!memberId) throw new Error('Not a member of this group')

    const authUid = getAuthUid()
    const expenseData = {
      groupId,
      amount: input.amount,
      description: input.description,
      category: input.category,
      paidBy: input.paidBy,
      splitWith: input.splitWith,
      splitMode: input.splitMode,
      customSplit: input.customSplit || null,
      date: input.date ? Timestamp.fromDate(input.date) : Timestamp.now(),
      images: [],
      note: input.note || null,
      createdAt: Timestamp.now(),
      createdBy: memberId,
      createdByAuthUid: authUid,
      expiresAt: getExpirationTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'expenses'), expenseData)
    return docRef.id
  }

  const deleteExpense = async (expenseId: string): Promise<void> => {
    await deleteDoc(doc(db, 'expenses', expenseId))
  }

  const updateExpense = async (expenseId: string, input: AddExpenseInput): Promise<void> => {
    const memberId = getMemberId(groupId)
    if (!memberId) throw new Error('Not a member of this group')

    const authUid = getAuthUid()
    const updateData = {
      amount: input.amount,
      description: input.description,
      category: input.category,
      paidBy: input.paidBy,
      splitWith: input.splitWith,
      splitMode: input.splitMode,
      customSplit: input.customSplit || null,
      date: input.date ? Timestamp.fromDate(input.date) : Timestamp.now(),
      note: input.note || null,
      updatedAt: Timestamp.now(),
      updatedBy: memberId,
      updatedByAuthUid: authUid,
    }

    await updateDoc(doc(db, 'expenses', expenseId), updateData)
  }

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
  }
}

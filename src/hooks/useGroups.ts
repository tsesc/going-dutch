import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserStore } from '@/stores/user-store'
import type { Group, Member } from '@/types'
import { MEMBER_COLORS } from '@/types'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function getRandomColor(existingColors: string[]): string {
  const available = MEMBER_COLORS.filter((c) => !existingColors.includes(c))
  if (available.length === 0) {
    return MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
  }
  return available[Math.floor(Math.random() * available.length)]
}

export const EXPIRATION_DAYS = 14

export function getExpirationTimestamp(): Timestamp {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + EXPIRATION_DAYS)
  return Timestamp.fromDate(expirationDate)
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { userId, memberIds, setMemberId } = useUserStore()

  useEffect(() => {
    if (!userId) return

    const groupIds = Object.keys(memberIds)
    if (groupIds.length === 0) {
      setGroups([])
      setIsLoading(false)
      return
    }

    // Firebase 'in' query supports max 30 items
    const batchedIds = groupIds.slice(0, 30)
    const q = query(
      collection(db, 'groups'),
      where('__name__', 'in', batchedIds)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[]
      setGroups(groupsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [userId, memberIds])

  const createGroup = async (name: string, nickname: string): Promise<string> => {
    if (!userId) throw new Error('User not initialized')

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const member: Member = {
      id: memberId,
      name: nickname,
      color: getRandomColor([]),
      joinedAt: Timestamp.now(),
    }

    const groupData = {
      name,
      inviteCode: generateInviteCode(),
      createdAt: Timestamp.now(),
      createdBy: memberId,
      members: [member],
      currency: 'TWD',
      expiresAt: getExpirationTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'groups'), groupData)
    setMemberId(docRef.id, memberId)
    return docRef.id
  }

  const joinGroup = async (
    inviteCode: string,
    nickname: string
  ): Promise<string | null> => {
    if (!userId) throw new Error('User not initialized')

    const q = query(
      collection(db, 'groups'),
      where('inviteCode', '==', inviteCode)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const groupDoc = snapshot.docs[0]
    const group = groupDoc.data() as Omit<Group, 'id'>

    // Check if user already in group
    const existingMemberId = memberIds[groupDoc.id]
    if (existingMemberId && group.members.some((m) => m.id === existingMemberId)) {
      return groupDoc.id
    }

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const member: Member = {
      id: memberId,
      name: nickname,
      color: getRandomColor(group.members.map((m) => m.color)),
      joinedAt: Timestamp.now(),
    }

    await updateDoc(doc(db, 'groups', groupDoc.id), {
      members: arrayUnion(member),
    })

    setMemberId(groupDoc.id, memberId)
    return groupDoc.id
  }

  return {
    groups,
    isLoading,
    createGroup,
    joinGroup,
  }
}

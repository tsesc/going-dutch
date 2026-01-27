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
import { db, auth } from '@/lib/firebase'
import { useUserStore } from '@/stores/user-store'
import type { Group, Member } from '@/types'
import { MEMBER_COLORS } from '@/types'

async function getAuthUid(): Promise<string> {
  // Wait for auth to be ready if not already
  if (!auth.currentUser) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Auth timeout')), 5000)
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          clearTimeout(timeout)
          unsubscribe()
          resolve()
        }
      })
    })
  }
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
  return user.uid
}

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

    const authUid = await getAuthUid()
    const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const member: Member = {
      id: memberId,
      name: nickname,
      color: getRandomColor([]),
      joinedAt: Timestamp.now(),
      authUid,
    }

    const groupData = {
      name,
      inviteCode: generateInviteCode(),
      createdAt: Timestamp.now(),
      createdBy: memberId,
      createdByAuthUid: authUid,
      members: [member],
      memberAuthUids: [authUid],
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

    const authUid = await getAuthUid()
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

    // Check if user already in group (by authUid)
    const existingMember = group.members.find((m) => m.authUid === authUid)
    if (existingMember) {
      setMemberId(groupDoc.id, existingMember.id)
      return groupDoc.id
    }

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const member: Member = {
      id: memberId,
      name: nickname,
      color: getRandomColor(group.members.map((m) => m.color)),
      joinedAt: Timestamp.now(),
      authUid,
    }

    await updateDoc(doc(db, 'groups', groupDoc.id), {
      members: arrayUnion(member),
      memberAuthUids: arrayUnion(authUid),
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

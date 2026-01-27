import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { Group, SettlementRecord } from '@/types'
import { useUserStore } from '@/stores/user-store'

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getMemberId } = useUserStore()

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      if (doc.exists()) {
        setGroup({ id: doc.id, ...doc.data() } as Group)
      } else {
        setGroup(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [groupId])

  const markSettlementPaid = async (fromId: string, toId: string) => {
    const memberId = getMemberId(groupId)
    if (!memberId || !group) return

    const settlementId = `${fromId}-${toId}`
    const existingSettlements = group.settlements || []

    // Find existing settlement or create new one
    const existingIndex = existingSettlements.findIndex((s) => s.id === settlementId)

    let updatedSettlements: SettlementRecord[]
    if (existingIndex >= 0) {
      // Toggle the isPaid status
      updatedSettlements = existingSettlements.map((s, i) =>
        i === existingIndex
          ? {
              ...s,
              isPaid: !s.isPaid,
              paidAt: !s.isPaid ? Timestamp.now() : undefined,
              markedBy: !s.isPaid ? memberId : undefined,
            }
          : s
      )
    } else {
      // Add new settlement record
      updatedSettlements = [
        ...existingSettlements,
        {
          id: settlementId,
          fromId,
          toId,
          isPaid: true,
          paidAt: Timestamp.now(),
          markedBy: memberId,
        },
      ]
    }

    await updateDoc(doc(db, 'groups', groupId), {
      settlements: updatedSettlements,
    })
  }

  const getSettlementStatus = (fromId: string, toId: string): boolean => {
    if (!group?.settlements) return false
    const settlement = group.settlements.find((s) => s.id === `${fromId}-${toId}`)
    return settlement?.isPaid || false
  }

  const resetSettlements = async () => {
    if (!group) return
    await updateDoc(doc(db, 'groups', groupId), {
      settlements: [],
    })
  }

  const removeMember = async (memberId: string): Promise<void> => {
    if (!group) throw new Error('Group not found')

    const currentAuthUid = auth.currentUser?.uid
    if (!currentAuthUid) throw new Error('Not authenticated')

    // Find the member to remove
    const memberToRemove = group.members.find((m) => m.id === memberId)
    if (!memberToRemove) throw new Error('Member not found')

    // Cannot remove the group creator
    if (group.createdBy === memberId) {
      throw new Error('Cannot remove group creator')
    }

    // Only allow: self-removal OR group creator can remove others
    const isCreator = group.createdByAuthUid === currentAuthUid
    const isSelf = memberToRemove.authUid === currentAuthUid
    if (!isCreator && !isSelf) {
      throw new Error('Only the group creator can remove other members')
    }

    // Remove member from arrays
    const updatedMembers = group.members.filter((m) => m.id !== memberId)
    const updatedMemberAuthUids = group.memberAuthUids.filter(
      (uid) => uid !== memberToRemove.authUid
    )

    await updateDoc(doc(db, 'groups', groupId), {
      members: updatedMembers,
      memberAuthUids: updatedMemberAuthUids,
    })
  }

  return { group, isLoading, markSettlementPaid, getSettlementStatus, resetSettlements, removeMember }
}

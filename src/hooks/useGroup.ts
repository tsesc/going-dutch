import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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

  return { group, isLoading, markSettlementPaid, getSettlementStatus }
}

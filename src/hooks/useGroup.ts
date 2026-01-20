import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Group } from '@/types'

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  return { group, isLoading }
}

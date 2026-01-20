import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userId: string | null
  memberIds: Record<string, string> // groupId -> memberId
  setUserId: (id: string) => void
  setMemberId: (groupId: string, memberId: string) => void
  getMemberId: (groupId: string) => string | undefined
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      memberIds: {},
      setUserId: (id) => set({ userId: id }),
      setMemberId: (groupId, memberId) =>
        set((state) => ({
          memberIds: { ...state.memberIds, [groupId]: memberId },
        })),
      getMemberId: (groupId) => get().memberIds[groupId],
    }),
    {
      name: 'going-dutch-user',
      onRehydrateStorage: () => (state) => {
        if (state && !state.userId) {
          state.setUserId(generateUserId())
        }
      },
    }
  )
)

// Initialize user ID on first load
if (typeof window !== 'undefined') {
  const state = useUserStore.getState()
  if (!state.userId) {
    state.setUserId(generateUserId())
  }
}

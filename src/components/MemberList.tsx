import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Crown } from 'lucide-react'
import type { Member, Expense } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface MemberListProps {
  members: Member[]
  expenses: Expense[]
  createdBy?: string // Member ID of group creator
  currentMemberId?: string // Current user's member ID
  isCreator?: boolean // Is current user the group creator
  onRemoveMember?: (memberId: string) => Promise<void>
}

export function MemberList({
  members,
  expenses,
  createdBy,
  currentMemberId,
  isCreator,
  onRemoveMember
}: MemberListProps) {
  const { t, language } = useTranslation()
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const getMemberStats = (memberId: string) => {
    const paid = expenses
      .filter((e) => e.paidBy === memberId)
      .reduce((sum, e) => sum + e.amount, 0)

    const owed = expenses.reduce((sum, e) => {
      if (!e.splitWith.includes(memberId)) return sum
      const share = e.amount / e.splitWith.length
      return sum + share
    }, 0)

    return { paid, owed, net: paid - owed }
  }

  const canRemoveMember = (member: Member) => {
    if (!onRemoveMember) return false
    // Cannot remove group creator
    if (member.id === createdBy) return false
    // Creator can remove anyone else
    if (isCreator) return true
    // Members can only remove themselves (leave group)
    return member.id === currentMemberId
  }

  const handleRemove = async () => {
    if (!memberToRemove || !onRemoveMember) return
    setIsRemoving(true)
    try {
      await onRemoveMember(memberToRemove.id)
      setMemberToRemove(null)
    } catch (error) {
      console.error('Failed to remove member:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const stats = getMemberStats(member.id)
          const isGroupCreator = member.id === createdBy
          const isSelf = member.id === currentMemberId
          const canRemove = canRemoveMember(member)

          return (
            <Card key={member.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar
                  className="size-12"
                  style={{ backgroundColor: member.color }}
                >
                  <AvatarFallback
                    className="text-white text-lg font-medium"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{member.name}</p>
                    {isGroupCreator && (
                      <Crown className="size-4 text-amber-500" />
                    )}
                    {isSelf && (
                      <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                        {t('you')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{t('totalPaid')} ${stats.paid.toLocaleString()}</span>
                    <span>{t('shouldPay')} ${Math.round(stats.owed).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        stats.net >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {stats.net >= 0 ? '+' : ''}${Math.round(stats.net).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stats.net >= 0
                        ? (language === 'zh-TW' ? '可收回' : 'to receive')
                        : (language === 'zh-TW' ? '需支付' : 'to pay')}
                    </p>
                  </div>

                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setMemberToRemove(member)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {memberToRemove?.id === currentMemberId
                ? t('leaveGroupTitle')
                : t('removeMemberTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.id === currentMemberId
                ? t('leaveGroupConfirm')
                : t('removeMemberConfirm', { name: memberToRemove?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isRemoving
                ? t('removing')
                : memberToRemove?.id === currentMemberId
                  ? t('leaveGroup')
                  : t('removeMember')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

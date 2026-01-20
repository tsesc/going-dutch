import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { Member, Expense } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface MemberListProps {
  members: Member[]
  expenses: Expense[]
}

export function MemberList({ members, expenses }: MemberListProps) {
  const { t, language } = useTranslation()

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

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const stats = getMemberStats(member.id)

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
                <p className="font-semibold truncate">{member.name}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{t('totalPaid')} ${stats.paid.toLocaleString()}</span>
                  <span>{t('shouldPay')} ${Math.round(stats.owed).toLocaleString()}</span>
                </div>
              </div>

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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

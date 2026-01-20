import { Receipt, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Expense, Member } from '@/types'
import { CATEGORY_ICONS } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface ExpenseListProps {
  expenses: Expense[]
  members: Member[]
  isLoading: boolean
  onDelete: (expenseId: string) => Promise<void>
}

export function ExpenseList({
  expenses,
  members,
  isLoading,
  onDelete,
}: ExpenseListProps) {
  const { t, language } = useTranslation()
  const getMember = (id: string) => members.find((m) => m.id === id)

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: t('categoryFood'),
      transport: t('categoryTransport'),
      lodging: t('categoryLodging'),
      activity: t('categoryActivity'),
      shopping: t('categoryShopping'),
      other: t('categoryOther'),
    }
    return labels[category] || category
  }

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async (expenseId: string) => {
    if (confirm(t('confirmDelete'))) {
      await onDelete(expenseId)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="flex gap-3 p-4">
              <div className="size-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-100" />
              </div>
              <div className="h-5 w-16 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Receipt className="size-12 text-gray-300" />
          <p className="text-gray-500">{t('noExpenses')}</p>
          <p className="text-sm text-gray-400">{t('addFirstExpenseHint')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const payer = getMember(expense.paidBy)
        const splitCount = expense.splitWith.length

        return (
          <Card key={expense.id} className="group">
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar
                className="size-10 shrink-0"
                style={{ backgroundColor: payer?.color || '#gray' }}
              >
                <AvatarFallback
                  className="text-white text-sm font-medium"
                  style={{ backgroundColor: payer?.color || '#gray' }}
                >
                  {payer?.name.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {CATEGORY_ICONS[expense.category]}
                  </span>
                  <span className="truncate font-medium">
                    {expense.description}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{payer?.name} {t('paidBy')}</span>
                  <span>·</span>
                  <span>{splitCount} {t('splitCount')}</span>
                  <span>·</span>
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>

              <div className="text-right shrink-0 pr-1">
                <p className="font-semibold text-primary-600">
                  ${expense.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {getCategoryLabel(expense.category)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(expense.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

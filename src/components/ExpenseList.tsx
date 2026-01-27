import { Receipt, Trash2, Pencil } from 'lucide-react'
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
  onEdit: (expense: Expense) => void
}

export function ExpenseList({
  expenses,
  members,
  isLoading,
  onDelete,
  onEdit,
}: ExpenseListProps) {
  const { t, language } = useTranslation()
  const getMember = (id: string) => members.find((m) => m.id === id)

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async (expenseId: string) => {
    // Temporarily skip confirm dialog for testing
    try {
      await onDelete(expenseId)
    } catch (error) {
      console.error('Delete expense failed:', error)
      alert('刪除失敗：' + (error instanceof Error ? error.message : String(error)))
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
    <div className="space-y-2">
      {expenses.map((expense) => {
        const payer = getMember(expense.paidBy)
        const splitCount = expense.splitWith.length

        return (
          <Card key={expense.id} className="group">
            <CardContent className="p-3 sm:p-4">
              {/* 主要內容行 */}
              <div className="flex items-center gap-3">
                <Avatar
                  className="size-9 sm:size-10 shrink-0"
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">
                      {CATEGORY_ICONS[expense.category]}
                    </span>
                    <span className="truncate font-medium text-sm sm:text-base">
                      {expense.description}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {payer?.name} {t('paidBy')} · {formatDate(expense.date)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-primary-600 text-sm sm:text-base">
                    ${expense.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {splitCount}{t('splitCount')}
                  </p>
                </div>

                {/* 桌面版按鈕 */}
                <div className="hidden sm:flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-400 hover:text-primary-500 hover:bg-primary-50"
                    onClick={() => onEdit(expense)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {/* 手機版操作按鈕 - 點擊展開或滑動顯示 */}
              <div className="flex sm:hidden justify-end gap-1 mt-2 pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-500 hover:text-primary-500 hover:bg-primary-50"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="size-3.5 mr-1" />
                  {t('edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(expense.id)}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

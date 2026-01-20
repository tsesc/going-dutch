import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { Member, Expense } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useUserStore } from '@/stores/user-store'
import { useParams } from 'react-router-dom'

interface SettlementProps {
  members: Member[]
  expenses: Expense[]
  onMarkPaid?: (fromId: string, toId: string) => void
  getSettlementStatus?: (fromId: string, toId: string) => boolean
}

interface Transaction {
  from: Member
  to: Member
  amount: number
}

function calculateSettlements(
  members: Member[],
  expenses: Expense[]
): Transaction[] {
  // Calculate net balance for each member
  const balances: Record<string, number> = {}
  members.forEach((m) => {
    balances[m.id] = 0
  })

  expenses.forEach((expense) => {
    // Add what the payer paid
    balances[expense.paidBy] += expense.amount

    // Subtract what each person owes (use customSplit if available)
    if (expense.customSplit && expense.splitMode === 'custom') {
      Object.entries(expense.customSplit).forEach(([memberId, amount]) => {
        balances[memberId] -= amount
      })
    } else {
      // Fallback to equal split
      const share = expense.amount / expense.splitWith.length
      expense.splitWith.forEach((memberId) => {
        balances[memberId] -= share
      })
    }
  })

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors: { member: Member; amount: number }[] = []
  const debtors: { member: Member; amount: number }[] = []

  members.forEach((member) => {
    const balance = Math.round(balances[member.id])
    if (balance > 0) {
      creditors.push({ member, amount: balance })
    } else if (balance < 0) {
      debtors.push({ member, amount: -balance })
    }
  })

  // Sort by amount descending
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  // Match debtors with creditors to minimize transactions
  const transactions: Transaction[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0) {
      transactions.push({
        from: debtor.member,
        to: creditor.member,
        amount,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount === 0) i++
    if (creditor.amount === 0) j++
  }

  return transactions
}

export function Settlement({ members, expenses, onMarkPaid, getSettlementStatus }: SettlementProps) {
  const { t } = useTranslation()
  const { groupId } = useParams<{ groupId: string }>()
  const { getMemberId } = useUserStore()
  const currentMemberId = groupId ? getMemberId(groupId) : undefined

  const transactions = calculateSettlements(members, expenses)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPersonAverage = members.length > 0 ? totalExpenses / members.length : 0

  if (expenses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <CheckCircle2 className="size-12 text-gray-300" />
          <p className="text-gray-500">{t('noSettlement')}</p>
        </CardContent>
      </Card>
    )
  }

  // Count paid vs unpaid transactions
  const paidCount = transactions.filter(
    (tx) => getSettlementStatus?.(tx.from.id, tx.to.id)
  ).length
  const allPaid = paidCount === transactions.length && transactions.length > 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-primary-100">{t('totalExpense')}</p>
              <p className="text-2xl font-bold">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-100">{t('perPerson')}</p>
              <p className="text-2xl font-bold">
                ${Math.round(perPersonAverage).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">{t('settlementTitle')}</h3>
          {transactions.length > 0 && (
            <span className="text-xs text-gray-400">
              {paidCount}/{transactions.length} {t('completed')}
            </span>
          )}
        </div>
        {transactions.length === 0 || allPaid ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-8">
              <CheckCircle2 className="size-5 text-green-500" />
              <p className="text-gray-600">{t('allSettled')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => {
              const isPaid = getSettlementStatus?.(tx.from.id, tx.to.id) || false
              const isReceiver = currentMemberId === tx.to.id

              return (
                <Card key={index} className={isPaid ? 'opacity-60' : ''}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar
                      className="size-10"
                      style={{ backgroundColor: tx.from.color }}
                    >
                      <AvatarFallback
                        className="text-white text-sm font-medium"
                        style={{ backgroundColor: tx.from.color }}
                      >
                        {tx.from.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tx.from.name}</span>
                        <ArrowRight className="size-4 text-gray-400" />
                        <span className="font-medium">{tx.to.name}</span>
                      </div>
                      <p className={`text-lg font-bold ${isPaid ? 'text-gray-400 line-through' : 'text-primary-600'}`}>
                        ${tx.amount.toLocaleString()}
                      </p>
                    </div>

                    {/* Mark as paid button - only receiver can click */}
                    {onMarkPaid && (
                      <button
                        type="button"
                        onClick={() => onMarkPaid(tx.from.id, tx.to.id)}
                        disabled={!isReceiver && !isPaid}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                          isPaid
                            ? 'bg-green-100 text-green-700'
                            : isReceiver
                            ? 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        title={isReceiver ? t('markAsPaid') : t('onlyReceiverCanMark')}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="size-4" />
                            <span>{t('paid')}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="size-4" />
                            <span>{t('unpaid')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

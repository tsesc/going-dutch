import { ArrowRight, CheckCircle2, Circle, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Member, Expense } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useUserStore } from '@/stores/user-store'
import { useParams } from 'react-router-dom'

interface SettlementProps {
  members: Member[]
  expenses: Expense[]
  onMarkPaid?: (fromId: string, toId: string) => void
  onResetSettlements?: () => void
  getSettlementStatus?: (fromId: string, toId: string) => boolean
}

interface Transaction {
  from: Member
  to: Member
  amount: number
}

interface MemberSummary {
  member: Member
  balance: number // positive = to receive, negative = to pay
  totalToPay: number
  totalToReceive: number
  payTo: { member: Member; amount: number }[]
  receiveFrom: { member: Member; amount: number }[]
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

function calculateMemberSummaries(
  members: Member[],
  transactions: Transaction[]
): MemberSummary[] {
  const summaries: MemberSummary[] = members.map((member) => ({
    member,
    balance: 0,
    totalToPay: 0,
    totalToReceive: 0,
    payTo: [],
    receiveFrom: [],
  }))

  const summaryMap = new Map(summaries.map((s) => [s.member.id, s]))

  transactions.forEach((tx) => {
    const fromSummary = summaryMap.get(tx.from.id)
    const toSummary = summaryMap.get(tx.to.id)

    if (fromSummary) {
      fromSummary.totalToPay += tx.amount
      fromSummary.balance -= tx.amount
      fromSummary.payTo.push({ member: tx.to, amount: tx.amount })
    }

    if (toSummary) {
      toSummary.totalToReceive += tx.amount
      toSummary.balance += tx.amount
      toSummary.receiveFrom.push({ member: tx.from, amount: tx.amount })
    }
  })

  // Sort by balance (most to pay first, then most to receive)
  return summaries
    .filter((s) => s.balance !== 0)
    .sort((a, b) => a.balance - b.balance)
}

export function Settlement({ members, expenses, onMarkPaid, onResetSettlements, getSettlementStatus }: SettlementProps) {
  const { t } = useTranslation()
  const { groupId } = useParams<{ groupId: string }>()
  const { getMemberId } = useUserStore()
  const currentMemberId = groupId ? getMemberId(groupId) : undefined

  const transactions = calculateSettlements(members, expenses)
  const memberSummaries = calculateMemberSummaries(members, transactions)
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

      {/* Member Summaries */}
      {memberSummaries.length > 0 && (
        <div className="grid gap-2">
          {memberSummaries.map((summary) => {
            const isCurrentUser = currentMemberId === summary.member.id
            const needsToPay = summary.balance < 0

            return (
              <Card
                key={summary.member.id}
                className={isCurrentUser ? 'ring-2 ring-primary-300' : ''}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="size-9 sm:size-10 shrink-0"
                      style={{ backgroundColor: summary.member.color }}
                    >
                      <AvatarFallback
                        className="text-white text-sm font-medium"
                        style={{ backgroundColor: summary.member.color }}
                      >
                        {summary.member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {summary.member.name}
                        {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {needsToPay ? (
                          <>
                            <TrendingDown className="size-3 text-red-500" />
                            <span>{t('toPay')}</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="size-3 text-green-500" />
                            <span>{t('toReceive')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-bold text-lg ${needsToPay ? 'text-red-600' : 'text-green-600'}`}>
                        {needsToPay ? '-' : '+'}${Math.abs(summary.balance).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Detail breakdown */}
                  {(summary.payTo.length > 0 || summary.receiveFrom.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      {summary.payTo.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ArrowRight className="size-3" />
                            {item.member.name}
                          </span>
                          <span className="text-red-500">-${item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      {summary.receiveFrom.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ArrowRight className="size-3 rotate-180" />
                            {item.member.name}
                          </span>
                          <span className="text-green-500">+${item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

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
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-8">
              <CheckCircle2 className="size-5 text-green-500" />
              <p className="text-gray-600">{t('allSettled')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* All settled banner */}
            {allPaid && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-500" />
                    <p className="text-green-700 font-medium">{t('allSettled')}</p>
                  </div>
                  {onResetSettlements && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={onResetSettlements}
                    >
                      <RotateCcw className="size-4 mr-1" />
                      {t('reset')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            {transactions.map((tx, index) => {
              const isPaid = getSettlementStatus?.(tx.from.id, tx.to.id) || false
              const isReceiver = currentMemberId === tx.to.id

              return (
                <Card key={index} className={isPaid ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="size-10 shrink-0"
                        style={{ backgroundColor: tx.from.color }}
                      >
                        <AvatarFallback
                          className="text-white text-sm font-medium"
                          style={{ backgroundColor: tx.from.color }}
                        >
                          {tx.from.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-1 min-w-0 flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium truncate">{tx.from.name}</span>
                          <ArrowRight className="size-4 text-gray-400 shrink-0" />
                          <span className="font-medium truncate">{tx.to.name}</span>
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
                          className={`flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
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
                              <span className="hidden sm:inline">{t('paid')}</span>
                            </>
                          ) : (
                            <>
                              <Circle className="size-4" />
                              <span className="hidden sm:inline">{t('unpaid')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
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

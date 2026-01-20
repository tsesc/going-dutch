import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Member, Expense } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface SettlementProps {
  members: Member[]
  expenses: Expense[]
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

    // Subtract what each person owes
    const share = expense.amount / expense.splitWith.length
    expense.splitWith.forEach((memberId) => {
      balances[memberId] -= share
    })
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

export function Settlement({ members, expenses }: SettlementProps) {
  const { t, language } = useTranslation()
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
              <p className="text-sm text-primary-100">
                {language === 'zh-TW' ? '人均' : 'Per person'}
              </p>
              <p className="text-2xl font-bold">
                ${Math.round(perPersonAverage).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">{t('settlementTitle')}</h3>
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-8">
              <CheckCircle2 className="size-5 text-green-500" />
              <p className="text-gray-600">{t('allSettled')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <Card key={index}>
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

                  <div className="flex flex-1 items-center gap-2">
                    <span className="font-medium">{tx.from.name}</span>
                    <ArrowRight className="size-4 text-gray-400" />
                    <span className="font-medium">{tx.to.name}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      ${tx.amount.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {transactions.length > 0 && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            {language === 'zh-TW' ? '分享結算單' : 'Share Settlement'}
          </Button>
        </div>
      )}
    </div>
  )
}

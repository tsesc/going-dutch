import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Receipt,
  Users,
  Calculator,
  Share2,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGroup } from '@/hooks/useGroup'
import { useExpenses } from '@/hooks/useExpenses'
import { ExpenseList } from '@/components/ExpenseList'
import { MemberList } from '@/components/MemberList'
import { Settlement } from '@/components/Settlement'
import { AddExpenseDialog } from '@/components/AddExpenseDialog'

export function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { group, isLoading: groupLoading } = useGroup(groupId!)
  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense } = useExpenses(groupId!)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [copied, setCopied] = useState(false)

  const getJoinLink = () => {
    if (!group) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/join/${group.inviteCode}`
  }

  const handleCopyLink = async () => {
    if (!group) return
    await navigator.clipboard.writeText(getJoinLink())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!group) return
    const joinLink = getJoinLink()
    const shareData = {
      title: `加入 ${group.name}`,
      text: `點擊連結加入「${group.name}」分帳群組`,
      url: joinLink,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      handleCopyLink()
    }
  }

  if (groupLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-gray-500">找不到此群組</p>
        <Button onClick={() => navigate('/')}>返回首頁</Button>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="truncate font-semibold">{group.name}</h1>
            <p className="text-xs text-gray-500">
              {group.members.length} 位成員 · 總支出 ${totalExpenses.toLocaleString()}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="size-5" />
          </Button>
        </div>
      </header>

      {/* Invite Link Banner */}
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-primary-600">邀請連結</p>
            <p className="truncate font-mono text-sm text-primary-700">
              {getJoinLink()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-primary-600 hover:bg-primary-100"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="mr-1 size-4" />
            ) : (
              <Copy className="mr-1 size-4" />
            )}
            {copied ? '已複製' : '複製'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-lg px-4">
        <Tabs defaultValue="expenses">
          <TabsList className="w-full">
            <TabsTrigger value="expenses" className="flex-1 gap-1.5">
              <Receipt className="size-4" />
              <span>帳單</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1 gap-1.5">
              <Users className="size-4" />
              <span>成員</span>
            </TabsTrigger>
            <TabsTrigger value="settlement" className="flex-1 gap-1.5">
              <Calculator className="size-4" />
              <span>結算</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <ExpenseList
              expenses={expenses}
              members={group.members}
              isLoading={expensesLoading}
              onDelete={deleteExpense}
            />
          </TabsContent>

          <TabsContent value="members">
            <MemberList members={group.members} expenses={expenses} />
          </TabsContent>

          <TabsContent value="settlement">
            <Settlement members={group.members} expenses={expenses} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Expense FAB */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Button
          size="lg"
          className="gap-2 rounded-full px-6 shadow-lg"
          onClick={() => setShowAddExpense(true)}
        >
          <Plus className="size-5" />
          新增帳單
        </Button>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        members={group.members}
        onSubmit={addExpense}
      />
    </div>
  )
}

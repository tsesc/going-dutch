import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { X } from 'lucide-react'
import type { Member, Category, Expense } from '@/types'
import { CATEGORY_ICONS } from '@/types'
import type { AddExpenseInput } from '@/hooks/useExpenses'
import { useUserStore } from '@/stores/user-store'
import { useParams } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  onSubmit: (input: AddExpenseInput) => Promise<string>
  onUpdate?: (expenseId: string, input: AddExpenseInput) => Promise<void>
  expense?: Expense | null // For edit mode
}

const CATEGORIES: Category[] = [
  'food',
  'transport',
  'lodging',
  'activity',
  'shopping',
  'other',
]

export function AddExpenseDialog({
  open,
  onOpenChange,
  members,
  onSubmit,
  onUpdate,
  expense,
}: AddExpenseDialogProps) {
  const { groupId } = useParams<{ groupId: string }>()
  const { getMemberId } = useUserStore()
  const currentMemberId = groupId ? getMemberId(groupId) : undefined
  const { t } = useTranslation()

  const isEditMode = !!expense

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [paidBy, setPaidBy] = useState('')
  const [customSplit, setCustomSplit] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getCategoryLabel = (cat: Category) => {
    const labels: Record<Category, string> = {
      food: t('categoryFood'),
      transport: t('categoryTransport'),
      lodging: t('categoryLodging'),
      activity: t('categoryActivity'),
      shopping: t('categoryShopping'),
      other: t('categoryOther'),
    }
    return labels[cat]
  }

  // Calculate equal split amount
  const calculateEqualSplit = useCallback((totalAmount: string, memberCount: number) => {
    const total = parseFloat(totalAmount)
    if (isNaN(total) || total <= 0 || memberCount === 0) return '0'
    return Math.round(total / memberCount).toString()
  }, [])

  // Update form when dialog opens - populate from expense if editing
  useEffect(() => {
    if (open) {
      if (expense) {
        // Edit mode: populate from existing expense
        setAmount(expense.amount.toString())
        setDescription(expense.description)
        setCategory(expense.category)
        setPaidBy(expense.paidBy)
        // Set customSplit from expense data
        const splitData: Record<string, string> = {}
        members.forEach((m) => {
          if (expense.customSplit && expense.customSplit[m.id] !== undefined) {
            splitData[m.id] = expense.customSplit[m.id].toString()
          } else if (expense.splitWith.includes(m.id)) {
            // If no customSplit but member is in splitWith, calculate equal
            const equalAmount = Math.round(expense.amount / expense.splitWith.length)
            splitData[m.id] = equalAmount.toString()
          } else {
            splitData[m.id] = ''
          }
        })
        setCustomSplit(splitData)
      } else {
        // Add mode: initialize with defaults
        setAmount('')
        setDescription('')
        setCategory('food')
        setPaidBy(currentMemberId || (members.length > 0 ? members[0].id : ''))
        // Initialize with all members included (use '1' as placeholder)
        // When amount changes, the useEffect will recalculate equal split
        const initialSplit: Record<string, string> = {}
        members.forEach((m) => {
          initialSplit[m.id] = '1' // Placeholder to indicate "included"
        })
        setCustomSplit(initialSplit)
      }
    }
  }, [open, expense, members, currentMemberId])

  // Recalculate equal split when amount changes
  useEffect(() => {
    if (!open) return

    // Find members that are "included" (non-empty value)
    setCustomSplit((prev) => {
      const includedEntries = Object.entries(prev).filter(([, val]) => val !== '')
      if (includedEntries.length === 0) return prev

      const total = parseFloat(amount)
      const equalAmount = isNaN(total) || total <= 0 ? '0' : Math.round(total / includedEntries.length).toString()

      const updated: Record<string, string> = {}
      Object.entries(prev).forEach(([id, val]) => {
        // Only update if member was included (non-empty)
        updated[id] = val !== '' ? equalAmount : val
      })
      return updated
    })
  }, [amount, open])

  const handleSplitAmountChange = (memberId: string, value: string) => {
    setCustomSplit((prev) => ({
      ...prev,
      [memberId]: value,
    }))
  }

  const handleRemoveMember = (memberId: string) => {
    setCustomSplit((prev) => ({
      ...prev,
      [memberId]: '',
    }))
  }

  const handleAddMember = (memberId: string) => {
    const includedCount = Object.values(customSplit).filter((v) => v !== '').length
    const equalAmount = calculateEqualSplit(amount, includedCount + 1)
    setCustomSplit((prev) => ({
      ...prev,
      [memberId]: equalAmount,
    }))
  }

  const handleEqualSplit = () => {
    setCustomSplit((prev) => {
      // Check if any members are already included
      const currentlyIncluded = Object.entries(prev).filter(([, val]) => val !== '')

      if (currentlyIncluded.length > 0) {
        // Some members already selected - only split among them
        const equalAmount = calculateEqualSplit(amount, currentlyIncluded.length)
        const updated: Record<string, string> = {}
        Object.entries(prev).forEach(([id, val]) => {
          updated[id] = val !== '' ? equalAmount : val
        })
        return updated
      } else {
        // No one selected yet - add all members
        const equalAmount = calculateEqualSplit(amount, members.length)
        const updated: Record<string, string> = {}
        members.forEach((m) => {
          updated[m.id] = equalAmount
        })
        return updated
      }
    })
  }

  // Calculate totals
  const splitTotal = Object.values(customSplit).reduce((sum, val) => {
    const num = parseFloat(val)
    return sum + (isNaN(num) ? 0 : num)
  }, 0)
  const totalAmount = parseFloat(amount) || 0
  const difference = totalAmount - splitTotal
  // Members are "included" if they have any value (including '0')
  // Members are "excluded" only if their value is empty string
  const includedMembers = members.filter((m) => customSplit[m.id] !== '')
  const excludedMembers = members.filter((m) => customSplit[m.id] === '')

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return
    if (!description.trim()) return
    if (!paidBy) return
    if (includedMembers.length === 0) return

    // Convert string amounts to numbers
    const splitWithIds = includedMembers.map((m) => m.id)
    const customSplitNumbers: Record<string, number> = {}
    includedMembers.forEach((m) => {
      customSplitNumbers[m.id] = parseFloat(customSplit[m.id]) || 0
    })

    setIsSubmitting(true)
    setError(null)
    try {
      const expenseInput = {
        amount: amountNum,
        description: description.trim(),
        category,
        paidBy,
        splitWith: splitWithIds,
        splitMode: 'custom' as const,
        customSplit: customSplitNumbers,
      }

      if (isEditMode && expense && onUpdate) {
        await onUpdate(expense.id, expenseInput)
      } else {
        await onSubmit(expenseInput)
      }

      // Reset form
      setAmount('')
      setDescription('')
      setCategory('food')
      setPaidBy(currentMemberId || '')
      const initialSplit: Record<string, string> = {}
      members.forEach((m) => {
        initialSplit[m.id] = '0'
      })
      setCustomSplit(initialSplit)
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save expense:', err)
      setError(err instanceof Error ? err.message : t('saveFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editExpenseTitle') : t('addExpenseTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl font-bold h-14"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input
              id="description"
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm transition-colors ${
                    category === cat
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate">{getCategoryLabel(cat)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label>{t('whoPaid')}</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectPayer')} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-4 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Split With */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('splitWith')}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEqualSplit}
                className="h-auto py-1 text-xs text-primary-600"
              >
                {t('equalSplit')}
              </Button>
            </div>

            {/* Included members with editable amounts */}
            <div className="space-y-2">
              {includedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-3"
                >
                  <Avatar className="size-8" style={{ backgroundColor: member.color }}>
                    <AvatarFallback
                      className="text-white text-xs"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">{member.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={customSplit[member.id] || ''}
                      onChange={(e) => handleSplitAmountChange(member.id, e.target.value)}
                      className="h-8 w-20 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Excluded members - can be added back */}
            {excludedMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">{t('notIncluded')}</p>
                {excludedMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAddMember(member.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-200 p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Avatar className="size-8 opacity-50" style={{ backgroundColor: member.color }}>
                      <AvatarFallback
                        className="text-white text-xs"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-gray-400">{member.name}</span>
                    <span className="text-xs text-primary-600">{t('addToSplit')}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Split total indicator */}
            {totalAmount > 0 && (
              <div className={`flex items-center justify-between rounded-lg p-3 text-sm ${
                Math.abs(difference) < 1 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <span>{t('splitTotal')}</span>
                <span className="font-medium">
                  ${splitTotal.toLocaleString()} / ${totalAmount.toLocaleString()}
                  {Math.abs(difference) >= 1 && (
                    <span className="ml-2">
                      ({difference > 0 ? '-' : '+'}{Math.abs(Math.round(difference)).toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              !currentMemberId ||
              !amount ||
              parseFloat(amount) <= 0 ||
              !description.trim() ||
              !paidBy ||
              includedMembers.length === 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Member, Category } from '@/types'
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
}: AddExpenseDialogProps) {
  const { groupId } = useParams<{ groupId: string }>()
  const { getMemberId } = useUserStore()
  const currentMemberId = groupId ? getMemberId(groupId) : undefined
  const { t } = useTranslation()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [paidBy, setPaidBy] = useState('')
  const [splitWith, setSplitWith] = useState<string[]>([])
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

  // Update paidBy and splitWith when dialog opens or members change
  useEffect(() => {
    if (open) {
      setPaidBy(currentMemberId || (members.length > 0 ? members[0].id : ''))
      setSplitWith(members.map((m) => m.id))
    }
  }, [open, members, currentMemberId])

  const handleToggleMember = (memberId: string) => {
    setSplitWith((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSelectAll = () => {
    setSplitWith(members.map((m) => m.id))
  }

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return
    if (!description.trim()) return
    if (!paidBy) return
    if (splitWith.length === 0) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        amount: amountNum,
        description: description.trim(),
        category,
        paidBy,
        splitWith,
        splitMode: 'equal',
      })
      // Reset form
      setAmount('')
      setDescription('')
      setCategory('food')
      setPaidBy(currentMemberId || '')
      setSplitWith(members.map((m) => m.id))
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to add expense:', err)
      setError(err instanceof Error ? err.message : t('saveFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const perPersonAmount =
    splitWith.length > 0 && parseFloat(amount) > 0
      ? parseFloat(amount) / splitWith.length
      : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addExpenseTitle')}</DialogTitle>
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
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    category === cat
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span>{getCategoryLabel(cat)}</span>
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
                onClick={handleSelectAll}
                className="h-auto py-1 text-xs text-primary-600"
              >
                {t('selectAll')}
              </Button>
            </div>
            <div className="space-y-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                    splitWith.includes(member.id)
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={splitWith.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <Avatar className="size-8" style={{ backgroundColor: member.color }}>
                    <AvatarFallback
                      className="text-white text-xs"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">{member.name}</span>
                  {splitWith.includes(member.id) && perPersonAmount > 0 && (
                    <span className="text-sm text-gray-500">
                      ${Math.round(perPersonAmount).toLocaleString()}
                    </span>
                  )}
                </label>
              ))}
            </div>
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
              !amount ||
              parseFloat(amount) <= 0 ||
              !description.trim() ||
              !paidBy ||
              splitWith.length === 0 ||
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGroups } from '@/hooks/useGroups'
import { useTranslation } from '@/hooks/useTranslation'
import type { Language } from '@/stores/language-store'

export function HomePage() {
  const navigate = useNavigate()
  const { groups, createGroup, joinGroup, isLoading } = useGroups()
  const { t, language, setLanguage } = useTranslation()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !nickname.trim()) return
    setIsSubmitting(true)
    try {
      const groupId = await createGroup(groupName.trim(), nickname.trim())
      setShowCreateDialog(false)
      setGroupName('')
      setNickname('')
      navigate(`/group/${groupId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim() || !nickname.trim()) return
    setIsSubmitting(true)
    try {
      const groupId = await joinGroup(inviteCode.trim().toUpperCase(), nickname.trim())
      if (groupId) {
        setShowJoinDialog(false)
        setInviteCode('')
        setNickname('')
        navigate(`/group/${groupId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLanguage = () => {
    const newLang: Language = language === 'zh-TW' ? 'en' : 'zh-TW'
    setLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Language Selector */}
        <div className="mb-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-500"
            onClick={toggleLanguage}
          >
            <Globe className="size-4" />
            <span>{language === 'zh-TW' ? 'EN' : '中文'}</span>
          </Button>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('appName')}</h1>
          <p className="mt-2 text-gray-500">{t('appTagline')}</p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-6" />
            <span>{t('createGroup')}</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => setShowJoinDialog(true)}
          >
            <UserPlus className="size-6" />
            <span>{t('joinGroup')}</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="h-5 w-32 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-24 rounded bg-gray-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">{t('myGroups')}</h2>
            {groups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/group/${group.id}`)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <Users className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.members.length} {t('members')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="size-12 text-gray-300" />
              <p className="text-gray-500">{t('noGroups')}</p>
              <p className="text-sm text-gray-400">{t('createOrJoinHint')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createGroup')}</DialogTitle>
            <DialogDescription>
              {language === 'zh-TW'
                ? '為你的旅行或活動建立一個分帳群組'
                : 'Create a group for your trip or event'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">{t('groupName')}</Label>
              <Input
                id="groupName"
                placeholder={t('groupNamePlaceholder')}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">{t('nickname')}</Label>
              <Input
                id="nickname"
                placeholder={t('nicknamePlaceholder')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !nickname.trim() || isSubmitting}
            >
              {isSubmitting ? t('creating') : t('createGroup')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('joinGroup')}</DialogTitle>
            <DialogDescription>
              {language === 'zh-TW'
                ? '輸入邀請碼加入現有群組'
                : 'Enter the invite code to join an existing group'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">{t('inviteCode')}</Label>
              <Input
                id="inviteCode"
                placeholder={t('inviteCodePlaceholder')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinNickname">{t('nickname')}</Label>
              <Input
                id="joinNickname"
                placeholder={t('nicknamePlaceholder')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleJoinGroup}
              disabled={
                inviteCode.length !== 8 || !nickname.trim() || isSubmitting
              }
            >
              {isSubmitting ? t('joining') : t('joinGroup')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

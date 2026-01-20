import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGroups } from '@/hooks/useGroups'
import { useTranslation } from '@/hooks/useTranslation'

export function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const navigate = useNavigate()
  const { joinGroup } = useGroups()
  const { t } = useTranslation()
  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    if (!nickname.trim() || !inviteCode) return

    setIsJoining(true)
    setError(null)

    try {
      const groupId = await joinGroup(inviteCode, nickname.trim())
      if (groupId) {
        navigate(`/group/${groupId}`)
      } else {
        setError(t('inviteCodeNotFound'))
      }
    } catch (err) {
      console.error('Failed to join group:', err)
      setError(t('joinFailed'))
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-primary-100">
            <Users className="size-8 text-primary-600" />
          </div>
          <CardTitle className="text-xl">{t('joinGroupTitle')}</CardTitle>
          <p className="text-sm text-gray-500">
            {t('inviteCode')}：<span className="font-mono font-semibold">{inviteCode}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('yourNickname')}
            </label>
            <Input
              placeholder={t('nicknamePlaceholder')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={!nickname.trim() || isJoining}
          >
            {isJoining ? t('joining') : t('joinGroup')}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/')}
          >
            {t('backToHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

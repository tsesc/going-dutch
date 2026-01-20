import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Users } from 'lucide-react'
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

export function HomePage() {
  const navigate = useNavigate()
  const { groups, createGroup, joinGroup, isLoading } = useGroups()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Going Dutch</h1>
          <p className="mt-2 text-gray-500">輕鬆分帳，旅遊無憂</p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-6" />
            <span>建立群組</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => setShowJoinDialog(true)}
          >
            <UserPlus className="size-6" />
            <span>加入群組</span>
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
            <h2 className="text-sm font-medium text-gray-500">我的群組</h2>
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
                      {group.members.length} 位成員
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
              <p className="text-gray-500">還沒有群組</p>
              <p className="text-sm text-gray-400">建立或加入一個群組開始分帳</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>建立新群組</DialogTitle>
            <DialogDescription>
              為你的旅行或活動建立一個分帳群組
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">群組名稱</Label>
              <Input
                id="groupName"
                placeholder="例如：日本東京行 2024"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">你的暱稱</Label>
              <Input
                id="nickname"
                placeholder="在群組中顯示的名字"
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
              取消
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !nickname.trim() || isSubmitting}
            >
              {isSubmitting ? '建立中...' : '建立群組'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>加入群組</DialogTitle>
            <DialogDescription>輸入邀請碼加入現有群組</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">邀請碼</Label>
              <Input
                id="inviteCode"
                placeholder="輸入 6 位數邀請碼"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinNickname">你的暱稱</Label>
              <Input
                id="joinNickname"
                placeholder="在群組中顯示的名字"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleJoinGroup}
              disabled={
                inviteCode.length !== 6 || !nickname.trim() || isSubmitting
              }
            >
              {isSubmitting ? '加入中...' : '加入群組'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

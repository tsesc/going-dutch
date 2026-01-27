import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { HomePage } from '@/pages/HomePage'
import { GroupPage } from '@/pages/GroupPage'
import { JoinPage } from '@/pages/JoinPage'

function App() {
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setAuthReady(true)
      } else {
        // No user, sign in anonymously
        signInAnonymously(auth).catch((error) => {
          console.error('Anonymous sign-in failed:', error)
        })
      }
    })

    return () => unsubscribe()
  }, [])

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/join/:inviteCode" element={<JoinPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

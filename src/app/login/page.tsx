'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8">
      <div className="max-w-md w-full border border-zinc-800 p-10 rounded">
        <h1 className="text-2xl font-bold mb-6">Login to Proof of Progress</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm"
            required
          />
          <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded">
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-zinc-400">{message}</p>}
      </div>
    </main>
  )
}
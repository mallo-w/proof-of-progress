'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8">
      <div className="max-w-md w-full border border-zinc-800 p-10 rounded">
        <h1 className="text-2xl font-bold mb-6">Join Proof of Progress</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign up'}
          </button>
        </form>
        {message && <p className="mt-6 text-sm text-center text-zinc-400">{message}</p>}
      </div>
    </main>
  )
}
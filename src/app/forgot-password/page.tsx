'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) setError(error.message)
    else setSent(true)

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-sm w-full border border-zinc-800 p-10 rounded">
        <h1 className="text-xl font-bold mb-2">Reset Password</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Enter your email to receive a reset link.
        </p>

        {sent ? (
          <p className="text-green-500 text-sm">Check your email for the reset link.</p>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white outline-none"
              required
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-white text-black font-black py-3 rounded uppercase tracking-widest text-xs hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <a href="/login" className="block text-center text-zinc-500 text-xs mt-6 underline">
          Back to login
        </a>
      </div>
    </main>
  )
}
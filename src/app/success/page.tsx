'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Non définie'
  return new Date(deadline).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const commitmentId = searchParams.get('commitment_id')

  const [commitment, setCommitment] = useState<any>(null)
  const [polling, setPolling] = useState(true)
  const [dots, setDots] = useState('')

  // Animated dots during polling
  useEffect(() => {
    if (!polling) return
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(t)
  }, [polling])

  useEffect(() => {
    if (!commitmentId) {
      router.push('/dashboard')
      return
    }

    let cancelled = false

    const poll = async () => {
      // Poll up to 12 seconds (1 tick/s) for the webhook to activate the commitment
      for (let i = 0; i < 12; i++) {
        const { data } = await supabase
          .from('commitments')
          .select('*')
          .eq('id', commitmentId)
          .single()

        if (cancelled) return

        if (data?.status === 'active') {
          setCommitment(data)
          setPolling(false)
          return
        }

        // Keep the latest row around so we can still display it as a fallback
        if (data) setCommitment(data)

        await new Promise((r) => setTimeout(r, 1000))
      }

      if (!cancelled) setPolling(false)
    }

    poll()
    return () => {
      cancelled = true
    }
  }, [commitmentId, router])

  if (polling) {
    return (
      <main className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center px-5 sm:px-8">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-6">🔒</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Verrouillage de ton engagement<span className="inline-block w-8 text-left">{dots}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-3">On confirme ton paiement. Reste ici quelques secondes.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center px-5 sm:px-8 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Engagement verrouillé. Ton argent est en jeu.
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg mt-4">
            Il n&apos;y a plus de retour en arrière. Livre ou perd.
          </p>
        </div>

        <div className="flex justify-center">
          <span className="bg-white text-black text-lg sm:text-xl font-black px-6 py-3 rounded uppercase tracking-widest">
            €{commitment?.stake_amount ?? '—'} EN JEU
          </span>
        </div>

        <div className="border-t border-b border-zinc-800 py-6">
          <span className="text-zinc-500 uppercase text-[10px] tracking-widest block mb-2 font-semibold">
            Deadline
          </span>
          <p className="text-white font-bold text-sm sm:text-base">
            {formatDeadline(commitment?.deadline)} — 23:59:59 UTC
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <a
            href="/dashboard"
            className="block w-full bg-white text-black py-4 rounded font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition"
          >
            Voir mon engagement →
          </a>
          {commitmentId && (
            <a
              href={`/c/${commitmentId}`}
              className="block text-zinc-500 hover:text-white text-sm underline underline-offset-2 transition"
            >
              Partager mon engagement →
            </a>
          )}
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Chargement...</p>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}

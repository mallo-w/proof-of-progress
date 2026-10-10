import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Required: read raw body for Stripe signature verification
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const commitmentId = session.metadata?.commitmentId

    if (!commitmentId) {
      console.error('No commitmentId in session metadata')
      return NextResponse.json({ received: true })
    }

    // Use service role to bypass RLS — only server-side code activates commitments
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
      .from('commitments')
      .update({ status: 'active' })
      .eq('id', commitmentId)
      .eq('status', 'payment_pending')

    if (error) {
      console.error('Failed to activate commitment:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

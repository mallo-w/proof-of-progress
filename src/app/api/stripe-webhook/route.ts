import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

    // Capture the Stripe PaymentIntent id so we can refund later if the commitment succeeds
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null

    const { data: updated, error } = await supabaseAdmin
      .from('commitments')
      .update({ status: 'active', payment_intent_id: paymentIntentId })
      .eq('id', commitmentId)
      .eq('status', 'payment_pending')
      .select('*')
      .single()

    if (error) {
      console.error('Failed to activate commitment:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Send the "your commitment is locked" confirmation email (best-effort — never fail the webhook)
    try {
      if (updated && process.env.RESEND_API_KEY) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(updated.user_id)
        const email = userData?.user?.email

        if (email) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const deadline = updated.deadline
            ? new Date(updated.deadline).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }) + ' — 23:59:59 UTC'
            : 'Non définie'

          await resend.emails.send({
            from: 'Proof of Progress <onboarding@resend.dev>',
            to: email,
            subject: `Ton engagement est verrouillé — €${updated.stake_amount} en jeu`,
            html: `
              <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
                <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">Engagement verrouillé.</h1>
                <p style="font-size: 15px; color: #52525b; margin: 0 0 24px;">
                  Il n'y a plus de retour en arrière. Livre ou perd.
                </p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Engagement</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${updated.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">En jeu</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">€${updated.stake_amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Deadline</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${deadline}</td>
                  </tr>
                </table>
                <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px;">Critère de réussite</div>
                  <div style="font-size: 14px; font-style: italic;">"${updated.binary_completion_criteria || ''}"</div>
                </div>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://proof-of-progress.vercel.app'}/submit"
                   style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 6px;">
                  Soumettre ma preuve →
                </a>
                <p style="font-size: 14px; color: #52525b; margin: 24px 0 0;">
                  L'argent est posé. Maintenant, tu n'as plus qu'une option : livrer. Au travail.
                </p>
              </div>
            `,
          })
        }
      }
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr)
    }
  }

  return NextResponse.json({ received: true })
}

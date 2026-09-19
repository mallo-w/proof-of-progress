import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY is not defined in environment variables' },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecretKey)

  try {
    const { amount, title, commitmentId } = await request.json()

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      managed_payments: {
        enabled: false,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Commitment Stake: ${title || 'Proof of Progress'}`,
              description: 'Forfeited if evidence is not submitted or approved before deadline.',
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success&commitment_id=${commitmentId}`,
      cancel_url: `${origin}/create?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
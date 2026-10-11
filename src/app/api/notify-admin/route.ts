import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'mallory@system-strategy.co'

export async function POST(request: Request) {
  try {
    const { commitmentId } = await request.json()

    if (!commitmentId) {
      return NextResponse.json({ error: 'Missing commitmentId' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: commitment, error } = await supabaseAdmin
      .from('commitments')
      .select('*')
      .eq('id', commitmentId)
      .single()

    if (error || !commitment) {
      return NextResponse.json({ error: 'Commitment not found' }, { status: 404 })
    }

    // Resolve the user's email for context
    let userEmail = 'inconnu'
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(commitment.user_id)
      if (userData?.user?.email) userEmail = userData.user.email
    } catch {
      // non-blocking
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proof-of-progress.vercel.app'

    await resend.emails.send({
      from: 'Proof of Progress <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: `Nouvelle preuve à valider — ${commitment.title}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
          <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 16px;">Nouvelle preuve à valider</h1>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Utilisateur</td>
              <td style="padding: 6px 0; font-size: 14px; text-align: right;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Engagement</td>
              <td style="padding: 6px 0; font-size: 14px; font-weight: 700; text-align: right;">${commitment.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">En jeu</td>
              <td style="padding: 6px 0; font-size: 14px; text-align: right;">€${commitment.stake_amount}</td>
            </tr>
          </table>
          <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px;">Critère</div>
            <div style="font-size: 14px; font-style: italic;">"${commitment.binary_completion_criteria || ''}"</div>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px;">Preuve soumise</div>
            ${
              commitment.evidence_url
                ? `<a href="${commitment.evidence_url}" style="font-size: 14px; color: #2563eb;">${commitment.evidence_url}</a>`
                : '<span style="font-size: 14px; color: #a1a1aa;">Aucune</span>'
            }
          </div>
          <a href="${siteUrl}/admin/review"
             style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 6px;">
            Valider la preuve →
          </a>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

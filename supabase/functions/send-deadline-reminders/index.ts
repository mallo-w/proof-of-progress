// Supabase Edge Function: send-deadline-reminders
//
// Envoie un email de rappel "J-1" (24h avant la deadline) via Resend a chaque
// utilisateur ayant un commitment dont le statut est 'active' ou 'submitted' et
// dont la deadline tombe dans les prochaines 23-25 heures.
//
// Variables d'environnement requises (secrets Supabase) :
//   - SUPABASE_URL                (injectee automatiquement par Supabase)
//   - SUPABASE_SERVICE_ROLE_KEY   (pour lire commitments + auth.users)
//   - RESEND_API_KEY              (cle API Resend)
//
// Deploiement + cron : voir DEPLOY_INSTRUCTIONS.md a la racine du repo.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// --- Configuration ---------------------------------------------------------

const SUBMIT_URL = 'https://proof-of-progress.vercel.app/submit'
const EMAIL_SUBJECT =
  '[Proof of Progress] Your deadline is tomorrow — submit your proof'
// Expediteur : idealement un domaine verifie dans Resend (ex: system-strategy.co).
// On retombe sur onboarding@resend.dev si RESEND_FROM n'est pas configure.
const FROM_EMAIL =
  Deno.env.get('RESEND_FROM') ?? 'Proof of Progress <onboarding@resend.dev>'

// --- Types -----------------------------------------------------------------

interface Commitment {
  id: string
  user_id: string
  title: string
  deadline: string
  status: string
  stake_amount: number
}

// --- Utilitaires -----------------------------------------------------------

function buildEmailHtml(commitment: Commitment): string {
  const stake = Number(commitment.stake_amount ?? 0)
  const title = escapeHtml(commitment.title ?? 'your commitment')

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#000000;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#0a0a0a;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;color:#a1a1aa;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Proof of Progress</p>
                <h1 style="margin:12px 0 0 0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">Your deadline is tomorrow</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;">
                <p style="margin:0 0 16px 0;color:#d4d4d8;font-size:15px;line-height:1.6;">
                  You have less than 24 hours to submit proof for your commitment:
                </p>
                <div style="background-color:#000000;border:1px solid #27272a;border-radius:8px;padding:20px;margin-bottom:20px;">
                  <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;line-height:1.3;">${title}</p>
                  <p style="margin:12px 0 0 0;color:#a1a1aa;font-size:13px;">
                    Stake at risk: <span style="color:#ffffff;font-weight:700;">&euro;${stake}</span>
                  </p>
                </div>
                <p style="margin:0 0 24px 0;color:#d4d4d8;font-size:14px;line-height:1.6;">
                  If you don't submit your proof before the deadline, your stake is forfeited.
                  Ship it now and keep your money.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${SUBMIT_URL}" style="display:inline-block;background-color:#ffffff;color:#000000;text-decoration:none;font-weight:800;font-size:14px;text-transform:uppercase;letter-spacing:1px;padding:16px 32px;border-radius:8px;">
                        Submit Proof of Progress
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;border-top:1px solid #18181b;">
                <p style="margin:16px 0 0 0;color:#52525b;font-size:11px;line-height:1.5;">
                  Proof of Progress — A commitment contract for indie hackers.<br/>
                  If the button doesn't work, copy this link: ${SUBMIT_URL}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendEmail(
  resendApiKey: string,
  to: string,
  commitment: Commitment,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: EMAIL_SUBJECT,
        html: buildEmailHtml(commitment),
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      return { ok: false, error: `Resend ${res.status}: ${detail}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// --- Handler ---------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Autorise uniquement POST (le cron enverra un POST).
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(
      JSON.stringify({
        error:
          'Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Client admin (service role) : contourne les RLS, permet de lire auth.users.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Fenetre J-1 : deadline entre NOW()+23h et NOW()+25h.
  const now = Date.now()
  const windowStart = new Date(now + 23 * 60 * 60 * 1000).toISOString()
  const windowEnd = new Date(now + 25 * 60 * 60 * 1000).toISOString()

  const { data: commitments, error: queryError } = await supabase
    .from('commitments')
    .select('id, user_id, title, deadline, status, stake_amount')
    .in('status', ['active', 'submitted'])
    .gte('deadline', windowStart)
    .lte('deadline', windowEnd)

  if (queryError) {
    return new Response(
      JSON.stringify({ error: `DB query failed: ${queryError.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const targets = (commitments ?? []) as Commitment[]

  let sent = 0
  const failures: Array<{ commitmentId: string; reason: string }> = []

  for (const commitment of targets) {
    // Recupere l'email de l'utilisateur via l'API admin auth.
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(commitment.user_id)

    const email = userData?.user?.email
    if (userError || !email) {
      failures.push({
        commitmentId: commitment.id,
        reason: userError?.message ?? 'No email found for user',
      })
      continue
    }

    const result = await sendEmail(resendApiKey, email, commitment)
    if (result.ok) {
      sent += 1
    } else {
      failures.push({
        commitmentId: commitment.id,
        reason: result.error ?? 'Unknown send error',
      })
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      window: { from: windowStart, to: windowEnd },
      matched: targets.length,
      sent,
      failed: failures.length,
      failures,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})

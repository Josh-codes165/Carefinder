import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('Function called')
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY)

    const body = await req.json()
    const { recipientEmail, hospitals, shareableLink } = body

    console.log('Sending to:', recipientEmail)
    console.log('Hospital count:', hospitals?.length)

    const hospitalsHTML = hospitals.map((h: any) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
        <h3 style="margin:0 0 6px;font-size:15px;color:#1A1A18;">${h.name}</h3>
        <p style="margin:0 0 4px;font-size:13px;color:#5F5E5A;">📍 ${h.address}</p>
        ${h.phone ? `<p style="margin:0 0 4px;font-size:13px;color:#5F5E5A;">📞 ${h.phone}</p>` : ''}
        <p style="margin:8px 0 0;font-size:12px;color:#0F6E56;">
          ${Array.isArray(h.specialties) ? h.specialties.join(', ') : h.specialties}
        </p>
      </div>
    `).join('')

    const emailHTML = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="font-size:22px;color:#0F6E56;margin-bottom:6px;">Carefinder</h1>
        <p style="font-size:15px;color:#1A1A18;margin-bottom:20px;">
          Someone shared a hospital list with you:
        </p>
        ${hospitalsHTML}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="${shareableLink}"
             style="background:#0F6E56;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">
            View full results
          </a>
        </div>
      </div>
    `

    console.log('Calling Resend API...')

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: recipientEmail,
        subject: 'Hospital list shared with you — Carefinder',
        html: emailHTML,
      }),
    })

    const resendData = await resendResponse.json()
    console.log('Resend status:', resendResponse.status)
    console.log('Resend response:', JSON.stringify(resendData))

    if (!resendResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
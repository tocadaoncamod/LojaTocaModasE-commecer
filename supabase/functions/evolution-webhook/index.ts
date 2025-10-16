import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json()

      console.log('Evolution webhook received:', body)

      if (body.event === 'messages.upsert') {
        const message = body.data

        const messageData = {
          from_number: message.key?.remoteJid,
          to_number: message.key?.participant || 'instance',
          message_type: 'text',
          content: message.message?.conversation || message.message?.extendedTextMessage?.text || '',
          status: 'delivered',
          sent_at: new Date(message.messageTimestamp * 1000).toISOString()
        }

        await supabase
          .from('whatsapp_messages')
          .insert(messageData)

        let { data: conversation } = await supabase
          .from('whatsapp_conversations')
          .select('*')
          .eq('customer_phone', message.key?.remoteJid)
          .single()

        if (!conversation) {
          await supabase
            .from('whatsapp_conversations')
            .insert({
              customer_phone: message.key?.remoteJid,
              customer_name: message.pushName,
              status: 'open',
              last_message_at: new Date().toISOString(),
              unread_count: 1
            })
        } else {
          await supabase
            .from('whatsapp_conversations')
            .update({
              last_message_at: new Date().toISOString(),
              unread_count: conversation.unread_count + 1
            })
            .eq('id', conversation.id)
        }

        return new Response(JSON.stringify({ success: true, message: 'Message saved' }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        })
      }

      if (body.event === 'connection.update') {
        console.log('Connection status:', body.data)

        return new Response(JSON.stringify({ success: true, message: 'Connection update received' }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error processing Evolution webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    
    // Resend envía el evento 'email.bounced' cuando un correo rebotó
    if (payload.type === 'email.bounced') {
      const emailDestino = payload.data.to[0];

      if (emailDestino) {
        // Marcar todas las solicitudes asociadas a ese correo como rebotadas
        await supabase
          .from('solicitudes')
          .update({ email_error: true })
          .eq('email', emailDestino);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, estado } = await request.json();

    if (!id || !estado) {
      return new Response(JSON.stringify({ error: 'Faltan datos obligatorios' }), { status: 400 });
    }

    // Actualizar el estado en la tabla solicitudes de Supabase
    const { error } = await supabase
      .from('solicitudes')
      .update({ estado })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
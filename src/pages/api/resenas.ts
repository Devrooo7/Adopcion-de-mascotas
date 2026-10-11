import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

// GET: Obtener las reseñas vigentes (menos de 1 año)
export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('resenas_vigentes')
      .select('*');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// POST: Publicar una nueva reseña
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const payload = {
      nombre_usuario: formData.get('nombre_usuario')?.toString() || 'Anónimo',
      mascota_adoptada: formData.get('mascota_adoptada')?.toString() || '',
      comentario: formData.get('comentario')?.toString() || '',
      calificacion: Number(formData.get('calificacion')) || 5
    };

    if (!payload.comentario.trim()) {
      return new Response(JSON.stringify({ error: 'El comentario no puede estar vacío.' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('resenas')
      .insert([payload]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
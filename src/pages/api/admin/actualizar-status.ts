import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const estado = formData.get('estado');

    if (!id || !estado) {
      return new Response('Faltan datos', { status: 400 });
    }

    const { error } = await supabase
      .from('solicitudes')
      .update({ estado })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar estatus:', error);
    }

    return redirect('/admin/solicitudes');
  } catch (e) {
    console.error('Error interno:', e);
    return redirect('/admin/solicitudes');
  }
};
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// CREAR O ACTUALIZAR MASCOTA
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id')?.toString().toLowerCase().trim() || Date.now().toString();
    const nombre = formData.get('nombre')?.toString();
    const tipo = formData.get('tipo')?.toString();
    const edad = formData.get('edad')?.toString();
    const tags = formData.get('tags')?.toString();
    const desc = formData.get('desc')?.toString();
    const historia = formData.get('historia')?.toString();
    const img = formData.get('img')?.toString();
    const estado = formData.get('estado')?.toString() || 'disponible';

    if (!nombre || !tipo || !edad || !img) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    const { error } = await supabase.from('mascotas').upsert([{
      id,
      nombre,
      tipo,
      edad,
      tags: tags || 'Rescatado',
      desc: desc || '',
      historia: historia || '',
      img,
      estado
    }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};

// ELIMINAR / DAR DE BAJA
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID no proporcionado' }), { status: 400 });
    }

    const { error } = await supabase.from('mascotas').delete().eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
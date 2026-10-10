import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false; // Se ejecuta en el servidor

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const payload = {
      nombre_adoptante: formData.get('nombre'),
      edad: Number(formData.get('edad')),
      ocupacion: formData.get('ocupacion'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      tipo_vivienda: formData.get('tipo_vivienda'),
      propiedad_vivienda: formData.get('propiedad_vivienda'),
      ninos_en_casa: formData.get('ninos_en_casa'),
      otras_mascotas: formData.get('personas_en_casa'),
      horas_sola: formData.get('horas_sola'),
      motivo_adopcion: formData.get('motivo_adopcion'),
      mascota_id: formData.get('mascota'),
      estado: 'nuevo'
    };

    const { error } = await supabase.from('solicitudes').insert([payload]);

    if (error) {
      console.error('Error insertando solicitud:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/gracias', 303);
  } catch (e) {
    console.error('Error procesando el formulario:', e);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
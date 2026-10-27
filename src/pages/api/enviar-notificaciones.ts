// src/pages/api/enviar-notificacion.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, nombreAdoptante, nombreMascota, nuevoEstado } = await request.json();

    let asunto = '';
    let contenidoHtml = '';

    if (nuevoEstado === 'aceptada') {
      asunto = `🎉 ¡Felicidades! Tu solicitud para adoptar a ${nombreMascota} ha sido Aceptada`;
      contenidoHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #fffbeb; border-radius: 10px;">
          <h1 style="color: #d97706; text-align: center;">🐾 ¡Certificado de Adopción Aprobada! 🐾</h1>
          <p>Hola <strong>${nombreAdoptante}</strong>,</p>
          <p>¡Tenemos una excelente noticia! Tu solicitud de adopción para <strong>${nombreMascota}</strong> ha sido <strong>ACEPTADA</strong> con éxito.</p>
          
          <div style="border: 4px dashed #f59e0b; padding: 20px; text-align: center; background: #fff; margin: 20px 0; border-radius: 8px;">
            <h2>Certificado Oficial de Aprobación</h2>
            <p>Se otorga el presente reconocimiento a:</p>
            <h3 style="color: #b45309; font-size: 24px;">${nombreAdoptante}</h3>
            <p>Por comprometerse a brindar un hogar lleno de amor, respeto y cuidados a <strong>${nombreMascota}</strong>.</p>
            <p style="font-size: 12px; color: #78350f;">Huellitas en Casa - Adopción Responsable</p>
          </div>

          <p>Nos pondremos en contacto contigo muy pronto a través de este correo o teléfono para coordinar la entrega de tu nuevo amiguito.</p>
          <p>¡Gracias por cambiar una vida!</p>
        </div>
      `;
    } else {
      // Notificaciones para otros estatus (en_revision, pendiente, descartado)
      const mensajesEstado: Record<string, string> = {
        'en_revision': 'Tu solicitud se encuentra actualmente en proceso de revisión por nuestro equipo.',
        'pendiente': 'Tu solicitud está en espera de información adicional o documentos.',
        'descartado': 'Lamentablemente en esta ocasión tu solicitud no ha sido aprobada, pero te agradecemos tu interés en dar hogar a un peludito.'
      };

      asunto = `Actualización de tu solicitud en Huellitas en Casa`;
      contenidoHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1e293b;">Hola, ${nombreAdoptante}</h2>
          <p>Te escribimos de <strong>Huellitas en Casa</strong> para informarte sobre el estatus de tu solicitud:</p>
          <p style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-weight: bold;">
            Estatus actual: ${nuevoEstado.toUpperCase()}
          </p>
          <p>${mensajesEstado[nuevoEstado] || 'Hay una actualización en tu trámite.'}</p>
          <p>Cualquier duda puedes responder a este correo.</p>
        </div>
      `;
    }

    // Envío del correo usando Resend (puedes usar un correo tuyo verificado o el de prueba de Resend)
    const { data, error } = await resend.emails.send({
      from: 'Huellitas en Casa <onboarding@resend.dev>',
      to: [email],
      subject: asunto,
      html: contenidoHtml,
    });

    if (error) {
      return new Response(JSON.stringify({ success: false, error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
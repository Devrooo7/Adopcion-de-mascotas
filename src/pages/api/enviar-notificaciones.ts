// src/pages/api/enviar-notificaciones.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { supabase } from '../../lib/supabase';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

async function generarCertificadoPDF(nombreAdoptante: string, nombreMascota: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  // Hoja tamaño A4 / Carta horizontal para diploma físico
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Fondo crema suave
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 0.992, 0.965),
  });

  // Marco exterior ámbar oscuro
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: rgb(0.85, 0.46, 0.02),
    borderWidth: 4,
  });

  // Marco interior dorado fino
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.96, 0.62, 0.04),
    borderWidth: 1.5,
  });

  const centrarTexto = (texto: string, y: number, size: number, font: any, color: any) => {
    const textWidth = font.widthOfTextAtSize(texto, size);
    page.drawText(texto, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  const colorPrimario = rgb(0.71, 0.33, 0.04); // Ámbar oscuro
  const colorOscuro = rgb(0.12, 0.16, 0.23);   // Slate oscuro
  const colorGris = rgb(0.35, 0.4, 0.46);

  // Encabezado institucional
  centrarTexto('HUELLITAS EN CASA - SANTA CATARINA', height - 95, 13, fontBold, colorPrimario);

  // Título principal
  centrarTexto('CERTIFICADO OFICIAL DE ADOPCION', height - 150, 30, fontBold, colorOscuro);

  // Línea decorativa bajo el título
  page.drawLine({
    start: { x: 220, y: height - 168 },
    end: { x: width - 220, y: height - 168 },
    thickness: 2,
    color: rgb(0.96, 0.62, 0.04),
  });

  // Subtítulo
  centrarTexto('Se otorga el presente reconocimiento a:', height - 215, 15, fontRegular, colorGris);

  // Nombre del adoptante destacado
  const adoptanteLimpio = (nombreAdoptante || 'Adoptante').trim();
  centrarTexto(adoptanteLimpio, height - 268, 32, fontBold, colorPrimario);

  // Línea para el nombre
  page.drawLine({
    start: { x: 200, y: height - 282 },
    end: { x: width - 200, y: height - 282 },
    thickness: 1,
    color: rgb(0.8, 0.82, 0.85),
  });

  // Texto de compromiso
  centrarTexto(
    'Por comprometerse a brindar un hogar lleno de amor, respeto, proteccion',
    height - 325,
    14,
    fontRegular,
    colorOscuro
  );
  centrarTexto(
    'y cuidados responsables a su nuevo companero de vida:',
    height - 347,
    14,
    fontRegular,
    colorOscuro
  );

  // Nombre de la mascota
  const mascotaLimpia = (nombreMascota || 'Mascota').trim();
  centrarTexto(mascotaLimpia.toUpperCase(), height - 398, 26, fontBold, colorOscuro);

  // Fecha actual formateada
  const fechaTexto = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Firmas y fecha en la parte inferior
  page.drawLine({
    start: { x: 130, y: 115 },
    end: { x: 350, y: 115 },
    thickness: 1,
    color: colorGris,
  });
  page.drawText('Fecha de aprobacion', { x: 185, y: 98, size: 11, font: fontRegular, color: colorGris });
  page.drawText(fechaTexto, { x: 175, y: 123, size: 11, font: fontBold, color: colorOscuro });

  page.drawLine({
    start: { x: width - 350, y: 115 },
    end: { x: width - 130, y: 115 },
    thickness: 1,
    color: colorGris,
  });
  page.drawText('Huellitas en Casa', { x: width - 290, y: 123, size: 11, font: fontBold, color: colorOscuro });
  page.drawText('Adopcion Responsable', { x: width - 298, y: 98, size: 11, font: fontItalic, color: colorGris });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, email, nombreAdoptante, nombreMascota, nuevoEstado } = await request.json();

    let asunto = '';
    let contenidoHtml = '';
    let attachments: { filename: string; content: Buffer }[] = [];

    if (nuevoEstado === 'aceptada') {
      asunto = `🎉 ¡Felicidades! Tu solicitud para adoptar a ${nombreMascota} ha sido Aceptada`;
      contenidoHtml = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fde68a;">
          <h1 style="color: #d97706; text-align: center; margin-top: 0;">🐾 ¡Solicitud de Adopción Aprobada! 🐾</h1>
          <p>Hola <strong>${nombreAdoptante}</strong>,</p>
          <p>¡Tenemos una excelente noticia! Tu solicitud de adopción para <strong>${nombreMascota}</strong> ha sido <strong>ACEPTADA</strong> con éxito.</p>
          
          <div style="background: #ffffff; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">📄 Certificado Oficial Adjunto (PDF)</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #475569;">
              Adjunto a este correo encontrarás tu <strong>Certificado Oficial de Adopción en formato PDF</strong>, listo para que puedas descargarlo e imprimirlo en físico.
            </p>
          </div>

          <p>Nos pondremos en contacto contigo muy pronto a través de este correo o teléfono para coordinar la entrega de tu nuevo amiguito.</p>
          <p style="margin-bottom: 0;">¡Gracias por cambiar una vida!<br/><strong>Huellitas en Casa - Adopción Responsable</strong></p>
        </div>
      `;

      const pdfBuffer = await generarCertificadoPDF(nombreAdoptante, nombreMascota);
      const nombreArchivo = `Certificado_Adopcion_${(nombreMascota || 'Mascota').replace(/\s+/g, '_')}.pdf`;

      attachments = [
        {
          filename: nombreArchivo,
          content: pdfBuffer,
        },
      ];
    } else {
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

    // Envío del correo usando Resend
    const { data, error } = await resend.emails.send({
      from: 'Huellitas en Casa <onboarding@resend.dev>',
      to: [email],
      subject: asunto,
      html: contenidoHtml,
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      if (id) {
        await supabase
          .from('solicitudes')
          .update({ email_error: true })
          .eq('id', id);
      }
      return new Response(JSON.stringify({ success: false, error }), { status: 400 });
    }

    if (id) {
      await supabase
        .from('solicitudes')
        .update({ email_error: false })
        .eq('id', id);
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
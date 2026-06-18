import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

const BRAND_COLOR = '#C9A96E';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Oxford Cars <noreply@oxfordcars.dz>';
const COMPANY_PHONE = '+213 770 12 37 71';
const COMPANY_ADDRESS = 'Boulevard Amyoud, Tizi Ouzou, Algérie';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' DA';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oxford Cars</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#111111;border:1px solid #2A2A2A;border-bottom:2px solid ${BRAND_COLOR};padding:32px 40px;text-align:center;">
            <p style="color:${BRAND_COLOR};font-size:11px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px;">Oxford Cars</p>
            <p style="color:#F5F0E8;font-size:28px;font-weight:300;margin:0;letter-spacing:0.05em;">Drive Distinction.</p>
            <p style="color:${BRAND_COLOR};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:8px 0 0;opacity:0.6;">British Heritage · Timeless Prestige</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="background:#1C1C1C;border:1px solid #2A2A2A;border-top:none;padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#111111;border:1px solid #2A2A2A;border-top:none;padding:24px 40px;text-align:center;">
            <p style="color:#F5F0E8;opacity:0.3;font-size:11px;margin:0 0 6px;">📞 ${COMPANY_PHONE} &nbsp;|&nbsp; 📍 ${COMPANY_ADDRESS}</p>
            <p style="color:#F5F0E8;opacity:0.2;font-size:10px;margin:0;">© ${new Date().getFullYear()} Oxford Cars. Tous droits réservés.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Client confirmation email ──
export async function sendReservationConfirmation(data: {
  to: string;
  guest_name: string;
  reservation_number: string;
  vehicle_name: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  total_days: number;
  total_amount: number;
  deposit_amount: number;
}) {
  if (!process.env.RESEND_API_KEY) return; // Skip if no key configured

  const content = `
    <p style="color:${BRAND_COLOR};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 16px;">Confirmation de Demande</p>
    <h1 style="color:#F5F0E8;font-size:26px;font-weight:300;margin:0 0 8px;">Bonjour, ${data.guest_name}</h1>
    <p style="color:#F5F0E8;opacity:0.6;font-size:14px;line-height:1.6;margin:0 0 32px;">
      Votre demande de réservation a bien été reçue. Notre équipe vous contactera dans les <strong style="color:${BRAND_COLOR};">24 heures</strong> pour confirmer votre réservation.
    </p>

    <!-- Reservation number box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border:1px solid ${BRAND_COLOR}33;margin-bottom:28px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="color:#F5F0E8;opacity:0.4;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Numéro de Réservation</p>
        <p style="color:${BRAND_COLOR};font-size:28px;font-weight:300;letter-spacing:0.2em;margin:0;">${data.reservation_number}</p>
      </td></tr>
    </table>

    <!-- Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2A2A2A;margin-bottom:28px;">
      <tr><td colspan="2" style="background:#0A0A0A;padding:12px 20px;border-bottom:1px solid #2A2A2A;">
        <p style="color:#F5F0E8;opacity:0.5;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0;">Détails de la Réservation</p>
      </td></tr>
      ${[
        ['Véhicule', data.vehicle_name],
        ['Date de départ', formatDate(data.pickup_date)],
        ['Date de retour', formatDate(data.return_date)],
        ['Lieu de départ', data.pickup_location],
        ['Lieu de retour', data.return_location || data.pickup_location],
        ['Durée', `${data.total_days} jour${data.total_days > 1 ? 's' : ''}`],
      ].map(([label, value], i) => `
        <tr style="background:${i % 2 === 0 ? '#1C1C1C' : '#111111'};">
          <td style="padding:12px 20px;color:#F5F0E8;opacity:0.5;font-size:13px;width:40%;">${label}</td>
          <td style="padding:12px 20px;color:#F5F0E8;font-size:13px;">${value}</td>
        </tr>
      `).join('')}
    </table>

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND_COLOR}33;margin-bottom:28px;">
      <tr><td colspan="2" style="background:#0A0A0A;padding:12px 20px;border-bottom:1px solid ${BRAND_COLOR}22;">
        <p style="color:${BRAND_COLOR};opacity:0.7;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0;">Récapitulatif Financier</p>
      </td></tr>
      <tr style="background:#1C1C1C;">
        <td style="padding:14px 20px;color:#F5F0E8;opacity:0.6;font-size:13px;">Montant de la location</td>
        <td style="padding:14px 20px;color:#F5F0E8;font-size:13px;text-align:right;">${formatPrice(data.total_amount)}</td>
      </tr>
      ${data.deposit_amount > 0 ? `
      <tr style="background:#111111;">
        <td style="padding:14px 20px;color:#F5F0E8;opacity:0.6;font-size:13px;">Caution (remboursable)</td>
        <td style="padding:14px 20px;color:#F5F0E8;font-size:13px;text-align:right;">${formatPrice(data.deposit_amount)}</td>
      </tr>` : ''}
      <tr style="background:#0A0A0A;border-top:1px solid ${BRAND_COLOR}33;">
        <td style="padding:16px 20px;color:${BRAND_COLOR};font-size:14px;font-weight:500;">Total Estimé</td>
        <td style="padding:16px 20px;color:${BRAND_COLOR};font-size:18px;font-weight:300;text-align:right;">${formatPrice(data.total_amount + data.deposit_amount)}</td>
      </tr>
    </table>

    <p style="color:#F5F0E8;opacity:0.4;font-size:12px;line-height:1.6;margin:0 0 24px;">
      ℹ️ Aucun paiement en ligne requis. Le règlement s'effectue en espèces lors de la prise en charge du véhicule.
    </p>

    <!-- WhatsApp CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding:16px 0;">
        <a href="https://wa.me/213770123771" style="display:inline-block;background:${BRAND_COLOR};color:#0A0A0A;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">
          Nous Contacter sur WhatsApp
        </a>
      </td></tr>
    </table>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Réservation Oxford Cars — ${data.reservation_number}`,
      html: baseTemplate(content),
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

// ── Admin notification email ──
export async function sendAdminNotification(data: {
  reservation_number: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  vehicle_name: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_days: number;
  total_amount: number;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;

  const content = `
    <p style="color:${BRAND_COLOR};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 16px;">Nouvelle Réservation</p>
    <h1 style="color:#F5F0E8;font-size:22px;font-weight:400;margin:0 0 24px;">
      🔔 ${data.reservation_number}
    </h1>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2A2A2A;margin-bottom:20px;">
      ${[
        ['Client', data.guest_name],
        ['Téléphone', data.guest_phone],
        ['Email', data.guest_email || '—'],
        ['Véhicule', data.vehicle_name],
        ['Départ', formatDate(data.pickup_date)],
        ['Retour', formatDate(data.return_date)],
        ['Lieu', data.pickup_location],
        ['Durée', `${data.total_days} jours`],
        ['Montant', formatPrice(data.total_amount)],
      ].map(([label, value], i) => `
        <tr style="background:${i % 2 === 0 ? '#1C1C1C' : '#111111'};">
          <td style="padding:10px 16px;color:#F5F0E8;opacity:0.5;font-size:12px;width:35%;">${label}</td>
          <td style="padding:10px 16px;color:#F5F0E8;font-size:12px;">${value}</td>
        </tr>
      `).join('')}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 4px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="display:block;background:${BRAND_COLOR};color:#0A0A0A;text-decoration:none;padding:12px 20px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;text-align:center;">
            Voir dans l'Admin
          </a>
        </td>
        <td style="padding:8px 4px;">
          <a href="https://wa.me/${data.guest_phone?.replace(/\D/g,'')}" style="display:block;background:#25D366;color:#fff;text-decoration:none;padding:12px 20px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;text-align:center;">
            Appeler sur WhatsApp
          </a>
        </td>
      </tr>
    </table>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `🚗 Nouvelle réservation — ${data.reservation_number} — ${data.guest_name}`,
      html: baseTemplate(content),
    });
  } catch (err) {
    console.error('Admin email failed:', err);
  }
}

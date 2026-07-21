const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:contact@miyagroup.sn',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const record = payload.record || {};
    const table = payload.table || 'reservations';

    let title = 'Allo Dakar';
    let body = '';
    if (table === 'colis') {
      title = '📦 Nouveau colis';
      body = `${record.sender || ''} → ${record.recip || ''} · ${record.price || ''} FCFA`;
    } else {
      title = '🚌 Nouvelle réservation';
      body = `${record.client || ''} · ${record.from_city || ''} → ${record.to_city || ''} · ${record.price || ''} FCFA`;
    }

    const subsRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    const subs = await subsRes.json();
    const notifPayload = JSON.stringify({ title, body });

    await Promise.all((Array.isArray(subs) ? subs : []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          notifPayload
        );
      } catch (err) {
        console.error('push error', err.message);
      }
    }));

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: String(e) };
  }
};

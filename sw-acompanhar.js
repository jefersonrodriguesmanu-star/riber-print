/* RIBER PRINT — avisos do pedido no celular do cliente (Web Push). Só cuida de notificações; não guarda cache. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'RIBER PRINT', body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'RIBER PRINT';
  const opts = {
    body: d.body || 'Seu pedido foi atualizado.',
    icon: 'icone-192.png',
    badge: 'badge-96.png',
    tag: d.tag || 'pedido',
    renotify: true,
    vibrate: [90, 50, 90, 50, 90, 50, 320], // "assinatura" de vibração da RIBER PRINT
    data: { url: d.url || 'acompanhar.html' },
  };
  e.waitUntil((async () => {
    await self.registration.showNotification(title, opts);
    // se a página do pedido estiver aberta, ela toca o som da RIBER PRINT e se atualiza
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    cs.forEach((c) => c.postMessage({ tipo: 'push', etapa: d.etapa || '', title, body: opts.body }));
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || 'acompanhar.html', self.location.href).href;
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const c = cs.find((x) => x.url === url) || cs.find((x) => x.url.includes('acompanhar'));
    if (c) { await c.focus(); if (c.url !== url && 'navigate' in c) return c.navigate(url); return; }
    return self.clients.openWindow(url);
  })());
});

// Service worker do Barbearo: torna o site instalável e recebe as notificações.
// Não guarda nada em cache (o app sempre busca a versão mais nova na rede).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Chegou uma notificação do servidor (função "notificar" no Supabase)
self.addEventListener("push", (e) => {
  let m = { titulo: "Barbearo", corpo: "", url: "/", tag: undefined };
  try { m = { ...m, ...e.data.json() }; } catch { if (e.data) m.corpo = e.data.text(); }
  e.waitUntil(self.registration.showNotification(m.titulo, {
    body: m.corpo,
    icon: "/icone-192.png",
    badge: "/favicon-32.png",
    tag: m.tag,
    renotify: !!m.tag,
    lang: "pt-BR",
    data: { url: m.url },
  }));
});

// Tocou na notificação: abre (ou traz para frente) o app na tela certa
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abertas) {
      if (c.url.startsWith(self.location.origin) && "focus" in c) {
        await c.focus();
        if ("navigate" in c && c.url !== alvo) await c.navigate(alvo);
        return;
      }
    }
    await self.clients.openWindow(alvo);
  })());
});

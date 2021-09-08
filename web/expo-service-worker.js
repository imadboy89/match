/* eslint-env serviceworker */

/**
 * Store notification icon string in service worker.
 * Ref: https://stackoverflow.com/a/35729334/2603230
 */
const version = 64;
self.addEventListener('message', event => {
  let data;
  if (typeof event.data === 'string') {
    try {
      data = JSON.parse(event.data);
    } catch (e) {}
  }

  if (data && data.fromExpoWebClient) {
    self.notificationIcon = data.fromExpoWebClient.notificationIcon;
  }
});

/**
 * Add support for push notification.
 */
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    // If `event.data.text()` is not a JSON object, we just treat it
    // as a plain string and display it as the body.
    payload = { title: '', body: event.data.text() };
  }
  // imd ; try to use json from string
  try {
    payload = JSON.parse(payload.body);
  } catch (error) {}
  const title = payload.title;
  const data = payload.data || payload.custom || {};
  const options = {
    body: payload.body,
    data,
  };
  options.icon = data._icon || payload.icon || self.notificationIcon || "/matche/" ||  null ;
  options.image =
    data._richContent && data._richContent.image ? options.data._richContent.image : payload.image;
  options.tag = data._tag || payload.collapseKey;
  if (options.tag) {
    options.renotify = data._renotify;
  }
  if(payload && payload.timeout && payload.timeout>0){
    setTimeout(()=>{},payload.timeout);
  }
  event.waitUntil(self.registration.showNotification(title, options));
});

// https://developer.mozilla.org/en-US/docs/Web/API/Clients
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true,
      });

      let appClient;
      console.log(event, location.pathname.replace("expo-service-worker.js",""));
      const path = event.notification.data._webPath || location.pathname.replace("expo-service-worker.js","");

      // If we already have a window open, use it.
      for (const client of allClients) {
        const url = new URL(client.url);
        //if (url.pathname === path) {
          client.focus();
          appClient = client;
          break;
        //}
      }

      // If there is no existing window, open a new one.
      if (!appClient) {
        appClient = await self.clients.openWindow(path);
      }

      // Message the client:
      // `origin` will always be `'selected'` in this case.
      // https://docs.expo.io/versions/latest/sdk/notifications/#notification
      appClient.postMessage({
        origin: 'selected',
        data: event.notification.data,
        remote: !event.notification._isLocal,
      });
    })()
  );
});

// TODO: Consider cache: https://github.com/expo/expo-cli/pull/844#issuecomment-515619883
// Import the script generated by workbox.
self.importScripts('service-worker.js');

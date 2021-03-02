self.addEventListener("message",t=>{let i;if("string"===typeof t.data)try{i=JSON.parse(t.data)}catch(e){}i&&i.fromExpoWebClient&&(self.notificationIcon=i.fromExpoWebClient.notificationIcon)}),self.addEventListener("push",t=>{let i={};try{i=t.data.json()}catch(a){i={title:"",body:t.data.text()}}const e=i.title,n=i.data||i.custom||{},o={body:i.body,data:n};o.icon=n._icon||i.icon||self.notificationIcon||null,o.image=n._richContent&&n._richContent.image?o.data._richContent.image:i.image,o.tag=n._tag||i.collapseKey,o.tag&&(o.renotify=n._renotify),t.waitUntil(self.registration.showNotification(e,o))}),self.addEventListener("notificationclick",t=>{t.notification.close(),t.waitUntil((async()=>{const i=await self.clients.matchAll({includeUncontrolled:!0});let e;const n=t.notification.data._webPath||"/";for(const t of i){if(new URL(t.url).pathname===n){t.focus(),e=t;break}}e||(e=await self.clients.openWindow(n)),e.postMessage({origin:"selected",data:t.notification.data,remote:!t.notification._isLocal})})())}),self.importScripts("service-worker.js");
self.addEventListener('push', function(event) {
    event.waitUntil(self.registration.showNotification('ServiceWorker Cookbook', {
      body: 'Push Notification Subscription Management'
    }));
  });
self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('Subscription expired');
    event.waitUntil(
      self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then(function(subscription) {
        console.log('Subscribed after expiration', subscription.endpoint);
        return fetch('register', {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });
      })
    );
  });
  
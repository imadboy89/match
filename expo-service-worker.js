const version=65;self.addEventListener("message",t=>{let e;if("string"===typeof t.data)try{e=JSON.parse(t.data)}catch(o){}e&&e.fromExpoWebClient&&(self.notificationIcon=e.fromExpoWebClient.notificationIcon)}),self.addEventListener("push",t=>{let e={};try{e=t.data.json()}catch(n){e={title:"",body:t.data.text()}}try{e=JSON.parse(e.body)}catch(c){}const o=e.title,i=e.data||e.custom||{},a={body:e.body,data:i};a.icon=i._icon||e.icon||self.notificationIcon||"/matche/",a.image=i._richContent&&i._richContent.image?a.data._richContent.image:e.image,a.tag=i._tag||e.collapseKey,a.tag&&(a.renotify=i._renotify),e&&e.timeout&&e.timeout>0&&setTimeout(()=>{},e.timeout),t.waitUntil(self.registration.showNotification(o,a))}),self.addEventListener("notificationclick",t=>{t.notification.close(),t.waitUntil((async()=>{const e=await self.clients.matchAll({includeUncontrolled:!0});let o;console.log(t,location.pathname.replace("expo-service-worker.js",""));const i=t.notification.data._webPath||location.pathname.replace("expo-service-worker.js","");for(const t of e){new URL(t.url);t.focus(),o=t;break}o||(o=await self.clients.openWindow(i)),o.postMessage({origin:"selected",data:t.notification.data,remote:!t.notification._isLocal})})())}),self.importScripts("service-worker.js");
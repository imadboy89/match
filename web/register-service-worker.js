
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('SW_PUBLIC_URL/expo-service-worker.js', { scope: 'SW_PUBLIC_SCOPE' })
      .then(function (info) {
        console.info('Registered service-worker', info);
        serviceWorker = info;
        try { backup.savePushToken(); } catch (error) { console.log(error);}
      })
      .catch(function (error) {
        console.info('Failed to register service-worker', error);
      });
  });
}

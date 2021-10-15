
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('SW_PUBLIC_URL/expo-service-worker.js', { scope: 'SW_PUBLIC_SCOPE' })
      .then(function (info) {
        console.info('Registered service-worker', info);
        serviceWorker = info;
        try { backup.savePushToken(); } catch (error) { console.log(error);}
        let tries = 10;
        let interval = setInterval(() => {
          tries-=1;
          if(tries<0){
            clearInterval(interval);
            console.log("try savePushToken [FAILED]");
          }
          console.log("try savePushToken ...");
          try {
            backup.savePushToken().then(is_ok => {if(is_ok){
              clearInterval(interval);
              console.log("try savePushToken [OK]");
            }});
          } catch (error) {
            console.log("try savePushToken [ERROR]");
          }
        }, 2000);

        serviceWorker.addEventListener('installed', (event) => {
          console.log(event.isUpdate);
          if (event.isUpdate) {
            console.log("NEw SW installed");
          }
        });


      })
      .catch(function (error) {
        console.info('Failed to register service-worker', error);
      });

      
  });
}

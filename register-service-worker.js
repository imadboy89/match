"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("/match/expo-service-worker.js",{scope:"/match/"}).then((function(e){console.info("Registered service-worker",e),serviceWorker=e;try{backup.savePushToken()}catch(r){console.log(r)}})).catch((function(e){console.info("Failed to register service-worker",e)}))}));
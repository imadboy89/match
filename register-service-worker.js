"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("/match/expo-service-worker.js",{scope:"/match/"}).then((function(e){})).catch((function(e){console.info("Failed to register service-worker",e)}))}));
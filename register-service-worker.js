"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("/expo-service-worker.js",{scope:"/"}).then((function(e){console.info("Registered service-worker",e),serviceWorker=e;try{backup.savePushToken()}catch(s){console.log(s)}let o=10,r=setInterval(()=>{o-=1,o<0&&(clearInterval(r),console.log("try savePushToken [FAILED]")),console.log("try savePushToken ...");try{backup.savePushToken().then(e=>{e&&(clearInterval(r),console.log("try savePushToken [OK]"))})}catch(s){console.log("try savePushToken [ERROR]")}},2e3);serviceWorker.addEventListener("installed",e=>{console.log(e.isUpdate),e.isUpdate&&console.log("NEw SW installed")})})).catch((function(e){console.info("Failed to register service-worker",e)}))}));
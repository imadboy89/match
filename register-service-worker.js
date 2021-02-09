"serviceWorker"in navigator&&window.addEventListener("load",(function(){
    navigator.serviceWorker.register("/match/expo-service-worker.js",{scope:"/"})
        .then(reg => {
            console.log('Registration succeeded. Scope is ' + reg.scope);
        })
        .catch((function(e){console.info("Failed to register service-worker",e)}))
}));
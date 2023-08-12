function registerServiceWorker() {
	if(!('serviceWorker' in navigator)) { return; }
	navigator.serviceWorker.register('https://pandaqi.com/progressive-web-app-worker.js')
		.then(function(reg) {
		    console.log('Successfully registered service worker', reg);
		    reg.update();
		})
		.catch(function(err) {
		    console.warn('Error whilst registering service worker', err);
		});
}

registerServiceWorker();
importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyCXVg3jipw7el7uYfSgncsXIq1g3bYNn7M",
    authDomain: "ges-chat-engage.firebaseapp.com",
    projectId: "ges-chat-engage",
    storageBucket: "ges-chat-engage.appspot.com",
    messagingSenderId: "145390777314",
    appId: "1:145390777314:web:7e237ce0c650aab2463fbb",
    measurementId: "G-GW2PJ47LEX"
}) /*use your own configuration*/

const messaging = firebase.messaging();

var href = self.location.origin 

messaging.onBackgroundMessage(payload => {
	const title = payload.data.title;
	const options = payload.data.image ? {
		badge: "icon.png",
		body: payload.data.body,
		icon: payload.data.photoURL,
        image: payload.data.image,
    } : {
        badge: "icon.png",
        body: payload.data.body,
        icon: payload.data.photoURL,
    }
	self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    self.clients.openWindow(href);
})

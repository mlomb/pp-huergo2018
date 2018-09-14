var config = {
    apiKey: "AIzaSyBOzmaikD_lrox31O50TRCtRRz9hdr2ExY",
    authDomain: "tutu-parking.firebaseapp.com",
    projectId: "tutu-parking"
};
firebase.initializeApp(config);

function doLogin(provider) {
    firebase.auth().signInWithPopup(provider);
}

function logOut() {
    firebase.auth().signOut().then(function() {
        window.location = '/api/logout';
    }, function(error) {
        window.location = '/api/logout';
    });
}


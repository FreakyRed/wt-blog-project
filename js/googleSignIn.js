let auth2 = {};

function userChanged(user) {
    document.getElementById("userName").innerHTML = user.getBasicProfile().getName();
}


let updateSignIn = function () {
    let signedIn = auth2.isSignedIn.get();

    if (signedIn) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userName").innerHTML = auth2.currentUser.get().getBasicProfile().getName();
    } else {
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }
}

function startGoogleSignIn() {
    gapi.load('auth2', function () {
        gapi.signin2.render('SignInButton', {
            'width': 150,
            'height': 50,
            'longtitle': false,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });

        gapi.auth2.init().then(
            function () {
                console.log('Google authentification initialization');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn);
            });
    });

}

function signOut() {
    if (auth2.signOut) auth2.signOut();
    if (auth2.disconnect) auth2.disconnect();
}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}

function onFailure(error) {
    console.log(error);
}

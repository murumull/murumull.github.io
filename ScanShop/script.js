//#region FireBase
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
	apiKey: "AIzaSyB4-6mpZsTTG_D2L5N0k8qDIc1Sa22-4MM",
	authDomain: "scanshop-bc6c5.firebaseapp.com",
	projectId: "scanshop-bc6c5",
	storageBucket: "scanshop-bc6c5.appspot.com",
	messagingSenderId: "299199558353",
	appId: "1:299199558353:web:5e4fcf987bf5fe6e194bf0",
	measurementId: "G-2WFQGD1LM8"
};

var inputEmail = document.getElementById("email");
var inputPassword = document.getElementById("password");
var feedbackHTML = document.getElementById("feedback");
var authenticationHTML = document.getElementById("authentication");
var appScreenHTML = document.getElementById("app");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var database = firebase.firestore();
//#endregion

//#region Scanner
var _scannerIsRunning = false;
function startScanner() {
	Quagga.init({
		inputStream: {
			name: "Live",
			type: "LiveStream",
			target: document.querySelector('#scanner-container'),
			constraints: {
				width: 480,
				height: 320,
				facingMode: "environment"
			},
		},
		decoder: {
			readers: [
				"code_128_reader",
				"ean_reader",
				"ean_8_reader",
				"code_39_reader",
				"code_39_vin_reader",
				"codabar_reader",
				"upc_reader",
				"upc_e_reader",
				"i2of5_reader"
			],
			debug: {
				showCanvas: true,
				showPatches: true,
				showFoundPatches: true,
				showSkeleton: true,
				showLabels: true,
				showPatchLabels: true,
				showRemainingPatchLabels: true,
				boxFromPatches: {
					showTransformed: true,
					showTransformedBox: true,
					showBB: true
				}
			}
		},

	}, function (err) {
		if (err) {
			console.log(err);
			return
		}

		console.log("Initialization finished. Ready to start");
		Quagga.start();

		// Set flag to is running
		_scannerIsRunning = true;
	});

	Quagga.onProcessed(function (result) {
		var drawingCtx = Quagga.canvas.ctx.overlay,
			drawingCanvas = Quagga.canvas.dom.overlay;

		if (result) {
			if (result.boxes) {
				drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
				result.boxes.filter(function (box) {
					return box !== result.box;
				}).forEach(function (box) {
					Quagga.ImageDebug.drawPath(box, {
						x: 0,
						y: 1
					}, drawingCtx, {
						color: "green",
						lineWidth: 2
					});
				});
			}

			if (result.box) {
				Quagga.ImageDebug.drawPath(result.box, {
					x: 0,
					y: 1
				}, drawingCtx, {
					color: "#00F",
					lineWidth: 2
				});
			}

			if (result.codeResult && result.codeResult.code) {
				Quagga.ImageDebug.drawPath(result.line, {
					x: 'x',
					y: 'y'
				}, drawingCtx, {
					color: 'red',
					lineWidth: 3
				});
			}
		}
	});


	Quagga.onDetected(function (result) {
		//console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
		onScann(result.codeResult.code);
	});
}
//#endregion

// Start/stop scanner
document.getElementById("btn").addEventListener("click", function () {
	if (_scannerIsRunning) {
		Quagga.stop();
	} else {
		startScanner();
	}
}, false);

// When scanned what do?
var resultBlock = document.getElementById('detect-block');
async function onScann(result){
	// Get info from firebase
	const scanItems = database.collection('scanItems').doc('NQJ2xqac9NXuA34mfWNm');
	const doc = await scanItems.get();
	if (!doc.data()[result]) {
		console.log('No such document!');
	} else {
		resultBlock.innerHTML = `
			<p>${result}</p>
			<p>${doc.data()[result].name}</p>
			<p>${doc.data()[result].price}€</p>
		`
	}
}

// Login/signup

loadDefaultValues();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        showAuthentication();
    } else {
        showAuthentication();
        console.log("User isn't signed in.");
    }
});

function logout() {
    firebase.auth().signOut()
        .then(function () {
            feedbackHTML.innerHTML = "Logged out succesfully!";
            buttonLogout.style.display = "none";
            inputEmail.value = "";
            inputPassword.value = "";
            showAuthentication();
        })
        .catch(function (error) {
            feedbackHTML.innerHTML = error.message;
        });
}

function signup() {
    var email = inputEmail.value;
    var password = inputPassword.value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var message = "Welcome " + userCredential.user.email + "!";
            feedbackHTML.innerHTML = message;
            showAppScreen();
        })
        .catch((error) => {
            feedbackHTML.innerHTML = error.message;
            feedbackHTML.classList.add("feedback-error");
        });
}

function login() {
    var email = inputEmail.value;
    var password = inputPassword.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var message = "Welcome " + userCredential.user.email + "!";
            feedbackHTML.innerHTML = message;
            showAppScreen();
        })
        .catch((error) => {
            feedbackHTML.innerHTML = error.message;
            feedbackHTML.classList.add("feedback-error");
        });
}

function showAuthentication() {
    authenticationHTML.style.display = "flex";
    appScreenHTML.style.display = "none";
}

function showAppScreen() {
    authenticationHTML.style.display = "none";
    appScreenHTML.style.display = "flex";
}

function loadDefaultValues() {
    inputEmail.value = "christian.laine@gmail.com";
    inputPassword.value = "Safe123";
}

function showSignup() {
	buttonLogin.style.display = "none";
	buttonShowSignup.style.display = "none";
	buttonSignup.style.display = "inline-block";  
	buttonShowLogin.style.display = "inline-block";
	buttonLogout.style.display = "none";
  }
  
  function showLogin() {
	buttonSignup.style.display = "none";
	buttonShowLogin.style.display = "none";
	buttonLogin.style.display = "inline-block";
	buttonShowSignup.style.display = "inline-block"; 
	buttonLogout.style.display = "inline-block";
  }
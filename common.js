"use strict"

let chunkLength = 10000;

function createPeerConnection(lasticecandidate) {
  log("Creating peer connection");
  let configuration = {
    iceServers: [{
      urls: "stun:stun.l.google.com:19302"
    }]
  };
  try {
    let peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = handleicecandidate;
    peerConnection.addEventListener("icecandidateerror", (event) => {
        if (event.errorCode != 701) {
	  	    log("Error url: " + event.url);
	  	    log("Error text: " + event.errorText);
	  	}
	});
	return peerConnection;
  } catch(err) {
    log('error: ' + err);
  }
}

var log_area = document.getElementById('log');
function log(message) {
   console.log(message);
   log_area.value += message + "\n";
}


function handleicecandidate(event) {
    if (event.candidate != null) {
       log('One more ice candidate');
    } else {
      log('There is no more ice candidates');
      lasticecandidate();
    }
}

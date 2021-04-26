"use strict"

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
	  	log("Error url: " + event.url);
	  	log("Error text: " + event.errorText);
	});
	return peerConnection;
  } catch(err) {
    log('error: ' + err);
  }
}

var logDiv = document.getElementById('log');
function log(message) {
 console.log(message);
 var tag = document.createElement("p");
 var text = document.createTextNode(message);
 tag.appendChild(text);
 logDiv.appendChild(tag);
}


function handleicecandidate(event) {
    if (event.candidate != null) {
       log('New ice candidate:');
       log(event.candidate)
    } else {
      log('All ice candidates accepted.');
      lasticecandidate();
    }
}

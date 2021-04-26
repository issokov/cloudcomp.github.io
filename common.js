"use strict"

function createPeerConnection(lasticecandidate) {
  console.log("Creating peer connection");
  let configuration = {
    iceServers: [{
      urls: "stun:stun.l.google.com:19302"
    }]
  };
  try {
    let peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = handleicecandidate;
    peerConnection.addEventListener("icecandidateerror", (event) => {
  	console.log("Error url: " + event.url);
  	console.log("Error text: " + event.errorText);
  });
  return peerConnection;
  } catch(err) {
    console.log('error: ' + err);
  }
}



function handleicecandidate(event) {
    if (event.candidate != null) {
      console.log('new ice candidate');
      console.log(event.candidate)
    } else {
      console.log('all ice candidates');
      lasticecandidate();
    }
}

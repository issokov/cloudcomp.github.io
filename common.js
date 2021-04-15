function createPeerConnection(lasticecandidate) {
  console.log("Creating peer connection");
  configuration = {
    iceServers: [{
      urls: "stun:stun.l.google.com:19302"}]};
  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch(err) {
    console.log('error: ' + err);
  }
  peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
  return peerConnection;
}

function handleicecandidate(lasticecandidate) {
  return function(event) {
    if (event.candidate != null) {
      console.log('new ice candidate');
    } else {
      console.log('all ice candidates');
      lasticecandidate();
    }
  }
}

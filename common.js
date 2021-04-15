
function chatlog(msg) {
  console.log(msg);
}

function createPeerConnection(lasticecandidate) {
  configuration = {
    iceServers: [{
      urls: "stun:stun.l.google.com:19302"}]};
  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch(err) {
    chatlog('error: ' + err);
  }
  peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
  peerConnection.onconnectionstatechange = handleconnectionstatechange;
  peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
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

function handleconnectionstatechange(event) {
  console.log('handleconnectionstatechange');
  console.log(event);
}

function handleiceconnectionstatechange(event) {
  console.log('ice connection state: ' + event.target.iceConnectionState);
}

function chatbuttonclick() {
}

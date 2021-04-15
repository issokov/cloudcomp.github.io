var arrayToStoreChunks = [];

function clickofferpasted() {
  console.log('Offer pasted');
  peerConnection = createPeerConnection(lasticecandidate);
  peerConnection.ondatachannel = handledatachannel;
  textelement = document.getElementById('offer_area');
  offer = JSON.parse(textelement.value);
  setRemotePromise = peerConnection.setRemoteDescription(offer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function datachannelopen() {
  console.log('datachannelopen');
  chatlog('connected');
}

function datachannelmessage(message) {
  console.log('datachannelmessage');
  console.log(message);
  var data = JSON.parse(message.data);
  arrayToStoreChunks.push(data.message);
  if (data.last) {
	  document.getElementById('answer_area').value = decodeURIComponent(escape(atob(arrayToStoreChunks.join('').split(',')[1])));
      arrayToStoreChunks = [];
  }

}

function setRemoteDone() {
  console.log('setRemoteDone');
  createAnswerPromise = peerConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function createAnswerDone(answer) {
  console.log('createAnswerDone');
  setLocalPromise = peerConnection.setLocalDescription(answer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
}

function createAnswerFailed(reason) {
  console.log('createAnswerFailed');
  console.log(reason);
}

function setLocalDone() {
  console.log('setLocalDone');
}

function setLocalFailed(reason) {
  console.log('setLocalFailed');
  console.log(reason);
}

function lasticecandidate() {
  console.log('lasticecandidate');
  textelement = document.getElementById('answer_area');
  answer = peerConnection.localDescription
  textelement.value = JSON.stringify(answer);
}

function handledatachannel(event) {
  console.log('handledatachannel');
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

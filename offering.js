var fileInput = document.getElementById('fileInput')
var sendFile = document.getElementById('sendFile')
var chunkLength = 1000;

sendFile.addEventListener('click', sendData);
fileInput.addEventListener('change', handleFileInputChange, false);


function clickcreateoffer() {
  console.log('Create offer ...');
  document.getElementById('gen_offer').disabled = true;
  peerConnection = createPeerConnection(lasticecandidate);
  dataChannel = peerConnection.createDataChannel('chat');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  createOfferPromise = peerConnection.createOffer();
  createOfferPromise.then(createOfferDone, createOfferFailed);
}


async function handleFileInputChange() {
  const file = fileInput.files[0];
  if (!file) {
    console.log('No file chosen');
  } else {
      sendFile.disabled = false;
  }
}


function sendData() {
  const file = fileInput.files[0];
  console.log(`File is ${[file.name, file.size, file.type].join(' ')}`);
  var reader = new window.FileReader();
  reader.readAsDataURL(file);
  reader.onload = onReadAsDataURL;
}

function onReadAsDataURL(event, text) {
    var data = {};

    if (event) text = event.target.result;

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength);
    } else {
        data.message = text;
        data.last = true;
    }

    dataChannel.send(JSON.stringify(data));
    
    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL);
    }, 100)
}

function createOfferDone(offer) {
  console.log('createOfferDone');
  setLocalPromise = peerConnection.setLocalDescription(offer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
}

function datachannelopen() {
  console.log('datachannelopen');
  chatlog('connected');
  fileInput.disabled = false;
}

function datachannelmessage(message) {
  console.log('datachannelmessage');
  console.log(message);
  text = message.data;
}

function createOfferFailed(reason) {
  console.log('createOfferFailed');
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
  textelement = document.getElementById('offer_area');
  offer = peerConnection.localDescription;
  textelement.value = JSON.stringify(offer);
}

function clickoffersent() {
  console.log('clickoffersent');
}

function clickanswerpasted() {
  console.log('Answer pasted');
  textelement = document.getElementById('answer_area');
  answer = JSON.parse(textelement.value);
  setRemotePromise = peerConnection.setRemoteDescription(answer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function setRemoteDone() {
  console.log('setRemoteDone');
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}


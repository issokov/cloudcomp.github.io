var fileInput = document.getElementById('fileInput')
var sendFile = document.getElementById('sendFile')
var chunkLength = 1000;
var counter = document.getElementById('counter');

var connections = [];
var channels = [];


sendFile.addEventListener('click', sendData);
fileInput.addEventListener('change', handleFileInputChange, false);


async function clickcreateoffer() {
  console.log('Creating offer');
  peerConnection = createPeerConnection(lasticecandidate);
  dataChannel = peerConnection.createDataChannel('channel');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  connections.push(peerConnection);
  channels.push(dataChannel);
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
	for (let channel of channels) {
    	channel.send(JSON.stringify(data));
    }
    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL);
    }, 50)
}

function datachannelopen() {
  console.log('datachannelopen, connected');
  fileInput.disabled = false;
}

function datachannelmessage(message) {
  console.log('datachannelmessage');
  console.log(message);
  text = message.data;
}


function lasticecandidate() {
  console.log('lasticecandidate');
  textelement = document.getElementById('offer_area');
  offer = peerConnection.localDescription;
  textelement.value = JSON.stringify(offer);
}


async function clickanswerpasted() {
  console.log('Answer pasted');
  textelement = document.getElementById('answer_area');
  answer = JSON.parse(textelement.value);
  await peerConnection.setRemoteDescription(answer);
  counter.innerHTML = parseInt(counter.innerHTML) + 1;
}


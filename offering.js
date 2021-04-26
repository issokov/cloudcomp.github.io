"use strict"

var fileInput = document.getElementById('fileInput')
var sendFile = document.getElementById('sendFile')
var chunkLength = 1000;
var counter = document.getElementById('counter');

var connections = [];
var channels = [];





function datachannelopen() {
  log('datachannelopen, connected');
  counter.innerHTML = parseInt(counter.innerHTML) + 1;
  fileInput.disabled = false;
}

function datachannelmessage(message) {
  log('datachannelmessage');
  log(message);
  text = message.data;
}

function lasticecandidate() {
  log('It was last ICE candidate');
  let offer = connections[connections.length - 1].localDescription;
  document.getElementById('offer_area').value = JSON.stringify(offer);
}

async function clickcreateoffer() {
  log('Creating offer');
  let peerConnection = createPeerConnection(lasticecandidate);
  peerConnection.oniceconnectionstatechange = function(){	
		log('oniceconnectionstatechange:');
		log(connections[connections.length - 1].iceConnectionState);
  }
  connections.push(peerConnection);
  let dataChannel = peerConnection.createDataChannel('channel');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  channels.push(dataChannel);
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer).then(() => {log("Local description OK");}).catch((error) => {log("LD set error: " + error);});
}


async function handleFileInputChange() {
  const file = fileInput.files[0];
  if (!file) {
    log('No file chosen');
  } else {
      sendFile.disabled = false;
  }
}


function sendData() {
  const file = fileInput.files[0];
  log(`File is ${[file.name, file.size, file.type].join(' ')}`);
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



async function clickanswerpasted() {
  log('Answer pasted');
  let answer = JSON.parse(document.getElementById('answer_area').value);
  await connections[connections.length - 1].setRemoteDescription(answer).then(
    () => {
        log("Remote description setting has been done");
        log("Signaling state: " + connections[connections.length - 1].signalingState);
        log("ICE connection state: " + connections[connections.length - 1].iceConnectionState);
        log("ICE gathering state: " + connections[connections.length - 1].iceGatheringState);
    }).catch(
    (error) => {
        log(error);
    }
  );
}

sendFile.addEventListener('click', sendData);
fileInput.addEventListener('change', handleFileInputChange, false);



"use strict"

var fileInput = document.getElementById('fileInput')
var sendFile = document.getElementById('sendFile')
var chunkLength = 1000;
var counter = document.getElementById('counter');

var connections = [];
var channels = [];



function datachannelopen() {
  console.log('datachannelopen, connected');
  counter.innerHTML = parseInt(counter.innerHTML) + 1;
  fileInput.disabled = false;
}

function datachannelmessage(message) {
  console.log('datachannelmessage');
  console.log(message);
  text = message.data;
}

function lasticecandidate() {
  console.log('lasticecandidate');
  let offer = connections[connections.length - 1].localDescription;
  document.getElementById('offer_area').value = JSON.stringify(offer);
}

async function clickcreateoffer() {
  console.log('Creating offer');
  let peerConnection = createPeerConnection(lasticecandidate);
  peerConnection.oniceconnectionstatechange = function(){	
		console.log('oniceconnectionstatechange:');
		console.log(connections[connections.length - 1].iceConnectionState);
  }
  let dataChannel = peerConnection.createDataChannel('channel');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
  let offer = await peerConnection.createOffer();
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


async function clickanswerpasted() {
  console.log('Answer pasted');
  let answer = JSON.parse(document.getElementById('answer_area').value);
  await connections[connections.length - 1].setRemoteDescription(answer);
}

sendFile.addEventListener('click', sendData);
fileInput.addEventListener('change', handleFileInputChange, false);



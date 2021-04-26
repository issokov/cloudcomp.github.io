"use strict"

var offer_area = document.getElementById('offer_area');
var answer_area = document.getElementById('answer_area');
var arrayToStoreChunks = [];
var connection;
var dataChannel;

function lasticecandidate() {
	log("Last ice candidate");
}
 
async function clickofferpasted() {
  log('Offer pasted');
  connection = createPeerConnection(lasticecandidate);
  connection.ondatachannel = handledatachannel;
  let offer = JSON.parse(offer_area.value);
  await connection.setRemoteDescription(offer);
  let answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
  answer_area.value = JSON.stringify(answer);
}

function datachannelopen() {
  log('Data channel is open, connected'); 
}

function datachannelmessage(message) {
  log('Receive data channel message:');
  log(message);
  var data = JSON.parse(message.data);
  arrayToStoreChunks.push(data.message);
  if (data.last) {
 	  var file_area = document.getElementById('file_area');
 	  file_area.style.visibility = "visible";
	  file_area.value = decodeURIComponent(escape(atob(arrayToStoreChunks.join('').split(',')[1])));
      arrayToStoreChunks = [];
  }

}

function handledatachannel(event) {
  log('Handle data channel');
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

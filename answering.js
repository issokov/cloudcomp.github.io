"use strict"

var offer_area = document.getElementById('offer_area');
var answer_area = document.getElementById('answer_area');
var arrayToStoreChunks = [];
var connection;

function lasticecandidate() {
	console.log("Last ice candidate");
}
 
async function clickofferpasted() {
  console.log('Offer pasted');
  connection = createPeerConnection(lasticecandidate);
  connection.ondatachannel = handledatachannel;
  let offer = JSON.parse(offer_area.value);
  await connection.setRemoteDescription(offer);
  let answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
  answer_area.value = JSON.stringify(answer);
}

function datachannelopen() {
  console.log('datachannelopen, connected'); 
}

function datachannelmessage(message) {
  console.log('datachannelmessage');
  console.log(message);
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
  console.log('handledatachannel');
  let dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

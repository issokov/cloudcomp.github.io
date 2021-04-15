var offer_area = document.getElementById('offer_area');
var answer_area = document.getElementById('answer_area');
var arrayToStoreChunks = [];
var connection;

async function clickofferpasted() {
  console.log('Offer pasted');
  connection = createPeerConnection(() => {});
  connection.ondatachannel = handledatachannel;
  offer = JSON.parse(offer_area.value);
  await connection.setRemoteDescription(offer);
  answer = await connection.createAnswer();
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
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

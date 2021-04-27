"use strict"

var area = document.getElementById('area');
var memory, wasmArrayBuffer, received = 0;
var connection;
var dataChannel;
var channel_id;
var args;


function lasticecandidate() {
  log("Generating answer");
  let answer = connection.localDescription
  area.value = JSON.stringify(answer);
}

 
async function clickofferpasted() {
  log('Offer pasted');
  connection = createPeerConnection(lasticecandidate);
  connection.ondatachannel = handledatachannel;
  let offer = JSON.parse(area.value);
  await connection.setRemoteDescription(offer).then(() => {log("Remote description OK");}).catch((error) => {log("LD set error: " + error);});
  let answer = await connection.createAnswer();
  await connection.setLocalDescription(answer).then(() => {log("Local description OK");}).catch((error) => {log("LD set error: " + error);});
}

function datachannelopen() {
  log('Data channel is open, connected');
}

function processWASM() {
	log("Passing " + args.length + " arguments.");
	let allocate_pages = Math.ceil(args.length / (64 * 1024));
	memory = new WebAssembly.Memory({initial: allocate_pages});
	log("Pages allocated: " + allocate_pages);
	let memoryAsArray = new Int32Array(memory.buffer, 0, 4 * args.length);
    for (let c = 0; c < args.length; c++) {
		memoryAsArray[c] = args[c];
	}
	log("Instantiate.");
    WebAssembly.instantiate(wasmArrayBuffer, {env: {"memory": memory}}).then(results => {
    	log("Instantiated.")
		let exports = results.instance.exports;
		log("Running.")
		let result = exports.sum(args.length);
		log("Result: " + result)
		dataChannel.send(JSON.stringify({
			type: "result",
			id: channel_id,
			result: result.toString()
		}));
	});
}

function datachannelmessage(message) {
  log('Receive data message');
  var data = JSON.parse(message.data);
  log('Data type: ' + data.type);
  if (data.type === "greating") {
     channel_id = data.id;
     dataChannel.send(JSON.stringify({
     	type: "greating",
     	id: channel_id
     }));
     area.remove();
     document.getElementById("gen_answer").remove();
  } else if (data.type === "args"){
  	 args = data.args;
     wasmArrayBuffer = new Uint8Array(data.file_size);
     log("Args was accepted: " + args);
  } else {
  	  data.file_data = Uint8Array.from(atob(data.file_data), c => c.charCodeAt(0))
  	  wasmArrayBuffer.set(data.file_data, received * chunkLength);
	  if (data.last) {
		  processWASM();
	  }
	  received += 1;
  }
}

function handledatachannel(event) {
  log('Handle data channel');
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

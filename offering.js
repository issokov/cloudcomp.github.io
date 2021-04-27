"use strict"

let area = document.getElementById('area');
let gen_offer_btn = document.getElementById("gen_offer")
let accept_answer_btn = document.getElementById("accept_answer");

let connections = [];
let channels = [];
let results = [];

let counter = document.getElementById('counter');
let fileInput = document.getElementById('fileInput')
let sendFile = document.getElementById('sendFile')
let reader = new window.FileReader();
let wasmArrayBuffer;



function datachannelopen() {
	log('Data channel is open.');
	log('Send greating to consumer id=' + (channels.length-1));
	channels[channels.length - 1].send(JSON.stringify({
		type: "greating",
		id: channels.length - 1
	}));  
}

function datachannelmessage(message) {
	let data = JSON.parse(message.data)
	log('New message of type: ' + data.type);
	if (data.type === 'greating') {
		counter.innerHTML = parseInt(counter.innerHTML) + 1;
		fileInput.disabled = false;
		log("The consumer id=" + data.id + " replied to the greeting.");
	} else if (data.type === "result") {
		let id=data.id, result=data.result;
		log("Result from node(ID=" + id + "): " + result);
		results.push(parseInt(result));  
		if (results.length == channels.length) {
	    	log("Combining results:");
	    	processWASM(wasmArrayBuffer, results).then((result) => {
	    		log("Total result: " + result);
	    	});
		}
	} else {
		log("Unknown message received:");
		log(data);
	}
}

function lasticecandidate() {
	log('Generating offer');
	let offer = connections[connections.length - 1].localDescription;
	area.value = JSON.stringify(offer);
}

async function clickcreateoffer() {
	log('Beginning of creating offer ');
	let peerConnection = createPeerConnection(lasticecandidate);
	peerConnection.oniceconnectionstatechange = function(){	
		log('ICE connection state changed: ' + connections[connections.length - 1].iceConnectionState);
	}
	connections.push(peerConnection);
	let dataChannel = peerConnection.createDataChannel('channel');
	dataChannel.onopen = datachannelopen;
	dataChannel.onmessage = datachannelmessage;
	channels.push(dataChannel);
	let offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer).then(() => {log("Local description OK");}).catch((error) => {log("LD set error: " + error);});
	gen_offer_btn.disabled = true;
	accept_answer_btn.disabled = false;
}


async function handleFileInputChange() {
	const file = fileInput.files[0];
	if (!file) {
		log('Abort: no file chosen');
	} else {
		sendFile.disabled = false;
	}
}


function sendData() {
	const file = fileInput.files[0];
	log(`File is ${[file.name, file.size, file.type].join(' ')}`);
	let args = document.getElementById('args').value.split(' ').map((value) => {return parseInt(value, 10)});
	let nodes = parseInt(counter.innerHTML), args_per_nodes = Math.floor(args.length / nodes);
	for (let i = 0; i < nodes; i++) {
		let begin = i * args_per_nodes, 
			end = (i + 1 !== nodes)? begin + args_per_nodes : args.length,
		partial_args = args.slice(begin, end);
		log("Sending args for node id=" + i + ": " + partial_args);
		channels[i].send(JSON.stringify({
			type: "args",
			file_size: file.size,
			args: partial_args
		}));
	}
	reader.onloadend = onLoadEnd;
	reader.readAsArrayBuffer(file);
}

function arrayBufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
}

function onLoadEnd(event) {	
    let sent = 0, data = {type: "file"};
    wasmArrayBuffer = reader.result.slice(0);
    let fileData = reader.result;
    log("Sending file. Remain: " + fileData.byteLength)
    while (fileData.byteLength) {
    	data.file_data = arrayBufferToBase64(fileData.slice(0, Math.min(chunkLength, fileData.byteLength)));
    	fileData = fileData.slice(chunkLength);
    	if (!fileData.byteLength) {
			data.last = true;
    	}
    	log("Data was sent. Remain: " + fileData.byteLength);
		for (let channel of channels) {
			channel.send(JSON.stringify(data));
		}
    }
}



async function clickanswerpasted() {
	log('Answer pasted');
	let answer = JSON.parse(area.value);
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
	area.value = "";
	gen_offer_btn.disabled = false;
	accept_answer_btn.disabled = true;
}

sendFile.addEventListener('click', sendData);
fileInput.addEventListener('change', handleFileInputChange, false);



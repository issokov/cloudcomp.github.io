"use strict"

let chunkLength = 10000;

function createPeerConnection(lasticecandidate) {
	let configuration = {
		iceServers: [{
			urls: "stun:stun.l.google.com:19302"
		}]
	};
	try {
    	let peerConnection = new RTCPeerConnection(configuration);
		peerConnection.onicecandidate = handleicecandidate;
    	peerConnection.addEventListener("icecandidateerror", (event) => {
		    if (event.errorCode != 701) {
		  	    log("Error url: " + event.url);
		  	    log("Error text: " + event.errorText);
		  	}
		});
		return peerConnection;
  	} catch(err) {
    	log('error: ' + err);
	}
}

var log_area = document.getElementById('log');
function log(message) {
	console.log(message);
	log_area.value += message + "\n";
	log_area.scrollTop = log_area.scrollHeight;
}

async function processWASM(wasmBytes, args) {
	let allocate_pages = Math.ceil(args.length / (16 * 1024));
	let memory = new WebAssembly.Memory({initial: allocate_pages});
	let memoryAsArray = new Int32Array(memory.buffer, 0, 4 * args.length);
    for (let c = 0; c < args.length; c++) {
		memoryAsArray[c] = args[c];
	}

    let results = await WebAssembly.instantiate(wasmBytes, {env: {"memory": memory}});
	return results.instance.exports.main(args.length);

}


function handleicecandidate(event) {
	if (event.candidate != null) {
		log('One more ICE candidate');
	} else {
		log('There is no more ICE candidates');
		lasticecandidate();
    }
}

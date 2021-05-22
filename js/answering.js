"use strict"
let hint = document.getElementById("hint_label");
var area = document.getElementById('log');
var wasmArrayBuffer, received = 0;
var connection;
var dataChannel;
var channel_id;
var args;


function lasticecandidate() {
    log("Generating answer");
    let answer = connection.localDescription
    area.value = JSON.stringify(answer);
    area.select();
    area.setSelectionRange(0, 99999);
    document.execCommand("copy");
    area.value = "There will be logs.\n";
    log("Awaiting when the main node accept your answer...")
    area.disabled = true;
    hint.className = "text-center text-danger fs-3 mb-2"
    hint.innerText = "Your answer on the clipboard, send it to the main node.";
}


async function clickofferpasted() {
    connection = createPeerConnection(lasticecandidate);
    connection.ondatachannel = handledatachannel;
    let offer = JSON.parse(area.value);
    await connection.setRemoteDescription(offer).then(() => {
        log("Remote description OK");
    }).catch((error) => {
        log("LD set error: " + error);
    });
    let answer = await connection.createAnswer();
    await connection.setLocalDescription(answer).then(() => {
        log("Local description OK");
    }).catch((error) => {
        log("LD set error: " + error);
    });
}

function datachannelopen() {
    log('Data channel is open, connected');
    hint.className = "text-center text-success fs-3 mb-2"
    hint.innerText = "Connection established.";
    log("The answer was accepted by main node!")
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
        document.getElementById("gen_answer").remove();
    } else if (data.type === "args") {
        args = data.args;
        wasmArrayBuffer = new Uint8Array(data.file_size);
        log("Args was accepted: " + args);
        log("File size: " + data.file_size)
    } else if(data.type === "file") {
        data.file_data = Uint8Array.from(atob(data.file_data), c => c.charCodeAt(0))
        log("Part " + received + ": accepted " + data.file_data.length + " bytes")
        wasmArrayBuffer.set(data.file_data, received * chunkLength);
        if (data.last) {
            log("Staring WASM task");
            processWASM(wasmArrayBuffer, args).then((result) => {
                log("WASM task completed: " + result);
                dataChannel.send(JSON.stringify({
                    type: "result",
                    id: channel_id,
                    result: result.toString()
                }));
                received = 0;
            }).catch((e) => {
                dataChannel.send(JSON.stringify({
                    type: "error",
                    id: channel_id,
                    result: e.toString()
                }));
                received = 0;
            });

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

let handleFail = function(err){
    console.log(err)
}

let appId = "0e3ccb29d66043c589dd9404222aaced";
let globalStream;
let audioMuted = false;
let videoMuted = false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init(appId, () => console.log("Agora RTC Client Connected"), handleFail)

function removeMyVideoStream() {
    globalStream.stop();
}

function removeVideoStream(evt){
    let stream = evt.stream;
    stream.stop();
    let removeDiv = document.getElementById(stream.getId())
    removeDiv.parentNode.removeChild(removeDiv)
}

function addVideoStream(streamId){
    console.log()
    let remoteContainer = document.getElementById("remoteStream")
    let streamDiv = document.createElement("div")
    streamDiv.id = streamId
    streamDiv.style.height = "250px"
    remoteContainer.appendChild(streamDiv)
}

document.getElementById("join").onclick = function () {
    let channelName = document.getElementById("channelName").value;
    let username = document.getElementById("user").value;

    client.join(
        null,
        channelName,
        username, 
        () =>{
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function() {
                //stream issue that i cannot figure out?? 
                localStream.play("SelfStream")
                console.log(`App id: ${appId}\nChannel id: ${channelName}`)
                client.publish(localStream)
            })

            globalStream = localStream;
        }
    )

    client.on("stream-added", function (evt) {
        console.log("Stream added")
        client.subscribe(evt.stream, handleFail)
    })
    
    client.on("stream-subscribed", function (evt) {
        console.log("Stream Subscribed");
        let stream = evt.stream;
        addVideoStream(stream.getId());
        stream.play(stream.getId());
    })

    client.on("peer-leave", function (evt) {
        console.log("Peer left")
        removeVideoStream(evt)
    })
}

document.getElementById("leave").onclick = function () {
    client.leave(function() {
        console.log("Exited")
    }, handleFail)
    removeMyVideoStream();
} 

document.getElementById("video-mute").onclick = function(){
    if(!videoMuted) {
        globalStream.muteVideo();
        videoMuted = true;
    }
    else {
        globalStream.unmuteVideo();
        videoMuted = false;
    }
}

document.getElementById("audio-mute").onclick = function() {
    if(!audioMuted) {
        globalStream.muteAudio();
        audioMuted = true;
    }
    else {
        globalStream.unmuteAudio();
        audioMuted = false;
    }
} 

var ws = new WebSocket("ws://localhost:8759/connect");

ws.onopen = function() {
    console.log("connected")
};

ws.onmessage = function (evt) { 
    data = evt.data.split(";")
    w = data[0].split(":")[1]
    cf = data[1].split(":")[1]
    dt = data[2].split(":")[1]
    document.getElementById("weight").innerHTML = w + " Kgs"
 };


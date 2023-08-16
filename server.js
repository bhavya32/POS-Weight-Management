var express = require('express');
var currdata = ""
var app = express();

var updateArduino = function(){}

var expressWs = require('express-ws')(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/HTML/index.html')
})

app.use(express.static('HTML'))
app.ws('/connect', function(ws, req) {
    ws.on('message', function(msg) {
        updateArduino(msg)
    });
  });
  

var server = app.listen(8759, function () {
   console.log("Example app listening")
})


function update(data) {
    currdata = data
    expressWs.getWss().clients.forEach(function each(client) {
        client.send(data);
    });
}
function listen(zero, cf,dt){
    expressWs.getWss().clients.forEach(function each(client) {
        client.ws.on('message', function(msg) {})
    });
}

function passUpdate(fn){
    updateArduino = fn
}

exports.updateWS = update
exports.passUpdate = passUpdate
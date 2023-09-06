const bindings = require("@serialport/bindings");
const { SerialPort, ReadlineParser } = require('serialport')

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode != null) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'z') {
    updateArduino("zero")
  }
  else if (key.ctrl && key.name === 'c') {
    process.exit()
  }
  else{
    switch(key.name){
      case "up":
        updateArduino("cf:" + (parseInt(g_cf) + 1000).toString())
        break;
      case "down":
        updateArduino("cf:" + (parseInt(g_cf) - 1000).toString())
        break;
      default:
        break;
    }
  }
});
const listPorts = async (verbose) => {
  let result;
  try {
    const portList = await bindings.list();
    if (verbose) console.table(portList); // Print out the array if desired.
    result = { status: "ok", data: portList };
  } catch (err) {
    if (verbose) console.log(err); // To see what the error is, if desired.
    result = { status: "fail", data: err };
  }
  return result;
};

async function updateArduino(data){
  port.write(data)
}


async function main(){
    //passUpdate(updateArduino)
    var result =  await listPorts(false);
    if (result.status == "fail") {
        console.log("Error: " + result.data);
        return
    }
    var portN = ""
    for (var port of result.data) {
      if (port["manufacturer"] == "wch.cn") {
        portN = port["path"];
        break;
      }
    }
    if (portN == "") {
      console.log("Error: No port found");
      console.log(result.data)
      return
    }
    startCom(portN)
}

async function handleArduinoData(data){
  console.log(data)
}

async function startCom(portN) {
  port = new SerialPort({ path:portN, baudRate:9600 })
  const parser = new ReadlineParser()
  port.pipe(parser)
  parser.on('data', handleArduinoData) 
}

function gt() {
  var d = new Date()
  return d.getHours() + ":" + d.getMinutes()
}

function gd() {
  var d = new Date()
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear()
}

async function print(d){
  if(!printerExists) return
  usbDevice.open(function(error){
    printer
    .font('a')
    .align('ct')
    .style("NORMAL")
    .size(0,0)
    .text(gt() + "               " +gd())
    .text(config.ID)
    .feed(1)
    .size(2, 2)
    .align('ct')
    //.style('b')
    .text(d + " Kgs")
    .feed(5)
    .close()
    printLocked = false
  });
}

main();
const bindings = require("@serialport/bindings");
const { SerialPort, ReadlineParser } = require('serialport')
const escpos = require('escpos');
var g_w = 0
var g_cf = 0
var g_dt = 0
var cfbuffer=""
escpos.USB = require('escpos-usb');

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode != null) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.name in "1234567890".split("")){
    cfbuffer += key.name
    return
  }
  
  if (key.name =='p'){
    updateArduino("print")
    return
  }
  if (!key.ctrl) {return}
  if (key.name === 'z') {
    updateArduino("zero")
  }
  else if (key.name === 'c') {
    process.exit()
  }
  else if (key.name == "s"){
    if (cfbuffer == "") return
    //console.log(cfbuffer)
    updateArduino("cf:" + parseInt(cfbuffer))
    cfbuffer = ""
  }
  else if (key.name== "r") {
    cfbuffer = ""
  }
});

printerExists = false
var printers = escpos.USB.findPrinter()
if (printers.length == 0) {
  console.log("No printer found")
}
else {
  //for linux -> const usbDevice = new escpos.USB(printers[0]["deviceDescriptor"]["idVendor"],printers[0]["deviceDescriptor"]["idProduct"]);
  const usbDevice = new escpos.USB(printers[0]["idVendor"], printers[0]["idProduct"]);
  const printer = new escpos.Printer(usbDevice);
  printerExists = true
}

console.clear()
process.stdout.write("Weight\n\n\n\n");
  
var config = require("./config.json")
var port;
var printv = false
var printLocked = false

//var {updateWS, passUpdate} = require("./server.js")
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
  if (data == "print" && printLocked == false) {
    printv = true
    return
  }
  port.write(data)
}

async function updateConsole(w){
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(w.padStart(40));
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
      //linux -> if (port["manufacturer"] == "1a86") {
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
  data = data.trim()
  list = data.split(";")
  g_w = list[0].split(":")[1]
  g_cf = list[1].split(":")[1]
  g_dt = list[2].split(":")[1]
  //console.log({w:w, cf:cf, dt:dt})*/
  if (printv && printLocked == false) {
    printLocked = true
    printv = false
    print(g_w)
  }
  //updateWS(data)
  updateConsole(data.split(";")[0].split(":")[1] + " Kgs")
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
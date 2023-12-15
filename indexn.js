const bindings = require("@serialport/bindings");
const { SerialPort, ReadlineParser } = require('serialport')
const escpos = require('escpos');

escpos.USB = require('escpos-usb');
var http = require('http')
printerExists = false
var printers = escpos.USB.findPrinter()
var printer;
var usbDevice;

var itemName = "NA";
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', (input) => {
  itemName=input;
});

if (printers.length == 0) {
  console.log("No printer found")
}
else {
  
  if(process.platform == "win32") {
    usbDevice = new escpos.USB(printers[0]["idVendor"], printers[0]["idProduct"]);
  } else{
    usbDevice = new escpos.USB(printers[0]["deviceDescriptor"]["idVendor"],printers[0]["deviceDescriptor"]["idProduct"]);
  }
  printer = new escpos.Printer(usbDevice);
  printerExists = true
}


var config = require("./config.json")
var port;
var printLocked = false

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


async function main(){
    var result =  await listPorts(false);
    if (result.status == "fail") {
        console.log("Error: " + result.data);
        return
    }
    var portN = ""
    for (var port of result.data) {
      if (port["manufacturer"] == "wch.cn" || port["manufacturer"] == "1a86") {
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
  if (!data.includes("Kg")) return 
  w=data.split(" ")[5].slice(0,-1)
  postWeight(w)
    if (printLocked == false) {
        printLocked = true
        print(w)
    }
}

async function postWeight(w){
    const options = {
        hostname: config.server.host,
        port: config.server.port,
        path: '/update?id=' + config.ID + '&weight=' + w,
        method: 'GET'
    };
    http.request(options).on("error", (err) => {console.log(err)}).end()
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
    .text(itemName)
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
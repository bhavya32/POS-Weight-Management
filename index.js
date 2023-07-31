const bindings = require("@serialport/bindings");
const { SerialPort, ReadlineParser } = require('serialport')

var port;
var {updateWS, passUpdate} = require("./server.js")
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
  console.log("updating arduino")
  
  //port.write("")
}


async function main(){
    var result =  await listPorts(false);
    if (result.status == "fail") {
        console.log("Error: " + result.data);
        return
    }
    var portN = ""
    for (var port of result.data) {
      if (port["manufacturer"] == "wch.cn") {
        portN = port["path"];
      }
      break;
    }
    if (portN == "") {
      console.log("Error: No port found");
      console.log(result.data)
      return
    }

    startCom(portN)
}

async function handleData(data){
  data = data.trim()
  /*list = data.split(";")
  w = list[0].split(":")[1]
  cf = list[1].split(":")[1]
  dt = list[2].split(":")[1]
  //console.log({w:w, cf:cf, dt:dt})*/
  updateWS(data)
}

async function startCom(portN) {
  port = new SerialPort({ path:portN, baudRate:9600 })
  const parser = new ReadlineParser()
  port.pipe(parser)
  parser.on('data', handleData) 
}

main();
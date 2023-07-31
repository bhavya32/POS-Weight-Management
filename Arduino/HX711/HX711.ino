
#include "HX711.h"

#define LOADCELL_DOUT_PIN  3
#define LOADCELL_SCK_PIN  2

HX711 scale;
String cmd = "";
String subcmd = "";
float calibration_factor = 13000; 
int delayTime = 1000;

void setup() {
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale();
  scale.tare();
}

void loop() {

  scale.set_scale(calibration_factor); //Adjust to this calibration factor
  Serial.print("w:");
  Serial.print(scale.get_units(), 2);
  Serial.print(";cf:");
  Serial.print(calibration_factor,0);
  Serial.print(";dt:");
  Serial.println(delayTime);

  if(Serial.available()){
    cmd = Serial.readString();  //read until timeout
    handleSerial();
  }

  delay(delayTime);
}

void handleSerial() {
    cmd.trim();
    if (cmd == "zero") {
      scale.tare();
      return;
    }

    subcmd = cmd.substring(0,2);

    if (subcmd == "dt"){
      delayTime = cmd.substring(3).toInt();
    }

    else if (subcmd == "cf"){
      calibration_factor = cmd.substring(3).toInt();
    } 
}
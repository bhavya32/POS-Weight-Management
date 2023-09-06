
#include "HX711.h"
#include "EEPROMAnything.h"
#define LOADCELL_DOUT_PIN  3
#define LOADCELL_SCK_PIN  2

HX711 scale;
String cmd = "";
String subcmd = "";
//float calibration_factor = 13000; 

struct t {
  float cf;
  int dt;
} config;

//int delayTime = 500;

void setup() {

  EEPROM_readAnything(0, config);
  Serial.begin(9600);
  //Serial.println(config.cf);
  //Serial.println(config.dt);
  
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale();
  scale.tare();
}

void loop() {

  //scale.set_scale(calibration_factor); //Adjust to this calibration factor
  scale.set_scale(config.cf);
  Serial.print("w:");
  Serial.print(scale.get_units(), 2);
  Serial.print(";cf:");
  Serial.print(config.cf,0);
  Serial.print(";dt:");
  Serial.println(config.dt);

  if(Serial.available()){
    cmd = Serial.readString();  //read until timeout
    handleSerial();
  }

  delay(config.dt);
}

void handleSerial() {
    cmd.trim();
    if (cmd == "zero") {
      scale.tare();
      return;
    }

    subcmd = cmd.substring(0,2);

    if (subcmd == "dt"){
      //delayTime = cmd.substring(3).toInt();
      config.dt=cmd.substring(3).toInt();
      EEPROM_writeAnything(0,config);
    }

    else if (subcmd == "cf"){
      //calibration_factor = cmd.substring(3).toInt();
      config.cf = cmd.substring(3).toFloat();
      EEPROM_writeAnything(0,config);
    } 
}
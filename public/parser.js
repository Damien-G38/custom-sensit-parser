"use strict";

/** Radix value for a binary number. */
const BINARY_RADIX = 2;
/** Radix value for a hexadecimal number. */
const HEXADECIMAL_RADIX = 16;
/** Start index of the payload. */
const PAYLOAD_BEGIN_INDEX = 0;
/** End index of the payload. */
const PAYLOAD_END_INDEX = 8;
/** Start index of the battery level data. */
const BATTERY_LEVEL_BEGIN_INDEX = 0;
/** End index of the battery level data. */
const BATTERY_LEVEL_END_INDEX = 5;
/** Maximum value of the battery level (means 100%). */
const BATTERY_MAX_VALUE = 29;
/** Start index of the active mode. */
const ACTIVE_MODE_BEGIN_INDEX = 9;
/** End index of the active mode. */
const ACTIVE_MODE_END_INDEX = 13;
/** Start index of the temperature value. */
const TEMPERATURE_BEGIN_INDEX = 15;
/** End index of the temperature value. */
const TEMPERATURE_END_INDEX = 24;
/** Start index of the humidity value. */
const HUMIDITY_BEGIN_INDEX = 25;
/** End index of the humidity value. */
const HUMIDITY_END_INDEX = 32;
/** Start index of the brightness value. */
const BRIGHTNESS_BEGIN_INDEX = 15;
/** End index of the brightness value. */
const BRIGHTNESS_END_INDEX = 32;

function parser(json) {

  //Value to be decoded
  var valueToDecode = json.value;
  valueToDecode.substring(PAYLOAD_BEGIN_INDEX, PAYLOAD_END_INDEX);

  //Convert payload in binary
  var binary = convertBase.hex2bin(valueToDecode);

  //Extract data
  var results = new Map();
  // -- Battery level from bit 0 to 4
  var rawBatteryLevel = parseInt(binary.substring(BATTERY_LEVEL_BEGIN_INDEX, BATTERY_LEVEL_END_INDEX),BINARY_RADIX);
  var batteryLevel = ((rawBatteryLevel / BATTERY_MAX_VALUE) * 100).toFixed(2); //From SenSit specification
  results.set("Battery_level", batteryLevel);
  
  // -- Active mode
	var activeMode = parseInt(binary.substring(ACTIVE_MODE_BEGIN_INDEX, ACTIVE_MODE_END_INDEX), BINARY_RADIX);
	switch (activeMode) {
    //Mode 1: temperature and humidity
    case 1:
			var rawTemperature = parseInt(binary.substring(TEMPERATURE_BEGIN_INDEX, TEMPERATURE_END_INDEX), BINARY_RADIX);
			var temperature = ((rawTemperature - 200) / 8).toFixed(2); //From SenSit specification
      results.set("Temperature", temperature);
      
			var rawHumidity = parseInt(binary.substring(HUMIDITY_BEGIN_INDEX, HUMIDITY_END_INDEX), BINARY_RADIX);
			var humidity = (rawHumidity / 2).toFixed(2); //From SenSit specification
      results.set("Humidity", humidity);
    
			break;

    // Mode 2 : Brightness
    case 2:
			var rawBrightness = parseInt(binary.substring(BRIGHTNESS_BEGIN_INDEX, BRIGHTNESS_END_INDEX), BINARY_RADIX);
			var brightness = (rawBrightness / 96).toFixed(2); //From SenSit specification
      results.set("Brightness", brightness);
			break;
  }
  
  //Return the map of results
  return results;
}



// Base converter to convert hex to binary
var convertBase = (function() {
  
  function convertBase(baseFrom, baseTo) {
    return function(num) {
      return parseInt(num, baseFrom).toString(baseTo);
    };
  }

  // binary to decimal
  convertBase.bin2dec = convertBase(2, 10);

  // binary to hexadecimal
  convertBase.bin2hex = convertBase(2, 16);

  // decimal to binary
  convertBase.dec2bin = convertBase(10, 2);

  // decimal to hexadecimal
  convertBase.dec2hex = convertBase(10, 16);

  // hexadecimal to binary
  convertBase.hex2bin = convertBase(16, 2);

  // hexadecimal to decimal
  convertBase.hex2dec = convertBase(16, 10);

  return convertBase;
})();

module.exports = parser;

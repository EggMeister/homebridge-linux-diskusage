"use strict";

var Service, Characteristic;
var humidityService;
var { execSync } = require("child_process");

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-linux-diskusage", "LinuxDiskUsage", LinuxDiskUsageAccessory);
}

function LinuxDiskUsageAccessory(log, config) {
  this.log = log;
  this.name = config['name'];
  this.diskDevice = config['diskdevice'];
  this.diskDevices = config['diskdevices'];
}

LinuxDiskUsageAccessory.prototype =
{
  identify: function (callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  getServices: function () {
    var services = [];

    /** accessory information */
    var informationService = new Service.AccessoryInformation();
    var model = execSync("cat /proc/cpuinfo | grep 'model name' | uniq | cut -d':' -f2|awk '{$1=$1};1'", { encoding: "utf8" });
    informationService
      .setCharacteristic(Characteristic.Manufacturer, execSync("lsb_release -d|cut -d':' -f2|awk '{$1=$1};1'", { encoding: "utf8" }))
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.Name, this.name);

    services.push(informationService);

    if ((!this.diskDevices || Object.keys(this.diskDevices).length == 0) && this.diskDevice) {
      var o = {};
      o[this.name] = this.diskDevice
      this.diskDevices = o;
    } else {
      this.log("Error: no disk devices found in configuration")
    }

    for (let [name, device] of Object.entries(this.diskDevices)) {
      console.log(name, device);

      humidityService = new Service.HumiditySensor(name);

      humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', (callback) => {
          let percentage = execSync("df " + device + " --output=pcent|sed 1d|cut -d'%' -f1|awk '{$1=$1};1'| tr -d '\n'", { encoding: "utf8" })
          this.log("Disk usage for " + name + " at " + percentage);
          humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, percentage);
          callback(null, percentage)
        });

      humidityService
        .getCharacteristic(Characteristic.Name)
        .on('get', callback => {
          callback(null, this.name);
        });
      
      humidityService.subtype = name;

      services.push(humidityService);
    }


    return services;
  }
};

if (!Date.now) {
  Date.now = function () { return new Date().getTime(); }
}

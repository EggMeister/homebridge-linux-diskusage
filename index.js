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
}

LinuxDiskUsageAccessory.prototype =
{
  getDiskUsage: function (callback) {
    this.percentage = execSync("df " + this.diskDevice + " --output=pcent|sed 1d|cut -d'%' -f1|awk '{$1=$1};1'", { encoding: "utf8" })
    this.log("Disk usage at " + this.percentage);
    humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.percentage);
    callback(null, this.percentage)
  },

  identify: function (callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  getServices: function () {
    /** accessory information */
    var informationService = new Service.AccessoryInformation();
    var model = execSync("cat /proc/cpuinfo | grep 'model name' | uniq | cut -d':' -f2|awk '{$1=$1};1'", { encoding: "utf8" });
    informationService
      .setCharacteristic(Characteristic.Manufacturer, execSync("lsb_release -d|cut -d':' -f2|awk '{$1=$1};1'", { encoding: "utf8" }))
      .setCharacteristic(Characteristic.Model, model);
    this.log("Model " + model);

    /** Disk usage */
    humidityService = new Service.HumiditySensor("Disk usage");

    humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getDiskUsage.bind(this));

    humidityService
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    return [informationService, humidityService];
  }
};

if (!Date.now) {
  Date.now = function () { return new Date().getTime(); }
}

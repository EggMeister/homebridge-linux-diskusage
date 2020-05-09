# homebridge-linux-diskusage

A homebridge humidity sensor for exposing Linux disk usage.
Based on a different plugin by Chris Jones at https://github.com/cmsj/homebridge-linux-temperature
Based on the fork by Peter Harry at https://github.com/GreyPeter/homebridge-pi-lm75
Based on origial code by Mark Webb-Johnson <mark@webb-johnson.net>.
See original code here: https://github.com/markwj/homebridge-pi


# Installation

1. Install Homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-linux-diskusage`
3. Update your Homebridge `config.json` using the sample below.

# Configuration

```json
{
  "accessory": "LinuxDiskUsage",
  "name": "Root disk usage",
  "diskdevice": "/dev/sda1",
  "diskdevices": {
      "root": "/dev/sda1",
      "share": "/dev/sdb1",
      "data": "/dev/sdc1"
  }
}
```

Fields:

* `accessory` must be "LinuxDiskUsage" (required).
* `name` is the name of the published accessory (required).
* `diskdevice` is the disk device to monitor, if you want to monitor a single device. Use Linux commands `mount` of `df` to get devices.
* `diskdevices`: key/value pairs for name and device location, if you want to monitor multiple disks in a single 'tile'.

Either `diskdevice` or `diskdevices` must be used. If both exist, `diskdevices` is used.

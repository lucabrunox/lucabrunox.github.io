---
title: 'Bluetooth simple one-line device connection pairing with Bluez'
date: 2011-02-09T07:10:00.000-08:00
draft: false
url: /2011/02/bluetooth-simple-one-line-device.html
tags: 
- bluetooth
- python
- bluez
- dbus
---

Hello,  
I've written a simple Python script using the Bluez (version 4.66) stack (thanks to [http://shr-project.org/trac/wiki/Using](http://shr-project.org/trac/wiki/Using)) with this usage:  
  
python connect.py MACADDRESS PIN MOUNTPOINT  
  
Snippet code for [connect.py is here](http://www.refactory.org/s/bluez_connection_pairing_with_bluetooth_device/view/2). If the device is paired, it will be removed and unmounted.  
  
Disconnection is as easy with:  
  
python disconnect.py MACADDRESS MOUNTPOINT  
  
Snippet code for [disconnect.py is here](http://www.refactory.org/s/bluez_disconnect_device/view/1).  
  
Feel free to use the code also for other services, in this case my primary concern was to mount the file system.
---
title: 'Debian and zd1211 wifi'
date: 2008-08-06T09:08:00.000-07:00
draft: false
url: /2008/08/debian-and-zd1211-wifi.html
tags: 
- debian
---

Hello,  
I'm using debian lenny and I've got these two problems:  
  

*   With versions of the linux kernel prior to 2.6.20 (maybe) I could install zd1211 firmware using the module-assistant which has been now dropped from testing and unstable.
*   Boot process slowed down by 30 seconds and couldn't plug-in the usb pen because udev/hal screw up  
    

  
What I've done is to remove the source and its created firmware, with the one shipped with testing and unstable ([bug #411912](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=411912)):  
  

> aptitude remove --purge zd1211-firmware zd1211-source  
> aptitude update  
> m-a clean zd1211  
> aptitude install zd1211-firmware  

  
Now let's fix the hotplug part, open /etc/udev/rules.d/z25\_persistent-net.rules and remove similar lines:  

> \# USB device 0ace:1215 (zd1211rw)  
> SUBSYSTEM=="net", DRIVERS=="?\*", ATTR{address}=="00:1d:0f:b3:66:f7", NAME="eth2"

Now try to detach and reattach your usb pen and everything should magically work.  
  
Thanks to Nss (#debianizzati), dcbw NetworkManager developer and gsimmons (#debian).
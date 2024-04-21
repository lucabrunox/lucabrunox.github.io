---
title: 'Compiz with ATI RS480 on Debian'
date: 2008-08-11T13:41:00.000-07:00
draft: false
url: /2008/08/compiz-with-ati-rs480-on-debian.html
tags: 
- gnome
- debian
---

Hello,  
after years that compositing has been introduced in our desktop, it's finally come the time to try it.  
  
Uninstall fglrx  
My video card is not supported very well with Mesa 7.0.x, in fact I've been using the fglrx driver for a long time.... until now!  
I had to manually dpkg --purge all the related packages.  
Now it's better to rmmod fglrx.  
  
Install mesa 7.1 from experimental  
On #compiz-fusion some guys hinted me I should have used Mesa 7.1rc because of recent improvements on my video card. The only way to get such version was to include experimental sources.  
Ok, no problem, if it doesn't work I can downgrade back to the previous one.  
  
Upgrade xorg to experimental  
But there're still problems, I had to upgrade to the latest xorg in experimental because of mesa compatibility. In fact AIGLX couldn't load DRI drivers because of missing symbols.  
I had to dpkg -l|grep xorg the install the one by one. I did pray for everything to work, really.  
Now backup xorg.conf and go ahead with X -configure.  
  
Install compizconfig-settings-manager and compiz-fusion-plugins-extra  
For some reason, the first time I've tried running compiz it's gone Segmentation Fault. On the IRC channel they hinted me to install the crash handler plugin to back track the error. After installing such packages, magically compiz --replace worked!  
Now I have a GNOME Desktop with the Blue-Joy theme and the Avant Window Navigator.  
  
Everything both nice and unuseful, but now I understand how eye-candy fancy stuff can change your desktop.  
  
Before the war:  
[![](http://farm4.static.flickr.com/3168/2742075004_d0a88922ee_m.jpg)](http://www.flickr.com/photos/28048776@N05/2742075004/)  
  
After:  
[![](http://farm4.static.flickr.com/3165/2754820348_85fb12791f_m.jpg)](http://www.flickr.com/photos/28048776@N05/2754820348/)
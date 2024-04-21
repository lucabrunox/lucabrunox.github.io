---
title: 'kqemu on Debian amd64'
date: 2008-08-07T09:07:00.001-07:00
draft: false
url: /2008/08/kqemu-on-debian-amd64.html
tags: 
- debian
---

Hello,  
I've been using [qemu](http://en.wikipedia.org/wiki/Qemu) a lot lately because I'm creating an usb hdd with [debian live](http://debian-live.alioth.debian.org).  
The image contains a system running postgresql, development packages for gtk and python and gnome-core . All this ends up loading in more than 5 minutes, this is really boring.  
  
Then I begun looking for a faster virtualization system, and found [KVM](http://kvm.qumranet.com/kvmwiki). Unfortunately my processor hasn't the right flag for it.  
  
Finally I found [kqemu](http://en.wikipedia.org/wiki/KQEMU#Accelerator), which is a module for the kernel that speeds up a lot qemu. I never thought it could speed up things...... so.... much!  
Let's install it:  

> m-a a-i kqemu  
> modprobe kqemu

That's it, for those who owns an amd64 processor, this is the right way to use kqemu:  

> qemu-system-x86\_64 -kernel-kqemu \[your options\]  

You shouldn't get any error, if you do... boh.  
  
The image now boots in 33 seconds down to the bottom init scripts, and GNOME works only with a slight delay but it's definitely a great speed up. With the real machine, I enter gnome in about 40 seconds.  
  
Keep going the good work Qemu team, and thanks as usual to everyone who helped me on IRC.
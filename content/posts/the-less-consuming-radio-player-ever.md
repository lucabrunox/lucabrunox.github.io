---
title: 'The less consuming radio player ever'
date: 2009-06-20T13:10:00.000-07:00
draft: false
url: /2009/06/less-consuming-radio-player-ever.html
tags: 
- gstreamer
- media
- gnome
- performance
---

Hello,  
multimedia always killed desktop performance, also audio with all such effect-based players out there. I've been using [deezer](http://www.deezer.org) for a long time, but sometimes I'm tired to see my desktop lagging.  
I don't need that, I need random music from internet while I'm either programming or studying, and my computer has only 512mb ram and 2.4ghz amd64 (onLY??? yes nowadays it's a little amount).  
  
Let's see what we can do using gst-launch:  
```
  
while \[ 1 \]; do wget -q -O - http://66.250.45.112:80/hard.ogg|gst-launch fdsrc fd=0 ! decodebin ! audioconvert ! alsasink; done  

```
  
The URL above is a hard rock station :) The **while** ensures re-connection. I think performances are great, 6% cpu and 2% ram.  
  
But there's yet a bettere solution (see comments):  
```
  
mplayer http://66.250.45.112:80/hard.ogg  

```
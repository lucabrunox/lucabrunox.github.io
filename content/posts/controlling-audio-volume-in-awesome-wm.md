---
title: 'Controlling audio volume in Awesome WM'
date: 2013-03-24T13:15:00.003-07:00
draft: false
url: /2013/03/controlling-audio-volume-in-awesome-wm.html
tags: 
- awesome
- audio
- desktop
---

I use awesome on my eeepc because it's much space and resource saving.  
There are several possibilities for controlling volume in the [Awesome window manager](http://awesome.naquadah.org/).  
Today I'd like to share my way of doing it: using amixer for controlling the volume, and [naughty](http://awesome.naquadah.org/wiki/Naughty) for notifying the user.  
  
Start by defining the following in your rc.lua ([source discussion here](http://comments.gmane.org/gmane.comp.window-managers.awesome/7577)):  

volnotify \= {}  
volnotify.id \= nil  
function volnotify:notify (msg)  
    self.id \= naughty.notify({ text \= msg, timeout \= 1, replaces\_id \= self.id}).id  
end

  
We use naughty for notifying the user instead of notify-send because of the "replaces\_id" feature. It's used to replace an old notification with a new one. This is useful when you keep increasing the volume so that you only get one notification instead of stacking them up.  
So the purpose of this code is to keep track of the id returned by naughty on each invocation, so that we can pass it to the next invocation.  
  

function volume(incdec)  
    awful.util.spawn\_with\_shell ("vol=$(amixer set Master 5%" .. incdec .. "|tail -1|cut -d % -f 1|cut -d '\[' -f 2) && echo \\\\\\"volnotify:notify('Volume $vol%')\\\\\\"|awesome-client -", false)  
end  
  
function togglemute()  
    awful.util.spawn\_with\_shell("vol=$(amixer set Master toggle|tail -n 1|cut -d '\[' -f 3|cut -d '\]' -f 1) && echo \\\\\\"volnotify:notify('Volume $vol')\\\\\\"|awesome-client -", false)  
end

  
The first function is used to increase or decrease the volume. It accepts an argument of value either "+" or "-", then changes the master volume accordingly and finally displays a notification with the new volume.  
The second function will toggle the mute state of the volume in a similar manner.  
  
We are going to call these two functions whenever the user hits the media keys by binding new global keys as follows:  
  

globalkeys \= awful.util.table.join (globalkeys,  
    awful.key({}, "XF86AudioMute", togglemute),  
    awful.key({}, "XF86AudioLowerVolume", function() volume("-") end),  
    awful.key({}, "XF86AudioRaiseVolume", function() volume("+") end)  
)

  
Restart with Mod+Ctrl+R and that's it!
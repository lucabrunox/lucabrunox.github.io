---
title: 'Switch window by name on Linux - alternative to Alt+Tab'
date: 2013-03-28T04:24:00.000-07:00
draft: false
url: /2013/03/switch-window-by-name-on-linux.html
tags: 
- window manager
- zenity
- linux
- wmctrl
- xbindkeys
- desktop
---

Today I want to share a very simple script that works with most Linux window managers: switch window by name.  
**It works like this**: you press Ctrl+Alt+M, then a dialog appears where you write part of the name of the window, and you'll get switched to the window that matches the provided name.The string your provide will match **part** of window names in **case-insensitive** mode.  
That means if you have "Foo - Mozilla Firefox" and type in "fire" you'll switch to firefox.  
  
_Note: it probably doesn't work with your configuration of [awesome wm](http://awesome.naquadah.org/) due to weird focus management._  
  
The first step is to install the necessary packages:  

apt-get install xbindkeys wmctrl zenity

  
With [wmctrl](http://tomas.styblo.name/wmctrl/) we're able to switch to a window by specifying the name, while with [xbindkeys](http://www.nongnu.org/xbindkeys/) we can bind Ctrl+Alt+M to open a [zenity](https://help.gnome.org/users/zenity/stable/) dialog then call wmctrl with the provided window name.  
  
The only thing you need is the following file somewhere, let's call it keys.rc:  

"WINDOWID='' app=$(zenity --text "App" --title "App" --entry) && wmctrl -R $app"  
  control+alt + m

  
Now run xbindkeys \-f keys.rc and we're done! Press Ctrl+Alt+M then type in the name of the window you want to switch to.  
  
We can also add simpler bindings like this:  

"wmctrl -R Firefox"  
  control+alt + f

  
Now pressing Ctrl+Alt+F will switch to a firefox window.  
  
Note that if it matches more window, only one of the window will be chosen obviously. The choice depends on xbindkeys.  
  
I'm not using Alt+Tab anymore.
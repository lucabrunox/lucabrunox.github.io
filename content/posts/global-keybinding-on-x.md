---
title: 'Global keybinding on X'
date: 2008-12-21T01:52:00.000-08:00
draft: false
url: /2008/12/global-keybinding-on-x.html
tags: 
- gnome
- gtk
- xlib
- python
- development
---

Hello,  
lately I've been looking for a way to create a desktop-wide keybinding for [FreeSpeak](http://freespeak.berlios.de/).  
I first looked into Tomboy and Deskbar source codes but the egg was too huge to be adopted, and it would have brought C dependency which isn't always nice for a Python project.  
Then fargiolas pointed me to a [blog post](http://blogs.gnome.org/brunobol/2008/12/14/global-keybindings-in-gtk/) where I could find about [gnome keybindings](http://live.gnome.org/ControlCenter/ApplicationDefinedKeybindings) owned by gnome control center. Well that was only a mirage as it doesn't really grab the key but it's only a visual entry in the keyboard shortcuts preferences.  
After a few days I've finally found a not-so-hackish solution in about one hundred lines of Python code.  
  
Here is the [snippet](https://www.siafoo.net/snippet/239) ([download](https://www.siafoo.net/snippet/239/download/globalkeybinding.py)), only using [Xlib](http://python-xlib.sourceforge.net/) and GTK+ Python bindings.  
  
Sample usage:  
```
  
def callback (keybinding):  
   print 'Callback!'  
   gtk.main\_quit ()  
  
gtk.gdk.threads\_init ()  
keybinding = GlobalKeyBinding ("/apps/appdir", "key\_binding")  
keybinding.connect ('activate', callback)  
keybinding.grab ()  
keybinding.start ()  
gtk.main ()  

```
  
  
The only problem is that it doesn't make use of GDK filters because PyGTK doesn't provide such function wrappers and there's no GDK-to-Xlib mapping available.  
But yes, it works very good.
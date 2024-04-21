---
title: 'Syx, GTK+ and threading'
date: 2008-05-23T14:00:00.000-07:00
draft: false
url: /2008/05/syx-gtk-and-threading.html
tags: 
- syx
- smalltalk
- gnome
- gtk
- development
---

Hello,  
you all know that Gtk+ has locks for the GUI when dealing with the X server and prevent async events to be sent. This is done by manually acquiring/releasing the lock on Gdk. Many Gtk+ ports don't do this automatically.  
  
Syx used gtk\_main() into a thread and automatically put gdk enter/leave for each function in its wrapper. It would be somewhat ugly in Smalltalk code having to enter/leave each time.  
Of course, on Windows everything leads to troubles with threads.  
  
But Smalltalk has Processes, handled by an internal scheduler. I decided then to not create a thread but cycle through Gtk+ events in the scheduler itself. Now everything works correctly.  
  
Difference with other wrappers? The way Smalltalk is thought let you perform multi-tasking without the need to use OS threads, which means no problems on Windows and no need to take care of the Gdk lock everytime.  
  
In addition, I rewrote part of the Console (Smalltalk-side) to be asyncronous using Semaphores. Now you can work on widgets after you run Gtk main! A small example:  
  

> Smalltalk YX 0.1.7 is ready.  
> Type "help!" to get help.  
> \> Smalltalk loadPlugin: 'gtk'!  
> true  
> \> | w |  
> \> w := GtkWindow new.  
> \> Gtk main.  
> \> w add: (GtkLabel new: 'hello').  
> \> w showAll!  
> a GtkWindow  

You can imagine the result ;)  
If you want to try it out you can download the [scheduler branch snapshot](http://repo.or.cz/w/syx.git?a=snapshot;h=scheduler;sf=tgz).  
  
Stay tuned for next 0.1.7 release.
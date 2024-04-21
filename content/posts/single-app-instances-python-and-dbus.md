---
title: 'Single app instances, Python and DBus'
date: 2008-11-16T10:01:00.000-08:00
draft: false
url: /2008/11/single-app-instances-python-and-dbus.html
tags: 
- gnome
- gtk
- python
- dbus
- development
---

Hello,  
[I'm working on](http://lethalman.blogspot.com/2008/10/freespeak-gtkgnome-translator.html) [FreeSpeak](http://home.gna.org/freespeak) lately and I needed to run the application once per session, as it's got a trayicon and a notebook (maybe windows with an applet is better?)  
I decided to use [DBus](http://dbus.freedesktop.org/) for making the application run only a single instance; when you try to open it again it won't start another process, instead it will use the already running one.  
  
This is how I would create a generic single app instance with dbus-python:  
```
import dbus  
import dbus.bus  
import dbus.service  
import dbus.mainloop.glib  
import gobject  
  
class Application (dbus.service.Object):  
  def \_\_init\_\_ (self, bus, path, name):  
    dbus.service.Object.\_\_init\_\_ (self, bus, path, name)  
    self.loop = gobject.MainLoop ()  
  
 @dbus.service.method ("org.domain.YourApplication",  
                       in\_signature='a{sv}', out\_signature='')  
 def start (self, options={}):  
   if self.loop.is\_running ():  
     print 'instance already running'  
   else:  
     self.loop.run ()  
  
dbus.mainloop.glib.DBusGMainLoop (set\_as\_default=True)  
bus = dbus.SessionBus ()  
request = bus.request\_name ("org.domain.YourApplication", dbus.bus.NAME\_FLAG\_DO\_NOT\_QUEUE)  
if request != dbus.bus.REQUEST\_NAME\_REPLY\_EXISTS:  
 app = Application (bus, '/', "org.domain.YourApplication")  
else:  
 object = bus.get\_object ("org.domain.YourApplication", "/")  
 app = dbus.Interface (object, "org.domain.YourApplication")  
  
\# Get your options from the command line, e.g. with OptionParser  
options = {'option1': 'value1'}  
app.start (options)
```
How it works?  

1.  Setup the mainloop for dbus
2.  Request a session bus name, so that other applications (in our case another instance of the same application) can connect to it
3.  Create a new instance at path / if the bus name doesn't exist (so we are the primary owner). If it exists, then obtain the object from dbus and call the method on the remote Application object using the known interface.  
    
4.  The Application.start method checks if it's already running then decide what to do in both situations.

Creating a GTK+ application this way is really easy. It only needs to use the GTK+ mainloop.  
Let's suppose we want to present() the GtkWindow when the user tries to open another instance of the application:  
```
import dbus  
import dbus.bus  
import dbus.service  
import dbus.mainloop.glib  
import gobject  
import gtk  
import gtk.gdk  
import time  
  
class Application (dbus.service.Object):  
 def \_\_init\_\_ (self, bus, path, name):  
   dbus.service.Object.\_\_init\_\_ (self, bus, path, name)  
   self.running = False  
   self.main\_window = gtk.Window ()  
   self.main\_window.show\_all ()  
  
 @dbus.service.method ("org.domain.YourApplication",  
                       in\_signature='', out\_signature='b')  
 def is\_running (self):  
   return self.running  
  
 @dbus.service.method ("org.domain.YourApplication",  
                       in\_signature='a{sv}i', out\_signature='')  
 def start (self, options, timestamp):  
   if self.is\_running ():  
     self.main\_window.present\_with\_time (timestamp)  
   else:  
     self.running = True  
     gtk.main ()  
     self.running = False  
  
dbus.mainloop.glib.DBusGMainLoop (set\_as\_default=True)  
bus = dbus.SessionBus ()  
request = bus.request\_name ("org.domain.YourApplication", dbus.bus.NAME\_FLAG\_DO\_NOT\_QUEUE)  
if request != dbus.bus.REQUEST\_NAME\_REPLY\_EXISTS:  
 app = Application (bus, '/', "org.domain.YourApplication")  
else:  
 object = bus.get\_object ("org.domain.YourApplication", "/")  
 app = dbus.Interface (object, "org.domain.YourApplication")  
  
\# Get your options from the command line, e.g. with OptionParser  
options = {'option1': 'value1'}  
app.start (options, int (time.time ()))  
if app.is\_running ():  
 gtk.gdk.notify\_startup\_complete ()
```
How it works?  
  
Let's say we're running the Application for the first time, the loop begins and when it ends running is set to False, so gtk.gdk.notify\_startup\_complete() won't be called. Instead, if the application is already running, start() will be called on the remote object running the loop. The method then returns immediately so gtk.gdk.notify\_startup\_complete() will be called.  
If you don't notify to the launcher that the startup is complete... guess what happens to your mouse and to your taskbar panel...  
  
If the loop is running, the window is presented to the user with a little delay. If you don't use any timestamp, the UI interaction won't let the window have the time to be presented.  
  
Of course, you can use DBus for many more things, like both setting options from the command line, as explained in the above code, and let other applications communicate with yours and viceversa.  
Nowadays almost all systems use DBus, so it won't be a pain to add such dependency. In my opinion, it would be much more painful to use lock files, FIFO, unix sockets or whatever. FreeSpeak used such old technologies and it was a very poor emulation of what DBus already offers.
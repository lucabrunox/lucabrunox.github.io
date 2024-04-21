---
title: 'Grab focus on Gtk Widget'
date: 2012-11-22T11:49:00.003-08:00
draft: false
url: /2012/11/grab-focus-on-gtk-widget.html
tags: 
- gnome
- gtk
- development
- vala
---

Many times I had to give focus to a newly created Gtk widget that still had to be mapped to screen. Since [widget.grab\_focus()](http://developer.gnome.org/gtk3/stable/GtkWidget.html#gtk-widget-grab-focus) does not work if the widget is not displayed on the screen, then I always used an idle source to delay the operation.  
Today I noticed that **the idle may be too late**: if the user is writing something, then some key strokes may be lost because the idle runs slightly after the widget has been mapped. You may think that's imperceptible to the user, but that's not true in some cases.  
  
So I've tried connecting to the map, map-event and show signals (also "after"), without success: the handler is called slightly before the right time thus grab\_focus() will not work.  
  
Then I ended up with this working solution, that will grab the focus as soon as the widget is first drawn to the screen:  
  
```
void focus\_widget (Widget widget) {
  // it may be already displayed
  widget.grab\_focus ();
  // grab focus right after the widget is drawn
  // for the first time
  ulong sigid \= 0;
  sigid \= widget.draw.connect (() \=\> {
    widget.grab\_focus ();
    widget.disconnect (sigid);
    return false;
  });
}

```
  
I still don't know exactly what's the best way to grab focus as soon as the widget can really grab it. So if you have any better idea, please let me know :-)
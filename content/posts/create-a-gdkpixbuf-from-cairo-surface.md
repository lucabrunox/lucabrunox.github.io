---
title: 'Create a GdkPixbuf from cairo surface'
date: 2009-04-26T10:40:00.000-07:00
draft: false
url: /2009/04/create-pixbuf-from-cairo-surface.html
tags: 
- gnome
- gtk
- cairo
---

Hello,  
here's the inverted code snippet of the previous post.  
  
`w, h = surface.get_width(), surface.get_height()  
  
pixmap = gtk.gdk.Pixmap (None, w, h, 24)  
  
cr = pixmap.cairo_create ()  
  
cr.set_source_surface (surface, 0, 0)  
  
cr.paint ()  
  
pixbuf = gtk.gdk.Pixbuf (gtk.gdk.COLORSPACE_RGB, True, 8, w, h)  
  
pixbuf = pixbuf.get_from_drawable (pixmap, gtk.gdk.colormap_get_system(), 0, 0, 0, 0, w, h)`
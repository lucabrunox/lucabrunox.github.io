---
title: 'Create a cairo surface from a pixbuf'
date: 2009-04-25T02:03:00.000-07:00
draft: false
url: /2009/04/create-cairo-surface-from-pixbuf.html
tags: 
- gnome
- cairo
- clutter
---

Hello,  
sometimes in the code of a couple of projects I see some hard algorithms to transform a pixbuf in a cairo surface.  
Maybe most of people don't know that GdkCairoContext, contrarily to cairo\_t, is created against a cairo context not a cairo surface:  
  
`surface = cairo.ImageSurface (cairo.FORMAT_ARGB32, pixbuf.get_width(), pixbuf.get_height())  
  
cr = cairo.Context (surface)  
  
gdkcr = gtk.gdk.CairoContext (cr)  
  
gdkcr.set_source_pixbuf (pixbuf)  
  
gdkcr.paint ()`  
  
Notice gtk.gdk.CairoContext (cr), which cr is not the surface. That's the key of the code snippet.  
  
For instance this can be applied on a ClutterCairoTexture to render pixbufs in the canvas.
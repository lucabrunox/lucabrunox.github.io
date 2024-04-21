---
title: 'Using Mash with Vala'
date: 2010-07-29T06:22:00.000-07:00
draft: false
url: /2010/07/using-mash-with-vala.html
tags: 
- gnome
- development
- vala
- clutter
---

Hello,  
recently [Mash](http://git.clutter-project.org/mash/) has been released. It is a library for reading models in [PLY format](http://en.wikipedia.org/wiki/PLY_(file_format)) and creating [Clutter](http://www.clutter-project.org/) actors from them. For reference, [Blender](http://www.blender.org/) is able to export to PLY. It means you can draw your models with Blender and use Clutter as rendering engine.  
Clutter is a 3D canvas and animation toolkit while Blender is a 3D modelling suite.  
  
What I've tested so far is porting the [Monkey Viewer C example](http://git.clutter-project.org/mash/tree/example/viewer.c) to [Vala](http://live.gnome.org/Vala): [code snippet and monkey PLY here](http://live.gnome.org/action/edit/Vala/ClutterSamples#Blender_models).  
  
[![](http://live.gnome.org/Vala/ClutterSamples?action=AttachFile&do=get&target=mash-monkey.png)](http://live.gnome.org/Vala/ClutterSamples?action=AttachFile&do=get&target=mash-monkey.png)  
  
That is going to be awesome, stay tuned!
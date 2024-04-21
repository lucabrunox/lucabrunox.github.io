---
title: 'Valagtkdoc 1.0'
date: 2010-04-02T08:14:00.001-07:00
draft: false
url: /2010/04/valagtkdoc-10.html
tags: 
- valagtkdoc
- gtk
- development
- gtkdoc
- vala
---

Hello,  
yes... this is the nth program I'm writing in this period. I hope this is the last one :)  
  
Valagtkdoc is a tool that integrates Vala with GTK-Doc for documentation generation.  
  
You can find download and example usage at [the homepage](http://lethalman.hostei.com/valagtkdoc).  
  
I think it's far from being perfect, and actually I haven't tried integrating it with autotools, but it shouldn't be that hard. Unfortunately, you have to somehow break the gtk-doc rule "do not run it manually" because valagtkdoc goes in the middle between gtkdoc-scan and gtkdoc-mkdb.  
  
If anybody has a better solution, please tell me :)
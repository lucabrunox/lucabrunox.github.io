---
title: 'Smalltalk YX toward a new interpreter'
date: 2008-04-15T02:51:00.000-07:00
draft: false
url: /2008/04/smalltalk-yx-toward-new-interpreter.html
tags: 
- syx
- smalltalk
- development
---

Hello,  
Smalltalk YX is currently working on refactoring a part of the interpreter, relative to contexts and stack management.  
The current version uses one stack per process but always create contexts for each method or block entered.  
The new branch, called newinterp, won't create those contexts anymore but they will be created only on-demand (e.g. thisContext). This means both less resources and garbage collector usage, and a possible speedup.  
  
More informations on the [mailing list here](http://groups.google.com/group/syx-discuss/browse_thread/thread/6181dac94bac1cc4).
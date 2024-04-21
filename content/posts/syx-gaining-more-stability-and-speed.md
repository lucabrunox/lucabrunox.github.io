---
title: 'Syx gaining more stability and speed'
date: 2008-07-13T07:00:00.001-07:00
draft: false
url: /2008/07/syx-gaining-more-stability-and-speed.html
tags: 
- syx
- smalltalk
- development
---

Hello,  
in the new branches of Syx (an open source Smalltalk-80 implementation) we're working to try a new kind of memory management and add many features that have been missed until now to focus on other stuff.  
  
The new faster and more modern v0.1.8 release will contain the following refactoring:  

*   Objects will be variable-length (minumum 12 bytes on 32-bit processors and 16 bytes on 64-bit processors)
*   By changing the objects also the GC changed to a mark and compact GC  
    
*   Threaded-switch statement to run processes
*   More efficient method cache (maybe a simple global cache lookup for this release)  
    

API for primitives will only change slightly.  
  
Suggestions for any new particular technologies are welcome.
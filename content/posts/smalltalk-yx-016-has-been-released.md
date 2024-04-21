---
title: 'Smalltalk YX 0.1.6 has been released'
date: 2008-01-07T03:21:00.000-08:00
draft: false
url: /2008/01/smalltalk-yx-016-has-been-released.html
tags: 
- syx
- smalltalk
- development
---

Hello,  
as usual these release notes follows.  
  

This is a major bug fixes release, but introduce as usual many features. First of all this release put the GNU build (autotools) as first build system, and SCons as secondary which is still useful for MingW and the WinCE port.

*   Full GNU build support
*   X11 plugin
*   A basic CommandLine class for parsing the command line
*   Basic support for handling foreign C pointers and structs/unions from Smalltalk has been added
*   Several fixes for building on Sparc 64 using SCons
*   The -e option from command line has been added
*   Some help and Syx status will be printed in console mode
*   FileStream fileIn has been fixed
*   Class declaration from Smalltalk has been fixed
*   Lexer fixes for symbols, identifier and strings
*   FileStream now handles FILE\* instead of file descriptors and this fixed several bugs
*   System startup has been fixed when fileing in files
*   Dictionary rehashing has been fixed
*   Basic support for handling foreign C structs and unions from Smalltalk has been added

**Thanks to everyone contributing to the project.**

See the [ChangeLog](http://syx.googlecode.com/svn/tags/syx-0.1.6/ChangeLog) for a complete list of things that changed.
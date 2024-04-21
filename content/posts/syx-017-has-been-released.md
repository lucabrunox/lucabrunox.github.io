---
title: 'Syx 0.1.7 has been released'
date: 2008-06-07T14:18:00.001-07:00
draft: false
url: /2008/06/syx-017-has-been-released.html
tags: 
- syx
- smalltalk
- development
---

Hello,  
after several months a new version of Syx has been released. This release contains mostly VM changes and some changes to the Smalltalk Collections. As usual, release notes follow:  
  

This versions enhances a new version of the interpreter, major updates to the scheduler, and as usual a lot of bug fixes. Syx left the Google Code SVN repositories because of many connection problems.

You can find informations about the new GIT repository here: [http://code.google.com/p/syx/wiki/GitSource?tm=4](http://code.google.com/p/syx/wiki/GitSource?tm=4)

Installation instructions: [http://code.google.com/p/syx/wiki/InstallationInstructions](http://code.google.com/p/syx/wiki/InstallationInstructions)

API and environment:

*   SYX\_ROOT\_PATH and SYX\_PLUGIN\_PATH environment variables have been introduced.
*   Process and context creation changed.
*   New functions have been added for the scheduler, for manually do events iteration and adding idle functions to wake up semaphores.
*   Startup responsibility has been dropped from libsyx.
*   Added syx errors for system signals to be used with syx\_signal.
*   Image recovering has been fixed.

Smalltalk:

*   Covered several standard methods for Collections, Numbers and Object printing/storing.
*   Error reporting from the VM now drops the exception to the Smalltalk environment when the interpreter is running.
*   Random class has been added.
*   Signal handling improvements for the GTK+ plugin.
*   #display family methods have been introduced for Smalltalk objects.

Interpreter:

*   System signal handling has been improved.
*   Cache hash code of Symbols.
*   The interpreter has been refactored to use one stack per Process.
*   Contexts are now created only on demand.
*   Optimized Symbols creation.
*   Signal class has been abstracted.

Parser:

*   The parser have been changed for handling new interpreter specifications.
*   Several fixes to the parser for special cases.
*   Fixed blocks scope.
*   Support <- assignment.

Image:

*   Image snapshot will nullify C pointers
*   Image format has been changed for handling new interpreter specifications.
*   Handle internal interpreter C pointers to be restored the right way.

Scheduler:

*   Different behavior of the scheduler for POSIX and Windows systems has been introduced.
*   Scheduler external idle sources have been added.
*   Asyncronous command line and GTK+ loop using semaphores. This leads to dropping readline.
*   A simple round robin scheduler has been added.
*   Dropped image saving of POSIX fd poll

Documentation:

*   Added lots of new comments.
*   Started documentation project including a manual still under development and a manpage.

**Thanks to everyone contributing to the project.**

See the [ChangeLog](http://repo.or.cz/w/syx.git?a=blob;f=ChangeLog;hb=0.1.7) for a complete list of things that changed.
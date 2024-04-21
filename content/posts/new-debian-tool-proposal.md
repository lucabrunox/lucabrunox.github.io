---
title: 'New debian tool proposal'
date: 2008-06-30T01:16:00.000-07:00
draft: false
url: /2008/06/new-debian-tool-proposal.html
tags: 
- debian
- development
---

Hello,  
this is my second post about Debian. I'm lately discovering all the tools for both managing my Debian system and creating packages.  
dh\_make is the first tool I've used for the "first debianization" (called so by the New maintainers' guide) which creates a basic template for your package.  
Anyway after a few packagings I've seen that something redundant could be automatized further.  
What I suggest is a tool that does the following stuff after dh\_make has been called:  

1.  First dpkg-buildpackage -rfakeroot
2.  Check for libraries and binaries and create new packages in debian/control
3.  Find docs in usr/shared and modify the doc-base
4.  Check for .desktop files and .xpm then create menu
5.  Find info and manpages files
6.  Obtain copyright from COPYING/LICENSE and such, authors from AUTHORS and so on
7.  Find ITP on BTS and fill in the bug number in the changelog  
    
8.  Rebuild the project
9.  Check for lintian errors and warnings and try to fix them (such as empty directories, wrong library name, etc.)

I'm sorry if I'm missing any files such as init.d or cron.d but I'm still newbie with packaging and I haven't tried all the stuff yet.  
How this tool sounds to you? Would it be useful and easy to make at least for simple autotooled projects?
---
title: 'Tdpkg 1.0 - speed up reading dpkg database'
date: 2010-03-15T13:21:00.000-07:00
draft: false
url: /2010/03/tdpkg-speed-up-reading-dpkg-database.html
tags: 
- dpkg
- aptitude
- tdpkg
- debian
---

Hello,  
you may have noticed that dpkg takes a long time reading the database the first time you run it (e.g. through apt). This is because of the huge number of /var/lib/dpkg/info/\*.list files (1700+ on my desktop machines). It can take up to 14 seconds and more at cold start to install/remove a single package.  
Since 2007 in dpkg mailing list a first proposal (by Sean Finney) to using sqlite as cache has been posted, then a couple of weeks ago I reproposed it. No reply since then from the maintainers.  
  
My first idea was to fork dpkg and only change the part about reading the list files. This means you had to install another dpkg version, and I haven't done it for two main reasons: most of people wouldn't have replaced dpkg and it'd have been too hard to maintain it.  
The solution is [tdpkg](http://lethalman.hostei.com/tdpkg.html), a shared library that wrappes around glibc function calls of dpkg. You'll find in README to backup your /var/lib/dpkg/info but tdpkg is robust enough to not fuck it up.  
  
Tdpkg comes with tokyocabinet (faster) and sqlite (handles concurrency better) cache backends. I've managed to bring cold startup time from about 14 seconds down to about 2 seconds. I will definitely have fun installing and removing applications back again.
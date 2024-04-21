---
title: 'Tdpkg troubleshooting and some news'
date: 2010-03-16T13:05:00.000-07:00
draft: false
url: /2010/03/tdpkg-and-some-news.html
tags: 
- dpkg
- aptitude
- tdpkg
- debian
---

Hello,  
lately I've received some feedback, thanks for this.  
  
1) Is it compatible with apt? Can I use dpkg back again after using tdpkg?  
The answer is... yes! You can use what you want in the order you want, and use tdpkg when you want. Take in consideration that after using dpkg (or apt) without tdpkg, then you use tdpkg the cache will be rebuilt for consistency.  
  
2) It's not working here (Ubuntu, other distro...), doesn't create the cache.  
First of all you have to be root when first running tdpkg in order to create the cache. If this didn't solve the problem you are maybe using an untested platform. Debian uses eglibc and tdpkg has been tested on i386 and amd64. Since tdpkg does wrapping around glibc calls it might happen to not wrap the right functions. If you want tdpkg to be ported to your platform please comment here with the result of these commands:  
objdump -T /usr/bin/dpkg|grep open  
objdump -T /usr/bin/dpkg|grep stat  
objdump -T libtdpkg.so|grep open  
objdump -T libtdpkg.so|grep stat  
  
3) Should I put the alias also for apt-get and aptitude?  
Yes you have to. Aptitude and apt-get bypass the shell so the only alias for dpkg won't work.  
  
Another thing I'd like to say is that dpkg/experimental has a patch that speeds up a lot database reading by asking the kernel to cache .list files... i.e. dpkg will avoid cold start. This brings timing from 14 seconds to about 3 seconds! At all, using tokyocabinet you get 1 second. Think that including a cache inside dpkg would mean even less than 1 second.  
  
Have fun... :)
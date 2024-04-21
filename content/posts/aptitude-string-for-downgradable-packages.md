---
title: 'Aptitude string for downgradable packages'
date: 2011-02-19T13:17:00.000-08:00
draft: false
url: /2011/02/aptitude-string-for-downgradable.html
tags: 
- aptitude
- debian
---

Hello,  
I'm lately doing some tests with Debian experimental packages thus I often upgrade some packages to experimental and downgrade them back to unstable.  
WARNING: Downgrading in Debian is not supported etc.  
  
```
aptitude search "?narrow(?installed,?archive(experimental))" -F %p|\\  
sed 's,\\(\[^  \]\*\\),\\1/unstable,'|xargs echo  

```
  
  
This will give you a list of experimental packages installed on your system each concatenated with "/unstable". The output can go straight to "aptitude install". I don't directly use "xargs aptitude install" because it's not interactive.
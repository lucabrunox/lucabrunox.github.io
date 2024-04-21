---
title: 'Mailbox-to-mbox'
date: 2008-12-26T10:54:00.000-08:00
draft: false
url: /2008/12/mailmbox-to-mbox.html
tags: 
- mail
- mutt
- debian
---

Hello,  
lately I've been looking for a way to convert a [mailman](http://www.list.org/) [archive](http://www.mail-archive.com/) to an mbox format so that I could open with [mutt](http://www.mutt.org/).  
I then found a couple of scripts, but the one I've found simpler and working for my needs is [mailbox2mbox.pl](http://svn.rot13.org/index.cgi/perl/view/trunk/mailman2mbox.pl).  
Sample usage:  
```
  
$ gunzip YourArchive.txt.gz  
$ perl mailbox2mbox.pl < YourArchive.txt > mbox  
$ mutt -f mbox  

```
  
And it simply works!  
Does anybody know a method as simple as the above one but more powerful?  
  
PS: Happy holidays!
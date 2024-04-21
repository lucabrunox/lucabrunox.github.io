---
title: 'New GPG key'
date: 2009-08-29T05:46:00.000-07:00
draft: false
url: /2009/08/new-gpg-key.html
tags: 
- gpg
- debian
---

Hello,  
due to some synchronization problems between my desktop and laptop, unfortunately I've lost my GPG secret key. I was planning to renew my key after the SHA issues, but this way I can't neither revoke the old key nor sign the new key. So I please anybody having my pubkey to delete it:  
gpg --delete-key [C29A9371  
](http://pgp.mit.edu:11371/pks/lookup?op=get&search=0xC3D423FBC29A9371)  
I've uploaded my new key as usual so you can get it:  
gpg --keyserver pgp.mit.edu --recv-keys [D2C27B6B](http://pgp.mit.edu:11371/pks/lookup?op=get&search=0x44EB1667D2C27B6B)
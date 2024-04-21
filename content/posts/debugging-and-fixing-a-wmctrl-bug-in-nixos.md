---
title: 'Debugging and fixing a wmctrl bug in NixOS'
date: 2014-07-09T14:05:00.000-07:00
draft: false
url: /2014/07/debugging-and-fixing-wmctrl-bug-in-nixos.html
tags: 
- nixpkgs
- nix
- xbindkeys
- wmtrl
- nixos
---

Without wmctrl I'm lost. I use it together with xbindkeys so that pressing a combination of keys will raise a window of the desktop (editor, shell, browser, chat, ...).  
  
It turns out however that in NixOS wmctrl didn't work well. I had 3 windows opened, and wmctrl -l only showed one. Since gnome3 is still young in nixos, the first thought was that mutter did something wrong when returning the list of clients, due to some possible packaging mistake.  
  
However, xprop -root correctly listed 3 window ids for the \_NET\_CLIENT\_LIST atom, so mutter did its job.  
  
Therefore it might be a problem of wmctrl. I'm always sure in these cases Debian has a patch, however I wanted to find out by myself.  
  
Let's prepare an environment for hacking wmctrl:  
  
$ nix-shell ~/nixpkgs -A wmctrl  
$ unpackPhase  
$ cd $sourceRoot  
$ configurePhase  
$ buildPhase  
$ ./wmctrl -l  
  
Ok it runs. Now let's dive into the code.  

1.  Open main.c
2.  Search for \_NET\_CLIENT\_LIST
3.  Note the for loop in list\_windows function right below, it uses client\_list\_size / sizeof(Window) in the condition. That may be the culprit. 
4.  We make use of the most advanced debugging technique: before the for loop add a printf("%lu\\n%lu\\n", client\_list\_size, sizeof(Window));

Now let's rebuild and run wmctrl:  
  
$ buildPhase  
$ ./wmctrl -l  
  
Bingo! client\_list\_size is 12 (3 windows x 4 byte) while sizeof(Window) is 8 instead of 4. Definitely a bug for 64-bit systems.  
Of course Debian has the patch: [http://ftp.de.debian.org/debian/pool/main/w/wmctrl/wmctrl\_1.07-7.debian.tar.gz](http://ftp.de.debian.org/debian/pool/main/w/wmctrl/wmctrl_1.07-7.debian.tar.gz)  
  

1.  Exit the nix-shell and delete the wmctrl source directory.
2.  Copy debian/patches/01\_64-bit-data.patch under ~/nixpkgs/pkgs/tools/X11/wmctrl/64-bit-data.patch.
3.  Edit ~/nixpkgs/pkgs/tools/X11/wmctrl/default and add patches = \[ ./64-bit-data.patch \]; in the derivation.
4.  Finally install the patched wmctrl with nix-env ~/nixpkgs -iA wmctrl and see that wmctrl -l now works.
5.  Commit, push to nixpkgs master, profit.
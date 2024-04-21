---
title: 'Nix pill 1: why you should give it a try'
date: 2014-07-23T07:11:00.001-07:00
draft: false
url: /2014/07/nix-pill-1-why-you-should-give-it-try.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

**Introduction**  
  
Welcome to the first post of the [Nix](http://nixos.org/nix/) in pills series. Nix is a purely functional package manager and deployment system for POSIX. There's a lot of documentation that describes what Nix, [NixOS](http://nixos.org/) and related projects are.  
The purpose of this post is to convince you to give Nix a try. Installing NixOS is not required, but sometimes I may refer to NixOS as a real world example of Nix usage for building a whole operating system.  
  
**Rationale of pills**  
  
The [Nix manual](http://nixos.org/nix/manual/), [related papers](http://nixos.org/docs/papers.html), [articles](http://www.infoq.com/articles/configuration-management-with-nix) and [wiki](https://nixos.org/wiki/Main_Page) are excellent in explaining how Nix/NixOS works, how you can use it and the amount of cools thing being done with it, however sometimes you may feel some magic happening behind the scenes hard to grasp in the beginning.  
This series aims to complement the missing explanations from the more formal documents.  
  
Follows a description of Nix. Just as pills, I'll try to be as short as possible.  
  
**Not being pure functional**  
  
Most, if not all, widely used package managers ([dpkg](https://wiki.debian.org/dpkg), [rpm](http://www.rpm.org/), ...) mutate the global state of the system. If a package foo-1.0 installs a program to /usr/bin/foo, you cannot install foo-1.1 as well, unless you change the installation paths or the binary name.  
Changing the installation paths means breaking the assumptions about the file system hierarchy.  
Changing the binary names means breaking possible users of that binary.  
  
Debian for example partially solves the problem with the [alternatives](https://wiki.debian.org/DebianAlternatives).  
  
So in theory it's possible with the current systems to install multiple versions of the same package, in practice it's very painful.  
Let's say you need an nginx service and also an nginx-openresty service. You have to create a new package that changes all the paths with e.g. an -openresty suffix.  
Or you want to run two different instances of mysql, 5.2 and 5.5. Same thing applies plus you have to also make sure the two mysqlclient libraries do not collide.  
  
This is not impossible but very inconvenient. If you want to install two whole stack of software like GNOME 3.10 and GNOME 3.12, you can imagine the amount of work.  
  
From an administrator view point: containers to the rescue. The solution nowadays is to create a container per service, especially when different versions are needed. That somehow solves the problem, but at a different level and with other drawbacks. Needing orchestration tools, setting up a shared cache of packages, and new wild machines to monitor rather than simple services.  
  
From a developer view point: virtualenv for python or jhbuild for gnome or whatelse. But then, how do you mix the two stacks? How do you avoid recompiling the same thing when it could be instead be shared? Also you need to setup your development tools to point to the different directories where libraries are installed. Not only, there's the risk that some of the software incorrectly uses system libraries.  
  
And so on. Nix solves all this at the packaging level and solves it well. A single tool to rule them all.  
  
**Being pure functional**  
Nix does no assumption about the global state of the system. This has many advantages, but also some drawbacks of course. The core of a Nix based system is the Nix store, usually installed under /nix/store, and some tools to manipulate the store. In Nix there's the notion of derivation rather than package. The difference might be subtle at the beginning, so I will often mix both of the words, ignore that.  
  
Derivations/packages are stored in the nix store as follows: /nix/store/_hash_\-_name_, where the hash uniquely identifies the derivation (not true, it's a little more complex than this), and name is the name of the derivation.  
  
Let's take the bash derivation as example: /nix/store/s4zia7hhqkin1di0f187b79sa2srhv6k-bash-4.2-p45/ . It is a directory that contains bin/bash.  
You get it, there's no /bin/bash, there's only that self-contained build output in the store. Same goes for coreutils and everything else. To make their usage convenient from the shell, nix will put those paths in PATH.  
What we have is basically a store of all packages and different versions of them, and things in the nix store are immutable.  
  
There's no ldconfig cache either. So where does bash find libc?  
```
$ ldd  \`which bash\`
libc.so.6 => /nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19/lib/libc.so.6 (0x00007f0248cce000)

```
  
Turns out that when bash was built, it used that specific version of glibc and at runtime it will require exactly that glibc version.  
Don't be doubtful about the version in the derivation name: it's only a name for us humans. You may end up having a different hash given the same derivation name.  
  
What does it all mean? You could run mysql 5.2 with glibc-2.18, and mysql 5.5 with glibc-2.19. You could use your python module with python 2.7 compiled with gcc 4.6 and the same python module with python 3 compiled with gcc 4.8, all in the same system.  
In other words, no dependency hell, not even a dependency resolution algorithm. Straight dependencies from derivations to other derivations.  
  
From an administrator view point: need an old PHP version from lenny and want to upgrade to wheezy, not painful.  
  
From a developer view point: want to develop webkit with llvm 3.4 and 3.3, not painful.  
  
**Mutable vs immutable**  
When upgrading a library, package managers replace it in-place. All new applications run afterwards with the new library without being recompiled. After all, they all refer dynamically to libc6.so.  
While being immutable with Nix, upgrading a library like glibc means recompiling all applications, because the glibc path to the nix store is being hardcoded.  
  
So how do we deal with security updates? In Nix we have some tricks (yet pure) to solve this problem, but that's another story.  
  
Another problem is that unless software has in mind a pure functional model, or it can be adapted to, it's hard to compose applications at runtime.  
Let's take for example firefox. You install flash, and you get it working because firefox looks in a global path for plugins.  
In Nix, there's no such global path for plugins. Firefox therefore must know explicitly about the path to flash. We wrap the firefox binary to setup the necessary environment to make it find flash in the nix store. That will produce a new firefox derivation: be aware it takes a few seconds, but it made composition harder at runtime.  
  
No upgrade/downgrade scripts for your data. It doesn't make sense with this approach, because there's no real derivation to be upgraded. With nix you switch to using another software with its own stack of dependencies, but there's no formal notion of upgrade or downgrade when doing so.  
Migrating to the new data format is your own responsibility.  
  
**Conclusion**  
Nix lets you compose software at build time with maximum flexibility and with builds being as reproducible as possible. Not only, due to its nature deploying systems in the cloud is so easy, consistent and reliable that in the Nix world all existing self-containment and orchestration tools are deprecated by [NixOps](http://nixos.org/nixops/). Talking about this, no comparison with other tools is fair, nix rocks.  
It however currently falls off when speaking about dynamic composition at runtime or replacing low level libraries due to massive rebuilds.  
  
That may sound scary, however after running NixOS on both a server and a laptop desktop, I'm very satisfied so far. Some of the architectural problems just need some man power, other design problems are to be solved as a community yet.  
  
Considering [Nixpkgs](https://nixos.org/nixpkgs/) ([github link](https://github.com/NixOS/nixpkgs)) is a completely new repository of all the existing software, with a completely fresh concept, and with few core developers but overall year-over-year increasing contributions, the current state is way more than acceptable and beyond the experimental stage. In other words, it's worth your investment.  
  
**Next pill...**  
...we will install Nix on top of your current system (I assume GNU/Linux, but we also have OSX users) and start inspecting the installed stuff.  
Pill 2 is available for [reading here](http://lethalman.blogspot.com/2014/07/nix-pill-2-install-on-your-running.html).  
  
To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
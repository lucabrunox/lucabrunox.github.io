---
title: 'Nix pill 2: install on your running system'
date: 2014-07-24T08:38:00.000-07:00
draft: false
url: /2014/07/nix-pill-2-install-on-your-running.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the second Nix pill. In [the first pill](http://lethalman.blogspot.it/2014/07/nix-pill-1-why-you-should-give-it-try.html) we briefly described Nix.  
Now we'll install Nix on our running system and understand what changed in our system after the installation.  
  
[Nix installation](http://nixos.org/nix/manual/#chap-installation) is as easy as installing any other package. It will not revolutionize our system, it will stay in its own place out of our way.  
  

### Download

  
You can grab the last stable tarball (nix 1.7 during this writing) or the package for your distro here: [http://hydra.nixos.org/release/nix/nix-1.7](http://hydra.nixos.org/release/nix/nix-1.7) .  
At the time you are reading, there may be nix 1.8. You can see a list of releases here: [http://hydra.nixos.org/project/nix#tabs-releases](http://hydra.nixos.org/project/nix#tabs-releases) .  
  
I prefer using the precompiled binaries, because it's a nice self-contained environment, just works and it's a little less invasive (in that it does not install anything under /etc or /usr). So in this series I will use the nix bootstrap distribution.  
In the download page above you can find binaries for linux i686, x86\_64 and darwin.  
  
Note: if you are using a rolling distribution however, I suggest not to install the package (for example on Debian sid) because you will experience broken perl dependencies when running nix tools.  
  

### **Installation**

To ensure we don't mess with the system, you could create a custom user to let him own the Nix store, let's call it "nix".  
  
As root:  
```
\# adduser nix
# mkdir -m 0755 /nix && chown nix /nix

```
From now on, all the operations we do on the shell are done from this nix user:  
```
\# su - nix
$ tar -xf nix-1.7-x86\_64-linux.tar.bz2
$ cd nix-1.7-x86\_64-linux
$ ./install
```
  
My pills are not a simple tutorial, there's are several [articles](http://nixos.org/nix/manual/#chap-package-management) [out](https://www.domenkozar.com/2014/01/02/getting-started-with-nix-package-manager/) [there](https://ocharles.org.uk/blog/posts/2014-02-04-how-i-develop-with-nixos.html) to learn the basics of nix and unix. We'll instead walk through the nix system to understand the fundamentals.  
  
First thing to note: those stuff in nix store refer to software in nix store itself. It doesn't use libc from our system or whatelse. It's a self-contained nix bootstrap.  
  
Quick note: in a normal installation, the store is owned by root and multiple users can install and build software through a nix daemon.  
  

### **So small nix store**

Start inspecting the output of the install command:  
```
copying Nix to /nix/store..........................


```
Effectively, that's right the /nix/store we were talking in the first pill. The contents is the strictly necessary software to bootstrap a Nix system. You can see bash, core utils, the toolchain, perl libraries, sqlite and nix itself with its own tools and libnix.  
You surely noticed that in /nix/store not only directories are allowed, but also files, always in the form _hash_\-_name_.  
  

### **The holy database**

Right after copying the store, the installation process initializes the database with the current information:  
```
initialising Nix database...


```
Oh Nix also has a database. It's under /nix/var/nix/db. It is an sqlite database that keeps track of the dependencies between derivations.  
The schema is very simple: there's a table of valid paths, mapping from auto increment integer to store path.  
Then there's a dependency relation from one path to other paths.  
Inspect it running /nix/store/\*sqlite\*/bin/sqlite3 /nix/var/nix/db/db.sqlite  
  
**Important rule**: never change /nix/store manually because that wouldn't be in sync with the sqlite db, unless you know what you are doing.  
  

### **The first profile**

Then we discover the [profile](http://nixos.org/nix/manual/#sec-profiles) concept during the installation:  
```
creating /home/nix/.nix-profile
installing \`nix-1.7'
building path(s) \`/nix/store/xxhdgml3rshn8mkaqxb86gp4r276sp9d-**user-environment**'
created 6 symlinks in user environment

```
A profile in nix is a general and very convenient concept for realizing rollbacks. Profiles are used to compose more components that are spread among multiple paths, under a new unified path. Not only, profiles are made up of multiple generations: they are versioned. Whenever you change a profile, a new generation is created.  
Generations thus can be switched and rollback-ed atomatically.  
  
Let's take a closer look at our profile:  
  
```
$ ls -l ~/.nix-profile/
bin -> /nix/store/clnpynyac3hx3a6z5lsy893p7b4rwnyf-**nix-1.7**/bin
\[...\]
manifest.nix -> /nix/store/82dg18wz250vvcxjbclgyy5yg2kfz1gw-**env-manifest.nix**
\[...\]
share -> /nix/store/clnpynyac3hx3a6z5lsy893p7b4rwnyf-**nix-1.7**/share

```
That nix-1.7 derivation in the nix store is nix itself, with binaries and libraries. The installation basically reproduced the hierarchy of the nix-1.7 derivation in the profile by means of symbolic links.  
The contents of this profile are special, because only one program has been installed in our profile, therefore e.g. the bin directory fully points to the only program being installed.  
  
But that's only the contents of the latest generation of our profile. In fact, ~/.nix-profile itself is a symbolic link to /nix/var/nix/profiles/default .  
In turn, that's a symlink to default-1-link in the same directory. Yes, that means it's the generation #1 of the default profile.  
Finally that's a symlink to the nix store "user-environment" derivation that you saw printed during the installation process.  
  
The manifest.nix will be meat for the next pill.  
  

### **Meet nixpkgs expressions**

More wild output from the installer:  
```
downloading Nix expressions from \`http://releases.nixos.org/nixpkgs/nixpkgs-14.10pre46060.a1a2851/nixexprs.tar.xz'...
unpacking channels...
created 2 symlinks in user environment
modifying /home/nix/.profile...

```
  

[Nix expressions](http://nixos.org/nix/manual/#chap-writing-nix-expressions) are used to describe packages and how to build them. [Nixpkgs](http://nixos.org/nixpkgs/) is the repository containing all these expressions: [https://github.com/NixOS/nixpkgs](https://github.com/NixOS/nixpkgs) .  
The installer downloaded the package descriptions from commit a1a2851.  
  
The second profile we meet is the channels profile. ~/.nix-defexpr/channels points to /nix/var/nix/profiles/per-user/nix/channels which points to channels-1-link which points to a nix store directory containing the downloaded nix expressions.  
  
Channels are a set of packages and expressions available for download. Similar to debian stable and unstable, there's a stable and unstable channel. In this installation, we're tracking [nixpkgs unstable](http://releases.nixos.org/nixpkgs/nixpkgs-14.10pre46060.a1a2851/).  
  
Don't bother yet with nix expressions.  
  
Finally, for your own convenience, it modified ~/.profile to automatically enter the nix environment. What ~/.nix-profile/etc/profile.d/nix.sh really does is simply adding ~/.nix-profile/bin to PATH and ~/.nix-defexpr/channels/nixpkgs to NIX\_PATH. We'll discuss about NIX\_PATH in another pill.  
Read nix.sh, it's short.  
  

### FAQ: Can I change /nix to something else?

  

You can, but there's a strong reason to keep using /nix instead of a different directory. All the derivations depend on other derivations by absolute path. I remind you in [pill 1](http://lethalman.blogspot.it/2014/07/nix-pill-1-why-you-should-give-it-try.html) that bash pointed to a glibc under /nix/store.  
You can see now by yourself, don't worry if you see multiple bash derivations:  
```
$ ldd /nix/store/\*bash\*/bin/bash
\[...\]

```
Keeping the store in /nix means we can grab the binary cache from nixos.org (just like you grab packages from debian mirrors) otherwise:  
  

1.  glibc would be installed under /foo/store
2.  thus bash needs to point to glibc under /foo/store
3.  the binary cache won't help, and we'd have to recompile all the stuff by ourselves

After all /nix is a cool place.  
  

### Conclusion

  

We've installed nix on our system, fully isolated and owned by the "nix" user as we're still diffident with this new system.

We learned some new concepts like profiles and channels. In particular, with profiles we're able to manage multiple generations of a composition of packages, while with channels we're able to download binaries from nixos.org .

The installation put everything under /nix, and some symlinks in the nix user home. That's because every user is able to install and use software in her own environment.

  

I hope I left nothing uncovered in a way that you think there's some kind of magic behind. It's all about putting components in the store and symlinking these components together.  
  
Also I hope the commands in this pill were consistent with your fresh nix installation.

  

### Next pill... 

  
...we will enter the nix environment and learn how to interact with the store.  
Pill 3 is available for [reading here](http://lethalman.blogspot.it/2014/07/nix-pill-3-enter-environment.html).  
  
To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
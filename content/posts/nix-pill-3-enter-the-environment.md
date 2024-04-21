---
title: 'Nix pill 3: enter the environment'
date: 2014-07-25T07:37:00.000-07:00
draft: false
url: /2014/07/nix-pill-3-enter-environment.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the third Nix pill. In the previous [second pill](http://lethalman.blogspot.it/2014/07/nix-pill-2-install-on-your-running.html) we have installed Nix on our running system. Now we can finally play with it a little, things also apply to NixOS users.  

  

### Enter the environment

  
In the previous pill we created a nix user, so let's start by switching user with su - nix. If your ~/.profile got evaluated, then you should now be able to run commands like nix-env and nix-store.  
If that's not the case:  
```
$ source ~/.nix-profile/etc/profile.d/nix.sh
```

  
I remind you, ~/.nix-profile/etc points to the nix-1.7 derivation. At this point, we are in our nix user profile.  
  
  

### Install something

  

Finally something practical! Installation in the nix environment is an interesting process. Let's install [nix-repl](https://github.com/edolstra/nix-repl), a simple command line tool for playing with the Nix language. Yes, Nix is a [pure, lazy, functional language,](http://nixos.org/nix/manual/#idm47361539226272) not only a set of tools to manage derivations.

  

Back to the installation:

```
$ nix-env -i nix-repl  
installing \`nix-repl-1.7-1734e8a'
these paths will be fetched (18.61 MiB download, 69.53 MiB unpacked):
\[...\]
building path(s) \`/nix/store/f01lfzbw7n0yzhsjd33xfj77li9raljv-**user-environment**'
created 24 symlinks in user environment

```

Now you can run nix-repl. Things to notice:

*   We did install software as user, only for the nix user.
*   It created a new user environment. That's a new generation of our nix user profile.
*   The [nix-env](http://nixos.org/nix/manual/#sec-nix-env) tool manages environments, profiles and their generations.
*   We installed nix-repl by derivation name minus the version. I repeat: we did specify the **derivation name** (minus the version) to install.

We can list generations without walking through the /nix hierarchy:

```
$ nix-env --list-generations
   1   2014-07-24 09:23:30   
   2   2014-07-25 08:45:01   (current)

```

List installed derivations:

```
$ nix-env -q
nix-1.7
nix-repl-1.7-1734e8a

```

So, where did nix-repl really got installed? which nix-repl is ~/.nix-profile/bin/nix-repl which points to the store.

We can also list the derivation paths with nix-env -q --out-path . So that's how those derivation paths are called: the **output** of a build.

  

### Path merging

  

At this point you sure have the necessity to run "man". Even if you already have man system-wide outside of the nix environment, you can install and use it within nix with nix-env -i man. As usual, a new generation will be created, and ~/.nix-profile will point to it.

Let's inspect the [profile](http://nixos.org/nix/manual/#sec-profiles) a bit:

```
$ ls -l ~/.nix-profile/
dr-xr-xr-x 2 nix nix 4096 Jan  1  1970 bin
lrwxrwxrwx 1 nix nix   55 Jan  1  1970 etc -> /nix/store/clnpynyac3hx3a6z5lsy893p7b4rwnyf-**nix-1.7**/etc
\[...\]

```

Now that's interesting. When only nix-1.7 was installed, bin/ was a symlink to nix-1.7. Now it's a real directory, no symlink.

```
$ ls -l ~/.nix-profile/bin/
\[...\]
man -> /nix/store/83cn9ing5sc6644h50dqzzfxcs07r2jn-**man-1.6g**/bin/man
\[...\]
nix-env -> /nix/store/clnpynyac3hx3a6z5lsy893p7b4rwnyf-**nix-1.7**/bin/nix-env
\[...\]
nix-repl -> /nix/store/0fcl92chxbbs8axb994rg12vxddg1ivs-**nix-repl-1.7-1734e8a**/bin/nix-repl
\[...\]

```

All clear. nix-env merged the paths from the installed derivations. which man points to the nix profile, rather than the system man, because ~/.nix-profile/bin is at the head of $PATH.

  

### Rollback / switch generation

  

The last command installed "man". We should be at generation #3, unless you changed something in the middle. Let's say we want to rollback to the old generation:

```
$ nix-env --rollback
switching from generation 3 to 2

```

Now nix-env -q does not list "man" anymore. ls -l \`which man\` should now be your system installed one.

Enough with the joke, let's go back to the last generation:

```
$ nix-env -G 3
switching from generation 2 to 3

```

I invite you to read the manpage of nix-env. nix-env requires an operation to perform, then there are common options for all operations, and there are options specific to an operation.

  

You can of course also [delete and upgrade packages](http://nixos.org/nix/manual/#idm47361539520832).

  

### Querying the store

  

So far we learned how to query and manipulate the environment. But all of the environment components point to the store.

To query and manipulate the store, there's the [nix-store](http://nixos.org/nix/manual/#sec-nix-store) command. We can do neat things, but we'll only see some queries for now.

  

Show direct runtime dependencies of nix-repl:

```
$ nix-store -q --references \`which nix-repl\`
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-**glibc-2.19**
/nix/store/8jm0wksask7cpf85miyakihyfch1y21q-**gcc-4.8.3**
/nix/store/25lg5iqy68k25hdv17yac72kcnwlh4lm-**boehm-gc-7.2d**
/nix/store/g21di262aql6xskx15z3qiw3zh3wmjlb-**nix-1.7**
/nix/store/jxs2k83npdin18ysnd104xm4sy29m8xp-**readline-6.2**

```

The argument to nix-store can be anything as long as it points to the nix store. It will follow symlinks.

It may not make sense for you right now, but let's print reverse dependencies of nix-repl:

```
$ nix-store -q --referrers \`which nix-repl\`
/nix/store/8rj57vahlndqwg4q095x5qvfa1g4rmvr-**env-manifest.nix**
/nix/store/9c8ak2h7c6vbr9kqk8i2n96bwg55br7y-**env-manifest.nix**
/nix/store/dr1y2saask2k4y2wrmxw443302pp02z2-**user-environment**
/nix/store/f01lfzbw7n0yzhsjd33xfj77li9raljv-**user-environment**

```

Did you expect it? Our environments depend upon nix-repl. Yes, the environments are in the store, and since there are symlinks to nix-repl, therefore the environment depends upon nix-repl.

It lists two environments, generation 2 and generation 3.  
  
The manifest.nix file contains metadata about the environment, such as which derivations are installed. So that nix-env can list them, upgrade or remove them. Guess what, the current manifest.nix can be found in ~/.nix-profile/manifest.nix.

  

### Closures

  

The closure of a derivation is the list of all dependencies, recursively, down to the bare minimum necessary to use that derivation.

```
$ nix-store -qR \`which man\`
\[...\]

```

  
Copying all those derivations to the nix store of another machine makes you able to run "man" out of the box on that other machine. That's the base of nix deployment, you can already foresee the potential when deploying software in the cloud (hint: nix-copy-closure and nix-store --export).

  

A nicer view of the closure:

```
$ nix-store -qR --tree \`which man\`
\[...\]

```

  
With the above command, you can know exactly why a **runtime** dependency, being it direct or indirect, has been picked for a given derivation.  
  
Same applies to environments of course. As an exercise run nix-store -qR --tree ~/.nix-profile , see that the first children are direct dependencies of the user environment: the installed derivations, and the manifest.nix.

  

### Dependency resolution

  

There isn't anything like apt which solves a SAT problem in order to satisfy dependencies with lower and upper bounds on versions. Because there's no need. A derivation X depends on derivation Y, always.

  

### Fancy disrupt

  

```
$ nix-env -e '\*'
uninstalling \`man-1.6g'
uninstalling \`nix-repl-1.7-1734e8a'
uninstalling \`nix-1.7'
\[...\]

```

  
Ops, that uninstalled all derivations from the environment, including nix. We are not able to run nix-env, what now?

Environments are a convenience for the user, but Nix is still there, in the store!

  

First pick one nix-1.7 derivation: ls /nix/store/\*nix-1.7, say /nix/store/g21di262aql6xskx15z3qiw3zh3wmjlb-**nix-1.7**.

  

The first possibility is to rollback:

```
$ /nix/store/g21di262aql6xskx15z3qiw3zh3wmjlb-**nix-1.7**/bin/nix-env --rollback

```

  
The second possibility is to install nix, thus creating a new generation:

```
$ /nix/store/g21di262aql6xskx15z3qiw3zh3wmjlb-**nix-1.7**/bin/nix-env -i /nix/store/g21di262aql6xskx15z3qiw3zh3wmjlb-**nix-1.7**

```

### **Channels**

  

So where are we getting packages from? We said something already in [pill 2](http://lethalman.blogspot.it/2014/07/nix-pill-2-install-on-your-running.html). There's a list of channels from which we get packages, usually we use a single channel. The tool to manage channels is [nix-channel](http://nixos.org/nix/manual/#sec-nix-channel).

```
$ nix-channel --list
nixpkgs http://nixos.org/channels/nixpkgs-unstable

```

  
That's basically the contents of ~/.nix-channels. Note: ~/.nix-channels is not a symlink to the nix store!

  

To update the channel run nix-channel --update . It will download the new nix expressions (descriptions of the packages), create a new generation of the channels profile and unpack under ~/.nix-defexpr/channels .

That's much similar to apt-get update.

  

### Conclusion

  

We learned how to query the user environment and to manipulate it by installing and uninstalling software. Upgrading software is as straight as it gets by reading [the manual](http://nixos.org/nix/manual/#idm47361539520832) (nix-env -u '\*' will upgrade all packages in the environment).

Everytime we change the environment, a new generation gets created. Switching between generations is easy and immediate.

  

Then we queried the store. We inspected the dependencies and reverse dependencies of store paths.

We still see symlinks to compose paths from the nix store, our lovely trick.

  

Quick analogy with programming languages. You have the heap with all the objects, that's the nix store. You have objects that point to other objects, those are the derivations. Will be this the right path?

  

### Next pill

  

...we will learn the basics of the Nix language. The Nix language is used to describe how to build derivations, and it's the base for everything else including NixOS. Therefore it's very important to understand the syntax and the semantics.  
  
Nix pill 4 is available for [reading here](http://lethalman.blogspot.it/2014/07/nix-pill-4-basics-of-language.html).  
  
To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
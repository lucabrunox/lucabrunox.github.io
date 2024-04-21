---
title: 'Nix pill 10: developing with nix-shell'
date: 2014-08-19T03:21:00.001-07:00
draft: false
url: /2014/08/nix-pill-10-developing-with-nix-shell.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the 10th Nix pill. In the previous [9th pill](http://lethalman.blogspot.it/2014/08/nix-pill-9-automatic-runtime.html) we have seen one of the powerful features of nix, automatic discovery of runtime dependencies and finalized the GNU hello world package.

  

In return from vacation, we want to hack a little the GNU hello world program. The nix-build tool creates an isolated environment for building the derivation, we want to do the same in order to modify some source files of the project.

  

### What's nix-shell

  

The [nix-shell](http://nixos.org/nix/manual/#sec-nix-shell) tool drops us in a shell by setting up the necessary environment variables to hack a derivation. It does not build the derivation, it only serves as a preparation so that we can run the build steps manually.

I remind you, in a nix environment you don't have access to libraries and programs unless you install them with nix-env. However installing libraries with nix-env is not good practice. We prefer to have isolated environments for development.

```
$ nix-shell hello.nix
\[nix-shell\]$ make
bash: make: command not found
\[nix-shell\]$ echo $baseInputs
/nix/store/jff4a6zqi0yrladx3kwy4v6844s3swpc-**gnutar-1.27.1** \[...\]

```

First thing to notice, we call nix-shell on a nix expression which returns a derivation. We then enter a new bash shell, but it's really useless. We expected to have the GNU hello world build inputs available in PATH, including GNU make, but it's not the case.  
But, we have the environment variables that we set in the derivation, like $baseInputs, $buildInputs, $src and so on.  
  
That means we can source our builder.sh, and it will build the derivation. You may get an error in the installation phase, because the user may not have the permission to write to /nix/store:

```
\[nix-shell\]$ source builder.sh
...

```

It didn't install, but it built. Things to notice:  

*   We sourced builder.sh, therefore it ran all the steps including setting up the PATH for us.
*   The working directory is no more a temp directory created by nix-build, but the current directory. Therefore, hello-2.9 has been unpacked there.

We're able to cd into hello-2.9 and type make, because now it's available.

  

In other words, nix-shell drops us in a shell with the same (or almost) environment used to run the builder!

  

### A builder for nix-shell

  
The previous steps are a bit annoying of course, but we can improve our builder to be more nix-shell friendly.  
  
First of all, we were able to source builder.sh because it was in our current directory, but that's not nice. We want the builder.sh that is stored in the nix store, the one that would be used by nix-build. To do so, the right way is to pass the usual environment variable through the derivation.  
Note: $builder is already defined, but it's the bash executable, not our builder.sh. Our builder.sh is an argument to bash.  
  
Second, we don't want to run the whole builder, we only want it to setup the necessary environment for manually building the project. So we'll write two files, one for setting up the environment, and the real builder.sh that runs with nix-build.  
  
Additionally, we'll wrap the phases in functions, it may be useful, and move the set -e to the builder instead of the setup. The set -e is annoying in nix-shell.  
  
The codebase is becoming a little long. You can find all the files in this [nixpill10 gist](https://gist.github.com/lethalman/97fae227329b442267bc).  
Noteworthy is the setup = ./setup.sh; attribute in the derivation, which adds setup.sh to the nix store and as usual, adds a $setup environment variable in the builder.  
Thanks to that, we can split builder.sh into setup.sh and builder.sh. What builder.sh does is sourcing $setup and calling the genericBuild function. Everything else is just some bash changes.  
  
Now back to nix-shell:  
```
$ nix-shell hello.nix
\[nix-shell\]$ source $setup
\[nix-shell\]$

```
Now you can run, for example, unpackPhase which unpacks $src and enters the directory. And you can run commands like ./configure, make etc. manually, or run phases with their respective functions.  
  
It's all that straight, nix-shell builds the .drv file and its input dependencies, then drops into a shell by setting up the environment variables necessary to build the .drv, in particular those passed to the derivation function.  
  

### Conclusion

  

With nix-shell we're able to drop into an isolated environment for developing a project, with the necessary dependencies just like nix-build does, except we can build and debug the project manually, step by step like you would do in any other operating system.  
Note that we did never install gcc, make, etc. system-wide. These tools and libraries are available per-build.  
  

###   
Next pill

  
...we will clean up the nix store. We wrote and built derivations, added stuff to nix store, but until now we never worried about cleaning up the used space in the store. It's time to collect some garbage.  
  
Pill 11 is available for [reading here](http://lethalman.blogspot.it/2014/08/nix-pill-11-garbage-collector.html).  
  

To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
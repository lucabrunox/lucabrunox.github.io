---
title: 'Nix pill 19: fundamentals of stdenv'
date: 2015-08-24T09:48:00.000-07:00
draft: false
url: /2015/08/nix-pill-19-fundamentals-of-stdenv.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the 19th Nix pill. In the previous [18th pill](http://lethalman.blogspot.it/2015/01/nix-pill-18-nix-store-paths.html) we did dive into the algorithm used by Nix to compute the store paths, and also introduced fixed-output store paths.  
This time we will instead look into nixpkgs, in particular one of its core derivation: **stdenv** .  
  
The stdenv is not a special derivation, but it's very important for the nixpkgs repository. It serves as base for packaging software. It is used to pull in dependencies such as the GCC toolchain, GNU make, core utilities, patch and diff utilities, and so on. Basic tools needed to compile a huge pile of software currently present in nixpkgs.  
  

What is stdenv
==============

  
First of all stdenv is a derivation. And it's a very simple one:  
```
$ nix-build '<nixpkgs>' -A stdenv
/nix/store/k4jklkcag4zq4xkqhkpy156mgfm34ipn-stdenv
$ ls -R result/
result/:
nix-support/  setup

result/nix-support:
propagated-user-env-packages 
```
It has just two files: `/setup` and `/nix-support/propagated-user-env-packages`. Don't care about the latter, it's even empty. The important file is `/setup`.  
How can this simple derivation pull in all the toolchain and basic tools needed to compile packages? Let's look at the runtime dependencies:  
```
$ nix-store -q --references result
/nix/store/3a45nb37s0ndljp68228snsqr3qsyp96-bzip2-1.0.6
/nix/store/a457ywa1haa0sgr9g7a1pgldrg3s798d-coreutils-8.24
/nix/store/zmd4jk4db5lgxb8l93mhkvr3x92g2sx2-bash-4.3-p39
/nix/store/47sfpm2qclpqvrzijizimk4md1739b1b-gcc-wrapper-4.9.3
... 
```
How can it be? The package must be referring to those package somehow. In fact, they are hardcoded in the `/setup` file:  
```
$ head result/setup
export SHELL=/nix/store/zmd4jk4db5lgxb8l93mhkvr3x92g2sx2-bash-4.3-p39/bin/bash
initialPath="/nix/store/a457ywa1haa0sgr9g7a1pgldrg3s798d-coreutils-8.24 ..."
defaultNativeBuildInputs="/nix/store/sgwq15xg00xnm435gjicspm048rqg9y6-patchelf-0.8 ..." 
```

The setup file
==============

  
Remember our generic `builder.sh` in [Pill 8](http://lethalman.blogspot.it/2014/08/nix-pill-8-generic-builders.html)? It sets up a basic PATH, unpacks the source and runs the usual autotools commands for us.  
The stdenv setup file is exactly that. It sets up several environment variables like PATH and creates some helper bash functions to build a package. I invite you to read it, it's only 860 lines at the time of this writing.  
  
The hardcoded toolchain and utilities are used to initially fill up the environment variables so that it's more pleasant to run common commands, similarly but not equal like we did with our builder with `baseInputs` and `buildInputs`.  
  
The build with stdenv works in phases. Phases are like `unpackPhase`, `configurePhase`, `buildPhase`, `checkPhase`, `installPhase`, `fixupPhase`. You can see the default list in the `genericBuild` function.  
What `genericBuild` does is just run these phases. Default phases are just bash functions, you can easily read them.  
  
Every phase has hooks to run commands before and after the phase has been executed. Phases can be overwritten, reordered, whatever, it's just bash code.  
  
How to use this file? Like our old builder. To test it, we enter a fake empty derivation, source the stdenv setup, unpack the hello sources and build it:  
```
$ nix-shell -E 'derivation { name = "fake"; builder = "fake"; system = "x86_64-linux"; }'
nix-shell$ unset PATH
nix-shell$ source /nix/store/k4jklkcag4zq4xkqhkpy156mgfm34ipn-stdenv/setup
nix-shell$ tar -xf hello-2.9.tar.gz
nix-shell$ cd hello-2.9
nix-shell$ configurePhase
...
nix-shell$ buildPhase
... 
```
_I unset `PATH` to further show that the stdenv is enough self-contained to build autotools packages that have no other dependencies._  
  
So we ran the `configurePhase` function and `buildPhase` function and they worked. These bash functions should be self-explanatory, you can read the code in the setup file.  
  

How is the setup file built
===========================

  
Very little digression for completeness. The stdenv derivation is just that setup file. That setup file is just this [setup.sh in nixpkgs](https://github.com/NixOS/nixpkgs/blob/master/pkgs/stdenv/generic/setup.sh) plus some lines on top of it, put by this [simple builder](https://github.com/NixOS/nixpkgs/blob/master/pkgs/stdenv/generic/builder.sh):  
```
...
echo "export SHELL=$shell" > $out/setup
echo "initialPath=\"$initialPath\"" >> $out/setup
echo "defaultNativeBuildInputs=\"$defaultNativeBuildInputs\"" >> $out/setup
echo "$preHook" >> $out/setup
cat "$setup" >> $out/setup
... 
```
Nothing much to say, but you can read the Nix code that pass `$initialPath` and `$defaultNativeBuildInputs`. Not much interesting to continue further in this pill.  
  

The stdenv.mkDerivation function
================================

  
Until now we worked with plain bash scripts. What about the Nix side? The nixpkgs repository offers a useful function, like we did with our old builder. It is a wrapper around the raw `derivation` function which pulls in the stdenv for us, and runs `genericBuild`. It's `stdenv.mkDerivation`.  
  
Note how `stdenv` is a derivation but it's also an attribute set which contains some other attributes, like `mkDerivation`. Nothing fancy here, just convenience.  
  
Let's write a `hello.nix` expression using this new discovered stdenv:  
```
with import <nixpkgs> {};
stdenv.mkDerivation {
  name = "hello";
  src = ./hello-2.9.tar.gz;
} 
```
Don't be scared by the `with` expression. It pulls the nixpkgs repository into scope, so we can directly use `stdenv`. It looks very similar to the hello expression in [Pill 8](http://lethalman.blogspot.it/2014/08/nix-pill-8-generic-builders.html).  
It builds, and runs fine:  
```
$ nix-build hello.nix
...
/nix/store/6flbdbpq6sc1dc79xjx01bz43zwgj3wc-hello
$ result/bin/hello
Hello, world! 
```

The stdenv.mkDerivation builder
===============================

  
Let's take a look at the builder used by `mkDerivation`. You can read the code [here in nixpkgs](https://github.com/NixOS/nixpkgs/blob/master/pkgs/stdenv/generic/default.nix#L155):  
```
{
  ...
  builder = attrs.realBuilder or shell;
  args = attrs.args or ["-e" (attrs.builder or ./default-builder.sh)];
  stdenv = result;
  ...
} 
```
Also take a look at our old derivation wrapper in previous pills! The `builder` is bash (that `shell` variable), the argument to the builder (bash) is `default-builder.sh`, and then we add the environment variable `$stdenv` in the derivation which is the `stdenv` derivation.  
  
You can open [default-builder.sh](https://github.com/NixOS/nixpkgs/blob/master/pkgs/stdenv/generic/default-builder.sh) and see what it does:  
```
source $stdenv/setup
genericBuild 
```
It's what we did in [Pill 10](http://lethalman.blogspot.it/2014/08/nix-pill-10-developing-with-nix-shell.html) to make the derivations nix-shell friendly. When entering the shell, the setup file only sets up the environment without building anything. When doing nix-build, it actually runs the build process.  
  
To get a clear understanding of the environment variables, look at the .drv of the hello derivation:  
```
$ pp-aterm -i $(nix-instantiate hello.nix)
Derive(
  [("out", "/nix/store/6flbdbpq6sc1dc79xjx01bz43zwgj3wc-hello", "", "")]
, [("/nix/store/8z4xw8a0ax1csa0l83zflsm4jw9c94w2-bash-4.3-p39.drv", ["out"]), ("/nix/store/j0905apmxw2qb4ng5j40d4ghpiwa3mi1-stdenv.drv", ["out"])]
, ["/nix/store/0q6pfasdma4as22kyaknk4kwx4h58480-hello-2.9.tar.gz", "/nix/store/9krlzvny65gdc8s7kpb6lkx8cd02c25b-default-builder.sh"]
, "x86_64-linux"
, "/nix/store/zmd4jk4db5lgxb8l93mhkvr3x92g2sx2-bash-4.3-p39**/bin/bash**"
, ["-e", "/nix/store/9krlzvny65gdc8s7kpb6lkx8cd02c25b-**default-builder.sh**"]
, [ ("buildInputs", "")
  , ("builder", "/nix/store/zmd4jk4db5lgxb8l93mhkvr3x92g2sx2-bash-4.3-p39/bin/bash")
  , ("name", "hello")
  , ("nativeBuildInputs", "")
  , ("out", "/nix/store/6flbdbpq6sc1dc79xjx01bz43zwgj3wc-hello")
  , ("propagatedBuildInputs", "")
  , ("propagatedNativeBuildInputs", "")
  , ("src", "/nix/store/0q6pfasdma4as22kyaknk4kwx4h58480-**hello-2.9.tar.gz**")
  , ("stdenv", "/nix/store/k4jklkcag4zq4xkqhkpy156mgfm34ipn-**stdenv**")
  , ("system", "x86_64-linux")
  ]
) 
```
So short I decided to paste it entirely above. The builder is bash, with `-e default-builder.sh` arguments. Then you can see the `src` and `stdenv` environment variables.  
  
Last bit, the `unpackPhase` in the setup is used to unpack the sources and enter the directory, again like we did in our old builder.  
  

Conclusion
==========

  
The stdenv is the core of the nixpkgs repository. All packages use the `stdenv.mkDerivation` wrapper instead of the raw `derivation`. It does a bunch of operations for us and also sets up a pleasant build environment.  
  
The overall process is simple:  

*   `nix-build`
*   `bash -e default-builder.sh`
*   `source $stdenv/setup`
*   `genericBuild`

That's it, everything you need to know about the stdenv phases is in the [setup file](https://github.com/NixOS/nixpkgs/blob/master/pkgs/stdenv/generic/setup.sh).  
  
Really, take your time to read that file. Don't forget that juicy docs are also available in the [nixpkgs manual](http://nixos.org/nixpkgs/manual/#chap-stdenv).  
  

Next pill...
============

  
...we will talk about how to add dependencies to our packages, `buildInputs`, `propagatedBuildInputs` and setup hooks. These three concepts are at the base of the current nixpkgs packages composition.  
  

### 

To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).

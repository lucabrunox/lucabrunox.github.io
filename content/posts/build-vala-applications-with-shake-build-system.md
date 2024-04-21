---
title: 'Build Vala applications with Shake build system'
date: 2013-04-06T14:18:00.004-07:00
draft: false
url: /2013/04/build-vala-applications-with-shake.html
tags: 
- make
- shake
- haskell
- buildsys
- development
- vala
---

I'm going to introduce you a very nice alternative to make: the [Shake build system](http://hackage.haskell.org/package/shake), by setting up a builder for your [Vala](http://live.gnome.org/Vala) application project.  
  
First of all, you need to know that Shake is a **library** written in [Haskell](http://www.haskell.org/), and it's meant to be a better replacement for make. Let's start by installing [cabal](http://www.haskell.org/cabal/) and then shake:  
```
apt-get install cabal-install
cabal update
cabal install shake

```
  
TL;DR; this is the final Build.hs file:  
```
#!/usr/bin/env runhaskell
import Development.Shake
import Development.Shake.FilePath
import Development.Shake.Sys
import Control.Applicative hiding ((\*>))

app \= "bestValaApp"
sources \= words "file1.vala file2.vala file3.vala"
packages \= words "gtk+-3.0 glib-2.0 gobject-2.0"

cc \= "cc"
valac \= "valac"
pkgconfig \= "pkg-config"

\-- derived
csources \= map (flip replaceExtension ".c") sources
cobjects \= map (flip replaceExtension ".o") csources

main \= shakeArgs shakeOptions $ do
  want \[app\]
  app \*\> \\out \-> do
    need cobjects
    pkgconfigflags <- pkgConfig $ \["--libs"\] ++ packages
    sys cc "-fPIC -o" \[out\] pkgconfigflags cobjects
  cobjects \*\*\> \\out \-> do
    let cfile \= replaceExtension out ".c"
    need \[cfile\]
    pkgconfigflags <- pkgConfig $ \["--cflags"\] ++ packages
    sys cc "-ggdb -fPIC -c -o" \[out, cfile\] pkgconfigflags
  csources \*\>> \\\_ \-> do
    let valapkgflags \= prependEach "--pkg" packages
    need sources
    sys valac "-C -g" valapkgflags sources
    
\-- utilities
prependEach x \= foldr (\\y a \-> x:y:a) \[\]
pkgConfig args \= (words . fst) <$> (systemOutput pkgconfig args)

```
  
Just tweak app, sources and packages to match your needs, chmod +x Build.hs then run ./Build.hs .  
  
**Explanation.**  
The words function splits a string by spaces to get a list of strings, e.g. \["file1.vala", "file2.vala", "file3.vala"\].  
  
The csources variable maps .vala file names to .c file names. Same goes for cobjects. It's the equivalent of $(subst .vala,.c,$(SOURCES)) you'd do with make.  
  
There it comes the main. The shakeArgs shakeOptions part will run shake with default options. Shake provides handy command line options similar to make, run ./Build.hs -h for help.  
  
The want \[app\] tells shake we want to build the app object by default. That's equivalent to the usual first make rule all: $(APP).  
  
Then we define how to build the executable app with app \*> \\out -> do. We tell shake the dependencies with need cobjects. This is similar to $(APP): $(COBJECTS) in make but not equivalent. **In shake dependencies are not static** like in many other build systems. This is one of the most interesting shake features.  
The rest is quite straightforward to understand.  
  
Then we define how to build each .o object with cobjects \*\*> \\out -> do. Here the out variable contains the actual .o required to be built, equivalent to $@ in make. Then we need \[cfile\], in order to simulate %.o: %.c like in make.  
  
One more feature shake has out-of-the-box that make doesn't is how to **generate more files from a single command**. With make you'd use a .stamp file due to valac generating several .c files out of .vala files. Then use the .stamp as dependency.  
With shake instead we consistently define how to build .c files with csources \*>> \\\_ -> do, then shake will do the rest.  
  
The shake project is very active. You can read [this tutorial](http://www.learnyouahaskell.com/) to learn Haskell basics, and the [reference docs](http://hackage.haskell.org/package/shake) of shake. The [author homepage](http://community.haskell.org/%7Endm/shake/) has links to cool presentations of the shake build system.
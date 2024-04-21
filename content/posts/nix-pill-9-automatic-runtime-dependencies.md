---
title: 'Nix pill 9: automatic runtime dependencies'
date: 2014-08-08T01:11:00.003-07:00
draft: false
url: /2014/08/nix-pill-9-automatic-runtime.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

### 

Welcome to the 9th Nix pill. In the previous [8th pill](http://lethalman.blogspot.it/2014/08/nix-pill-8-generic-builders.html) we wrote a generic builder for autotools projects. We feed build dependencies, a source tarball, and we get a Nix derivation as a result.

  

Today we stop by the GNU hello world program to analyze build and runtime dependencies, and enhance the builder in order to avoid unnecessary runtime dependencies.  
  

### Build dependencies

  

Let's start analyzing build dependencies for our GNU hello world package:

```
$ nix-instantiate hello.nix
/nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv $ nix-store -q --references /nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv /nix/store/0q6pfasdma4as22kyaknk4kwx4h58480-hello-2.9.tar.gz /nix/store/1zcs1y4n27lqs0gw4v038i303pb89rw6-coreutils-8.21.drv /nix/store/2h4b30hlfw4fhqx10wwi71mpim4wr877-gnused-4.2.2.drv /nix/store/39bgdjissw9gyi4y5j9wanf4dbjpbl07-gnutar-1.27.1.drv /nix/store/7qa70nay0if4x291rsjr7h9lfl6pl7b1-builder.sh /nix/store/g6a0shr58qvx2vi6815acgp9lnfh9yy8-gnugrep-2.14.drv /nix/store/jdggv3q1sb15140qdx0apvyrps41m4lr-bash-4.2-p45.drv /nix/store/pglhiyp1zdbmax4cglkpz98nspfgbnwr-gnumake-3.82.drv /nix/store/q9l257jn9lndbi3r9ksnvf4dr8cwxzk7-gawk-4.1.0.drv /nix/store/rgyrqxz1ilv90r01zxl0sq5nq0cq7v3v-binutils-2.23.1.drv /nix/store/qzxhby795niy6wlagfpbja27dgsz43xk-gcc-wrapper-4.8.3.drv /nix/store/sk590g7fv53m3zp0ycnxsc41snc2kdhp-gzip-1.6.drv  
```

It has exactly the derivations referenced in the derivation function, nothing more, nothing less. Some of them might not be used at all, however given that our generic mkDerivation function always pulls such dependencies (think of it like [build-essential](https://packages.debian.org/unstable/build-essential) of Debian), for every package you build from now on, you will have these packages in the nix store.

  

Why are we looking at .drv files? Because the hello.drv file is the representation of the build action to perform in order to build the hello out path, and as such it also contains the input derivations needed to be built before building hello.

  

### Digression about NAR files

  
NAR is the Nix ARchive. First question: why not tar? Why another archiver? Because commonly used archivers are not deterministic. They add padding, they do not sort files, they add timestamps, etc.. Hence NAR, a very simple deterministic archive format being used by Nix for deployment.  
NARs are also used extensively within Nix itself as we'll see below.  
  
For the rationale and implementation details you can find more in the [Dolstra's PhD Thesis](http://nixos.org/~eelco/pubs/phd-thesis.pdf).  
  
To create NAR archives, it's possible to use nix-store --dump and nix-store --restore. Those two commands work regardless of /nix/store.  
  

### Runtime dependencies

  

Something is different for runtime dependencies however. Build dependencies are automatically recognized by Nix once they are used in any derivation call, but we never specify what are the runtime dependencies for a derivation.  
  
There's really black magic involved. It's something that at first glance makes you think "no, this can't work in the long term", but at the same it works so well that a whole operating system is built on top of this magic.  
  
In other words, Nix automatically computes all the runtime dependencies of a derivation, and it's possible thanks to the hash of the store paths.  
  
Steps:  

1.  Dump the derivation as NAR, a serialization of the derivation output. Works fine whether it's a single file or a directory.
2.  For each build dependency .drv and its relative out path, search the contents of the NAR for this out path.
3.  If found, then it's a runtime dependency.

  
You get really all the runtime dependencies, and that's why Nix deployments are so easy.  
```
$ nix-instantiate hello.nix
/nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-**hello.drv**
$ nix-store -r /nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-**hello.drv**
/nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-**hello**
$ nix-store -q --references /nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-**hello**
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-**glibc-2.19**
/nix/store/8jm0wksask7cpf85miyakihyfch1y21q-**gcc-4.8.3**
/nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-**hello**

```
Ok glibc and gcc. Well, gcc really should not be a runtime dependency!  
```
$ strings result/bin/hello|grep gcc
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-**glibc-2.19**/lib:/nix/store/8jm0wksask7cpf85miyakihyfch1y21q-**gcc-4.8.3**/lib64

```
Oh Nix added gcc because its out path is mentioned in the "hello" binary. Why is that? That's the [ld rpath](http://en.wikipedia.org/wiki/Rpath). It's the list of directories where libraries can be found at runtime. In other distributions, this is usually not abused. But in Nix, we have to refer to particular versions of libraries, thus the rpath has an important role.  
  
The build process adds that gcc lib path thinking it may be useful at runtime, but really it's not. How do we get rid of it? Nix authors have written another magical tool called [patchelf](https://nixos.org/patchelf.html), which is able to reduce the rpath to the paths that are really used by the binary.  
  
Not only, even after reducing the rpath the hello binary would still depend upon gcc. Because of debugging information. For that, the well known [strip](http://unixhelp.ed.ac.uk/CGI/man-cgi?strip) can be used.  
  

### Another phase in the builder

  
We will add a new phase to our autotools builder. The builder has these phases already:  

1.  First the environment is set up
2.  Unpack phase: we unpack the sources in the current directory (remember, Nix changes dir to a temporary directory first)
3.  Change source root to the directory that has been unpacked
4.  Configure phase: ./configure
5.  Build phase: make
6.  Install phase: make install

We add a new phase after the installation phase, which we call **fixup** phase. At the end of the builder.sh follows:

```
find $out -type f -exec patchelf --shrink-rpath '{}' \\; -exec strip '{}' \\; 2>/dev/null

```
That is, for each file we run patchelf --shrink-rpath and strip. Note that we used two new commands here, find and patchelf. These two deserve a place in baseInputsof autotools.nix as findutils andpatchelf.  
  
Rebuild hello.nix and...:

```
$ nix-build hello.nix
\[...\]
$ nix-store -q --references result
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19
/nix/store/md4a3zv0ipqzsybhjb8ndjhhga1dj88x-hello

```
...only glibc is the runtime dependency. Exactly what we wanted.  
  
The package is self-contained, copy its closure on another machine and you will be able to run it. I remind you the very few components under the /nix/store necessary to run nix [when we installed it](http://lethalman.blogspot.it/2014/07/nix-pill-2-install-on-your-running.html). The hello binary will use that exact version of glibc library and interpreter, not the system one:  
```
$ ldd result/bin/hello
 linux-vdso.so.1 (0x00007fff11294000)
 libc.so.6 => /nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19/lib/libc.so.6 (0x00007f7ab7362000)
 /nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19/lib/ld-linux-x86-64.so.2 (0x00007f7ab770f000)

```
Of course, the executable runs fine as long as everything is under the /nix/store path.  

  

### Conclusion

  

Short post compared to previous ones as I'm still on vacation, but I hope you enjoyed it. Nix provides tools with cool features. In particular, Nix is able to compute all runtime dependencies automatically for us. Not only shared libraries, but also referenced executables, scripts, Python libraries etc..

  
This makes packages self-contained, because we're sure (apart data and configuration) that copying the runtime closure on another machine is sufficient to run the program. That's why Nix has [one-click install](http://nixos.org/nix/manual/#sec-one-click), or [reliable deployment in the cloud](http://nixos.org/nixops/manual/#chap-introduction). All with one tool.

###   
Next pill

  
...we will introduce nix-shell. With nix-build we build derivations always from scratch: the source gets unpacked, configured, built and installed. But this may take a long time, think of WebKit. What if we want to apply some small changes and compile incrementally instead, yet keeping a self-contained environment similar to nix-build?  
  
Pill 10 is available for [reading here](http://lethalman.blogspot.it/2014/08/nix-pill-10-developing-with-nix-shell.html).  
  

To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
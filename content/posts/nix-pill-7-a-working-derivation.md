---
title: 'Nix pill 7: a working derivation'
date: 2014-07-31T01:58:00.000-07:00
draft: false
url: /2014/07/nix-pill-7-working-derivation.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the seventh Nix pill. In the previous [sixth pill](http://lethalman.blogspot.it/2014/07/nix-pill-6-our-first-derivation.html) we introduced the notion of derivation in the Nix language. How to define a raw derivation and how to (try) to build it.  
  
In this post, we will continue along the path, by creating a derivation that successfully builds something.  

Then we try to package a real program: we compile a simple C file and create a derivation out of it, given a blessed toolchain.

  

I remind you how to enter the Nix environment: source ~/.nix-profile/etc/profile.d/nix.sh

  

### Using a script as builder

  

What's the easiest way to run a sequence of commands for building something? A bash script. We write a custom bash script, and we want it to be our builder.

Given a builder.sh, we want the derivation to run bash builder.sh.

  

We don't use hash bangs in builder.sh, because at the time we are writing builder.sh we do not know the path to bash in the nix store. Yes, even bash is in the nix store, everything is in there.

  

We don't even use /usr/bin/env, because then we lose the cool stateless property of Nix. Not to say PATH gets cleared when building therefore it wouldn't work anyway.

  

In summary: we want the builder to be bash, and pass it an argument, builder.sh . Turns out the derivation function accepts an optional args attribute that is exactly used to pass arguments to the builder executable.

  

First of all, let's write our builder.sh in the current directory:

```
declare -xp
echo foo > $out

```

Ok, let's get the hang of it. I remind you from the previous pill, Nix creates the out path (not physically, you know the path) of the derivation. In the .drv there's a list of environment variables passed to the builder. One of them is $out.

What we have to do is to create something in $out, be it a file or a directory. In this case we are creating a file.

  

In addition, we also debug the environment variables during the build process. We cannot use env, because env is part of coreutils and we don't have a dependency to it. Not yet. It's plain bash, only bash.

  

Like for coreutils in the previous pill, we get a blessed bash for free from our magic nixpkgs stuff:

```
nix-repl> :l <nixpkgs>
Added 3950 variables.
nix-repl> "${bash}"
"/nix/store/ihmkc7z2wqk3bbipfnlh0yjrlfkkgnv6-**bash-4.2-p45**"

```

  

Great, with the usual trick we can then refer to bin/bash and create our derivation:  
```
nix-repl> d = derivation { name = "foo"; builder = "${bash}/bin/bash"; args = \[ ./builder.sh \]; system = builtins.currentSystem; }
nix-repl> :b d
these derivations will be built:
  /nix/store/ybnysdh5k6cjznhg4afjgbhr6czbwb4s-**foo.drv**
building path(s) \`/nix/store/72v14vk4li47n8sx3z2ibd802ihpqyvx-**foo**'
these derivations will be built:
  /nix/store/ibwr68l3rjlx02kgz61dkkkrlpgljfxd-simple.drv
\[...\]
this derivation produced the following outputs:
  out -> /nix/store/w024zci0x1hh1wj6gjq0jagkc1sgrf5r-**foo**

```
  
What? We did it! The contents of /nix/store/w024zci0x1hh1wj6gjq0jagkc1sgrf5r-**foo** is really foo. We built our first derivation.  
  
Note: we used ./builder.sh, not "./builder.sh". This way it gets parsed as path and Nix does wonders with it as we'll see later. Try using the string version, it will say it cannot find ./builder.sh , because that would be relative to the temporary build directory.  
  

### The builder environment

  
Let's inspect those debugged environment variables during the build process.  

*   $HOME is not your home, and /homeless-shelter doesn't exist at all. We force packages to not depend upon $HOME during the build process.
*   $PATH plays the same game of $HOME
*   $NIX\_BUILD\_CORES and $NIX\_STORE are [nix configurations](http://nixos.org/nix/manual/#sec-conf-file)
*   $PWD and $TMP clearly shows nix created a temporary build directory.
*   Then builder, name, out and system are variables set due to the .drv contents.

And that's how we used the $out variable in our derivation, put stuff inside it. It's like Nix reserved a slot in the nix store for us, and we must fill it.  
  
In terms of autotools, that will be the --prefix path. Yes, not the make DESTDIR, but the --prefix. That's a big difference between Nix and other package managers. That's the essence of stateless packaging. You don't install the package in a global common path under /, you install it in a local isolated path under your nix store slot.  
  

### The .drv contents

  
We added something else this time to the derivation. The args attribute. Let's see how this changed the .drv compared to the previous pill:  
```
$ pp-aterm -i /nix/store/g6jj1mjzq68i66rbqyb3gpx3k0x606af-**foo.drv**
Derive(
  \[("out", "/nix/store/w024zci0x1hh1wj6gjq0jagkc1sgrf5r-**foo**", "", "")\]
, \[("/nix/store/jdggv3q1sb15140qdx0apvyrps41m4lr-**bash-4.2-p45.drv**", \["out"\])\]
, \["/nix/store/5d1i99yd1fy4wkyx85iz5bvh78j2j96r-**builder.sh**"\]
, "x86\_64-linux"
, "/nix/store/ihmkc7z2wqk3bbipfnlh0yjrlfkkgnv6-**bash-4.2-p45**/bin/bash"
, \["/nix/store/5d1i99yd1fy4wkyx85iz5bvh78j2j96r-**builder.sh**"\]
, \[ ("builder", "/nix/store/ihmkc7z2wqk3bbipfnlh0yjrlfkkgnv6-**bash-4.2-p45**/bin/bash")
  , ("name", "foo")
  , ("out", "/nix/store/w024zci0x1hh1wj6gjq0jagkc1sgrf5r-**foo**")
  , ("system", "x86\_64-linux")
  \]
)

```
  
Perfect, much like the usual .drv, except there's a list of arguments in there passed to the builder (bash), with the builder.sh... builder.sh... what? It's not pointing to my home's builder.sh .  
Nix automatically copies files or directories needed for the build in the nix store, to ensure, for example, that they do not get changed during the build process. Also to ensure the deployment to be stateless and independent of the building machine.  
  
Not only builder.sh is in the arguments passed to the builder, it's also in the input derivations.  
  
Being builder.sh a plain file, it has no .drv associated with it. The store path will be computed based on the hash of its contents, and the name itself. We will talk about store paths at some point, in a dedicated pill.  
  

### Packaging a simple C executable

  

Start off writing a simple.c file:

```
void main () {
  puts ("Simple!");
}

```

And its simple\_builder.sh:  
```
export PATH="$coreutils/bin:$gcc/bin"
mkdir $out
gcc -o $out/simple $src

```
Don't spend time understanding where those variables come from. Let's write the derivation and build it:  
```
nix-repl> :l <nixpkgs>
nix-repl> simple = derivation { name = "simple"; builder = "${bash}/bin/bash"; args = \[ ./simple\_builder.sh \]; gcc = gcc; coreutils = coreutils; src = ./simple.c; system = builtins.currentSystem; }
nix-repl> :b simple

```
```
this derivation produced the following outputs:
```
  out -> /nix/store/ni66p4jfqksbmsl616llx3fbs1d232d4-**simple**  
  
Perfect, now you can run /nix/store/ni66p4jfqksbmsl616llx3fbs1d232d4-**simple**/simple in your shell.  
  
**Explanation**  
  
We added two new attributes to the derivation call, gcc and coreutils. Please, don't get an headache by reading "gcc = gcc". On the left, it's the attribute name of the set. On the right, there's an expression, it's the gcc derivation. Same goes for coreutils.  
  
We also added the src attribute, nothing magic it's just a name with the ./simple.c path. Like for simple\_builder.sh, simple.c will be added to the store.  
  
The trick: every attribute in the set will be converted to a string and passed as environment variable to the builder. Now it's all clear. $coreutils and $gcc are then the out paths of the derivations, and of course appending "/bin" will point to their binaries.  
  
Same goes for the src variable, $src is the path to simple.c in the nix store. As an exercise, pretty print the .drv file. You'll see in the input derivations simple\_builder.sh and simple.c files, then bash, gcc and coreutils .drv files. Plus the new environment variables described above.  
  
In simple\_builder.sh we set the PATH for gcc and coreutils binaries, so that gcc can find the necessary binaries like "cat", "readlink", ecc. .  
Then we create $out as a directory and inside it we put the binary.  
  
Note: instead of running plain gcc (or mkdir), it would have been equivalent to run $gcc/bin/gcc (or $coreutils/bin/mkdir).  
  

### Enough with nix-repl

  
Drop out of nix-repl, write a simple.nix file:  
```
with (import <nixpkgs> {});
derivation {
  name = "simple";
  builder = "${bash}/bin/bash";
  args = \[ ./simple\_builder.sh \];
  inherit gcc coreutils;
  src = ./simple.c;
  system = builtins.currentSystem;
}

```

Now you can build it with nix-build simple.nix. It will create a symlink "result" in the current directory, pointing to the out path of the derivation.  
  
The [nix-build](http://nixos.org/nix/manual/#sec-nix-build) tool does two main jobs:  

*   [nix-instantiate](http://nixos.org/nix/manual/#sec-nix-instantiate): parse simple.nix and return the .drv file relative to the parsed derivation set
*   [nix-store -r](http://nixos.org/nix/manual/#rsec-nix-store-realise): realise the .drv, which actually builds the derivation.

Finally creates the symlink.  
  
Look the first line of the .nix file. We have an "import" function call nested in a "with" expression. I recall import accepts one argument, a nix file to parse. In this case it parsed a function out of the file.  
Afterwards we call the parsed function with the empty set. We saw this already in [nix pill 5](http://lethalman.blogspot.it/2014/07/nix-pill-5-functions-and-imports.html).  
  
Let me underline it: "import <nixpkgs> {}" are two function calls, not one. Read it like "(import <nixpkgs>) {}".  
  
The final returned value of that import is a set. To simplify it: it's a set of derivations. Using the "with" expression we drop them into the scope. We basically simulated what :l does in nix-repl, so we can easily access derivations such as bash, gcc and coreutils.  
  
Then we meet the [inherit keyword](http://nixos.org/nix/manual/#idm47361539166560). Doing inherit foo, is the same as doing foo = foo. Doing inherit foo bar, is the same as doing foo = foo; bar = bar. Literally.  
This syntax only makes sense inside sets. Don't think it's black magic, it's just a convenience to avoid repeating the same name twice, once for the attribute name, once for the variable in the scope.  
  

### Next pill

  
...we will generalize the builder. If you have noticed, we have written two builder.sh files in this post. We would like to have a generic builder script instead, especially since every builder script goes in the nix store: that's a waste.  
  
Again. **Is it really that hard to package stuff in Nix? No**, here we're studying the fundamentals of Nix.  
  
Pill 8 is available for [reading here](http://lethalman.blogspot.it/2014/08/nix-pill-8-generic-builders.html).

  
To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
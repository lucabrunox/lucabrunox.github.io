---
title: 'Nix pill 15: nix search paths'
date: 2014-09-16T02:28:00.001-07:00
draft: false
url: /2014/09/nix-pill-15-nix-search-paths.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the 15th Nix pill. In the previous [14th pill](http://lethalman.blogspot.it/2014/09/nix-pill-14-override-design-pattern.html) we have introduced the "override" pattern, useful for writing variants of derivations by passing different inputs.

  
Assuming you followed the previous posts, I hope you are now ready to understand nixpkgs. But we have to find nixpkgs in our system first! So this is the step: introducing some options and environment variables used by nix tools.  
  

### The NIX\_PATH

  
The [NIX\_PATH environment variable](http://nixos.org/nix/manual/#sec-common-env) is very important. It's very similar to the PATH environment variable. The syntax is similar, several paths are separated by a colon ":". Nix will then search for something in those paths from left to right.  
  
Who uses NIX\_PATH? The nix expressions! Yes, NIX\_PATH is not of much use by the nix tools themselves, rather it's used when writing nix expressions.  
  
In the shell for example, when you execute the command "ping", it's being searched in the PATH directories. The first one found is the one being used.  
  
In nix it's exactly the same, however the syntax is different. Instead of just typing "ping" you have to type <ping>. Yes, I know... you are already thinking of <nixpkgs>.  
However don't stop reading here, let's keep going.  
  
What's NIX\_PATH good for? Nix expressions may refer to an "abstract" path such as <nixpkgs>, and it's possible to override it from the command line.  
  
For ease we will use nix-instantiate --eval to do our tests. I remind you, [nix-instantiate](http://nixos.org/nix/manual/#sec-nix-instantiate) is used to evaluate nix expressions and generate the .drv files. Here we are not interested in building derivations, so evaluation is enough. It can be used for one-shot expressions.  
  

### Fake it a little

  
It's useless from a nix view point, but I think it's useful for your own understanding. Let's use PATH itself as NIX\_PATH, and try to locate ping (or another binary if you don't have it).  
```
$ nix-instantiate --eval -E '<ping>'
error: file \`ping' was not found in the Nix search path (add it using $NIX\_PATH or -I)
$ NIX\_PATH=$PATH nix-instantiate --eval -E '<ping>'
/bin/ping
$ nix-instantiate -I /bin --eval -E '<ping>'
/bin/ping

```

Great. At first attempt nix obviously said  could not be found anywhere in the search path. Note that the -I option accepts a single directory. Paths added with -I take precedence over NIX\_PATH.  
  
The NIX\_PATH also accepts a different yet very handy syntax: "somename=somepath". That is, instead of searching inside a directory for a name, we specify exactly the value of that name.  
```
$ NIX\_PATH="ping=/bin/ping" nix-instantiate --eval -E '<ping>'
/bin/ping
$ NIX\_PATH="ping=/bin/foo" nix-instantiate --eval -E '<ping>'
error: file \`ping' was not found in the Nix search path (add it using $NIX\_PATH or -I)

```
Note in the second case how Nix checks whether the path exists or not.  
  

### The path to repository

  
You are out of curiosity, right?  
```
$ nix-instantiate --eval -E '<nixpkgs>'
/home/nix/.nix-defexpr/channels/nixpkgs
$ echo $NIX\_PATH
nixpkgs=/home/nix/.nix-defexpr/channels/nixpkgs

```
You may have a different path, depending on how you added channels etc.. Anyway that's the whole point. The <nixpkgs> stranger that we used in our nix expressions, is referring to a path in the filesystem specified by NIX\_PATH.  
You can list that directory and realize it's simply a checkout of the [nixpkgs](https://github.com/NixOS/nixpkgs) repository at a specific commit (hint: .version-suffix).  
The NIX\_PATH variable is exported by nix.sh, and that's the reason why I always asked you to [source nix.sh](http://nixos.org/nix/manual/#idm47361539530016) at the beginning of my posts.  
  
You may wonder: then I can also specify a different nixpkgs path to, e.g., a git checkout of [nixpkgs](https://github.com/NixOS/nixpkgs)? Yes, you can and I encourage doing that. We'll talk about this in the next pill.  
  
Let's define a path for our repository, then! Let's say all the default.nix, graphviz.nix etc. are under /home/nix/mypkgs:  
```
$ export NIX\_PATH=mypkgs=/home/nix/mypkgs:$NIX\_PATH
$ nix-instantiate --eval '<mypkgs>'
{ graphviz = <code>; graphvizCore = <code>; hello = <code>; mkDerivation = <code>; }

```
As expected we got the set of our packages (well except the mkDerivation utility), that's our repository.  
  
Until now we used [nix-build](http://nixos.org/nix/manual/#sec-nix-build) directly in the directory of default.nix. However nix-build generally needs a .nix to be specified to the command line:  
```
$ nix-build /home/nix/mypkgs -A graphviz
/nix/store/dhps2c1fnsfxssdri3yxbdiqmnhzg6yr-graphviz
$ nix-build '<mypkgs>' -A graphviz
/nix/store/dhps2c1fnsfxssdri3yxbdiqmnhzg6yr-graphviz

```
Yes, nix-build also accepts paths with angular brackets. We first evaluate the whole repository (default.nix) and then peek the graphviz attribute.  
  

### A big word about nix-env

  
The [nix-env](http://nixos.org/nix/manual/#sec-nix-env) command is a little different than nix-instantiate and nix-build. Whereas nix-instantiate and nix-build require a starting nix expression, nix-env does not.  
  
You may be crippled by this concept at the beginning, you may think nix-env uses NIX\_PATH to find the nixpkgs repository. But that's not it.  
  
The nix-env command uses ~/.nix-defexpr, which is also part of NIX\_PATH by default, but that's only a coincidence. If you empty NIX\_PATH, nix-env will still be able to find derivations because of ~/.nix-defexpr.  
  
So if you run nix-env -i graphviz inside your repository, it will install the nixpkgs one. Same if you set NIX\_PATH to point to your repository.  
  
In order to specify an alternative to ~/.nix-defexpr it's possible to use the -f option:  
```
$ nix-env -f '<mypkgs>' -i graphviz
warning: there are multiple derivations named \`graphviz'; using the first one
replacing old \`graphviz'
installing \`graphviz'

```
Oh why did it say there's another derivation named graphviz? Because both graphviz and graphvizCore attributes in our repository have the name "graphviz" for the derivation:  
```
$ nix-env -f '<mypkgs>' -qaP
graphviz      graphviz
graphvizCore  graphviz
hello         hello

```
By default nix-env parses all derivations and use the derivation names to interpret the command line. So in this case "graphviz" matched two derivations. Alternatively, like for nix-build, one can use -A to specify an attribute name instead of a derivation name:  
```
$ nix-env -f '<mypkgs>' -i -A graphviz
replacing old \`graphviz'
installing \`graphviz'

```
This form, other than being more precise, it's also faster because nix-env does not have to parse all the derivations.  
  
For completeness: you may install graphvizCore with -A, since without the -A switch it's ambiguous.  
  
In summary, it may happen when playing with nix that nix-env** peeks a different derivation than nix-build.** In such case you probably specified NIX\_PATH, but nix-env is instead looking into ~/.nix-defexpr.  
  
Why is nix-env having this different behavior? I don't know specifically by myself either, but the answers could be:  

*   nix-env tries to be generic, thus it does not look for "nixpkgs" in NIX\_PATH, rather it looks in ~/.nix-defexpr.
*   nix-env is able to merge multiple trees in ~/.nix-defexpr by looking at all the possible derivations

It may also happen to you that you **cannot** **match a derivation name when installing**, because of the derivation name vs -A switch described above. Maybe nix-env wanted to be more friendly in this case for default user setups.  
  
It may or may not make sense for you, or it's like that for historical reasons, but that's how it works currently, unless somebody comes up with a better idea.  
  

### Conclusion

  
The NIX\_PATH variable is the search path used by nix when using the angular brackets syntax. It's possible to refer to "abstract" paths inside nix expressions and define the "concrete" path by means of NIX\_PATH, or the usual -I flag in nix tools.  
  
We've also explained some of the uncommon nix-env behaviors for newcomers. The nix-env tool does not use NIX\_PATH to search for packages, but rather for ~/.nix-defexpr. Beware of that!  
  
In general do not abuse NIX\_PATH, when possible use relative paths when writing your own nix expressions. Of course, in the case of <nixpkgs> in our repository, that's a perfectly fine usage of NIX\_PATH. Instead, inside our repository itself, refer to expressions with relative paths like ./hello.nix.

  
  

### Next pill

  
...we will finally dive into nixpkgs. Most of the techniques we have developed in this series are already in nixpkgs, like mkDerivation, callPackage, override, etc., but of course better. With time, those base utilities get enhanced by the community with more features in order to handle more and more use cases and in a more general way.  
  
Pill 16 is available for [reading here](http://lethalman.blogspot.it/2014/11/nix-pill-16-nixpkgs-parameters.html).  
  

To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
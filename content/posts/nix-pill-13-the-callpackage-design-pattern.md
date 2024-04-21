---
title: 'Nix pill 13: the callPackage design pattern'
date: 2014-09-04T06:01:00.001-07:00
draft: false
url: /2014/09/nix-pill-13-callpackage-design-pattern.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the 13th Nix pill. In the previous [12th pill](http://lethalman.blogspot.it/2014/08/nix-pill-12-inputs-design-pattern.html) we have introduced the first basic design pattern for organizing a repository of software. In addition we packaged graphviz to have at least another package for our little repository.

  
The next design pattern worth noting is what I'd like to call the **callPackage** pattern. This technique is extensively used in [nixpkgs](https://github.com/NixOS/nixpkgs), it's the current standard for importing packages in a repository.  
  

### The callPackage convenience

  
In the previous pill, we underlined the fact that the inputs pattern is great to decouple packages from the repository, in that we can pass manually the inputs to the derivation. The derivation declares its inputs, and the caller passes the arguments.  
However as with usual programming languages, we declare parameter names, and then we have to pass arguments. We do the job twice.  
With package management, we often see common patterns. In the case of nixpkgs it's the following.  
  
Some package derivation:  
```
{ input1, input2, ... }:
...

```
Repository derivation:  
```
rec {
  lib1 = import package1.nix { inherit input1 input2 ...; };
  program2 = import package1.nix { inherit inputX inputY lib1 ...; };
}

```
Where inputs may even be packages in the repository itself (note the [rec keyword](http://lethalman.blogspot.it/2014/07/nix-pill-4-basics-of-language.html)). The pattern here is clear, often inputs have the same name of the attributes in the repository itself. Our desire is to pass those inputs from the repository automatically, and in case be able to specify a particular argument (that is, override the automatically passed default argument).  
  
To achieve this, we will define a callPackage function with the following synopsis:  
```
{
  lib1 = callPackage package1.nix { };
  program2 = callPackage package2.nix { someoverride = overriddenDerivation; };
}

```
What should it do?  

*   Import the given expression, which in turn returns a function.
*   Determine the name of its arguments.
*   Pass default arguments from the repository set, and let us override those arguments.

  

### Implementing callPackage

  

First of all, we need a way to introspect (reflection or whatever) at runtime the argument names of a function. That's because we want to automatically pass such arguments.

  

Then callPackage requires access to the whole packages set, because it needs to find the packages to pass automatically.  
  
We start off simple with nix-repl:

```
nix-repl> add = { a ? 3, b }: a+b
nix-repl> builtins.functionArgs add
{ a = true; b = false; }

```

Nix provides a builtin function to introspect the names of the arguments of a function. In addition, for each argument, it tells whether the argument has a default value or not. We don't really care about default values in our case. We are only interested in the argument names.  
  
Now we need a set with all the values, let's call it values.  And a way to intersect the attributes of values with the function arguments:  
```
nix-repl> values = { a = 3; b = 5; c = 10; }
nix-repl> builtins.intersectAttrs values (builtins.functionArgs add)
{ a = true; b = false; }
nix-repl> builtins.intersectAttrs (builtins.functionArgs add) values
{ a = 3; b = 5; }

```
Perfect, note from the example above that the intersectAttrs returns a set whose names are the intersection, and the attribute values are taken from the second set.  
  
We're done, we have a way to get argument names from a function, and match with an existing set of attributes. This is our simple implementation of callPackage:  
```
nix-repl> callPackage = set: f: f (builtins.intersectAttrs (builtins.functionArgs f) set)
nix-repl> callPackage values add
8
nix-repl> with values; add { inherit a b; }
8

```
Clearing up the syntax:  

*   We define a callPackage variable which is a function.
*   First it accepts a set, and it returns another function accepting another parameter. In other words, let's simplify by saying it accepts two parameters.
*   The second parameter is the function to "autocall".
*   We take the argument names of the function and intersect with the set of all values.
*   Finally we call the passed function f with the resulting intersection.

In the code above, I've also shown that the callPackage call is equivalent to directly calling add a b.  
  
We achieved what we wanted. **Automatically call functions given a set of possible arguments**. If an argument is not found in the set, that's nothing special. It's a function call with a missing parameter, and that's an error (unless the function has varargs ... as explained in the [5th pill](http://lethalman.blogspot.it/2014/07/nix-pill-5-functions-and-imports.html)).  
  
Or not. We missed something. Being able to override some of the parameters. We may not want to always call functions with values taken from the big set.  
Then we add a further parameter, which takes a set of overrides:  
```
nix-repl> callPackage = set: f: overrides: f ((builtins.intersectAttrs (builtins.functionArgs f) set) // overrides)
nix-repl> callPackage values add { }
8
nix-repl> callPackage values add { b = 12; }
15

```
Apart from the increasing number of parenthesis, it should be clear that we simply do a set union between the default arguments, and the overriding set.  
  
  

### Use callPackage to simplify the repository

  
Given our brand new tool, we can simplify the repository expression (default.nix).  
Let me write it down first:  
```
let
  nixpkgs = import <nixpkgs> {};
  allPkgs = nixpkgs // pkgs;
  callPackage = path: overrides:
    let f = import path;
    in f ((builtins.intersectAttrs (builtins.functionArgs f) allPkgs) // overrides);
  pkgs = with nixpkgs; {
    mkDerivation = import ./autotools.nix nixpkgs;
    hello = callPackage ./hello.nix { };
    graphviz = callPackage ./graphviz.nix { };
    graphvizCore = callPackage ./graphviz.nix { gdSupport = false; };
  };
in pkgs

```

Wow, there's a lot to say here:  

*   We renamed the old pkgs of the previous pill to nixpkgs. Our package set is now instead named pkgs. Sorry for the confusion.
*   We needed a way to pass pkgs to callPackage somehow. Instead of returning the set of packages directly from default.nix, we first assign it to a let variable and reuse it in callPackage.
*   For convenience, in callPackage we first import the file, instead of calling it directly. Otherwise for each package we would have to write the import.
*   Since our expressions use packages from nixpkgs, in callPackage we use allPkgs, which is the union of nixpkgs and our packages.
*   We moved mkDerivation in pkgs itself, so that it gets also passed automatically.

Note how easy is to override arguments in the case of graphviz without gd. But most importantly, how easy it was to merge two repositories: nixpkgs and our pkgs!  
  
The reader should notice a magic thing happening. We're defining pkgs in terms of callPackage, and callPackage in terms of pkgs. That magic is possible thanks to lazy evaluation. 

  

### Conclusion

  

The "callPackage" pattern has simplified a lot our repository. We're able to import packages that require some named arguments and call them automatically, given the set of all packages.  
  
We've also introduced some useful builtin functions that allows us to introspect Nix functions and manipulate attributes. These builtin functions are not usually used when packaging software, rather to provide tools for packaging. That's why they are not documented in the [nix manual](http://nixos.org/nix/manual/).  
  
Writing a repository in nix is an evolution of writing convenient functions for combining the packages. This demonstrates even more how nix is a generic tool to build and deploy something, and how suitable it is to create software repositories with your own conventions.  
  

### Next pill

  
...we will talk about the "override" design pattern. The graphvizCore seems straightforward. It _starts from graphviz.nix_ and builds it without gd. Now I want to give you another point of view: what if we instead wanted to _start from pkgs.graphviz_ and disable gd?  
  
Pill 14 is available for [reading here](http://lethalman.blogspot.it/2014/09/nix-pill-14-override-design-pattern.html).  
  

To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
---
title: 'Developing in golang with Nix package manager'
date: 2015-02-08T03:33:00.001-08:00
draft: false
url: /2015/02/developing-in-golang-with-nix-package.html
tags: 
- golang
- nixpkgs
- nix
- nixos
---

I've been using Go since several months. It's a pleasant language, even though it has its own drawbacks.  
  
In our [Nixpkgs repository](https://github.com/NixOS/nixpkgs) we have support for several programming languages: perl, python, ruby, haskell, lua, ... We've [merged](https://github.com/NixOS/nixpkgs/pull/6119) a better support for Go.  
  
What kind of support are we talking about? In [Nix](http://nixos.org/nix/), you **never install libraries**. Instead, you define an environment in which to use a certain library compiled for a certain version of the language. The library will be available only within this environment.  
  
Think of it like virtualenv for python, except for any language, and also being able to mix them.  
On the other hand Nix requires the src url and the checksum of every dependency of your project. So before starting, make sure you are willing to write nix packages that are not currently present in nixpkgs.  
  
Also you probably have to wait a couple of days before this PR will be available in the unstable channel, at the time of this writing (otherwise `git clone https://github.com/NixOS/nixpkgs.git`).  
  

Using nix-shell -p
------------------

First a quick example using `nix-shell -p` for your own project:  
```
$ nix-shell '<nixpkgs>' -p goPackages.go goPackages.net goPackages.osext
[nix-shell]$ echo $GOPATH
/nix/store/kw9dryid364ac038zmbzq72bnh3zsinz-go-1.4.1-go.net-3338d5f109e9/share/go:... 
```
That's how nix mostly works, it's as simple as that. The `GOPATH` is set for every package that provides a directory `share/go`.  
  
What is `goPackages`? Currently it's `go14Packages`, which is all the go packages we have, compiled with go 1.4. There's also `go13Packages`, you know some particular packages don't work with go 1.4 yet.  
  

Writing a nix file
------------------

A more structured example by writing a `default.nix` file in your project:  
```
with import <nixpkgs> {}; with goPackages;

buildGoPackage rec {
  name = "yourproject";
  buildInputs = [ net osext ];
  goPackagePath = "github.com/you/yourproject";
} 
```
Then you can just run `nix-shell` in your project directory and have your dev environment ready to compile your code.  
The `goPackagePath` is something needed by `buildGoPackage`, in case you are going to run `nix-build`. Ignore it for now.  
  

Writing a dependency
--------------------

But nixpkgs doesn't have listed all the possible go projects. What if you need to use a particular library?  
Let's take for example `github.com/kr/pty`. Write something like this in a pty.nix file:  
```
{ goPackages, fetchFromGitHub }:

goPackages.buildGoPackage rec {
  rev = "67e2db24c831afa6c64fc17b4a143390674365ef";
  name = "pty-${rev}";
  goPackagePath = "github.com/kr/pty";
  src = fetchFromGitHub {
    inherit rev;
    owner = "kr";
    repo = "pty";
    sha256 = "1l3z3wbb112ar9br44m8g838z0pq2gfxcp5s3ka0xvm1hjvanw2d";
  };
} 
```
Then in your default.nix:  
```
with import <nixpkgs> {}; with goPackages;

let
  pty = callPackage ./pty.nix {};
in
buildGoPackage rec {
  name = "yourproject";
  buildInputs = [ net osext pty ];
  goPackagePath = "github.com/you/yourproject";
} 
```
Type `nix-shell` and now you will also have pty in your dev environment.  
So as you can see, for each go package nix requires a name, the go path, where to fetch the sources, and the hash.  
  
_You may be wondering how do you get the sha256: a dirty trick is to write a wrong sha, then nix will tell you the correct sha._  

Conclusion and references
-------------------------

Nix looks a little complex and boring due to writing a package for each dependency. On the other hand you get for free:  

*   Exact build and runtime dependencies
*   Sharing build and runtime dependencies between multiple projects
*   Easily test newer or older versions of libraries, without messing with system-wide installations
*   Mix with other programming languages, using a similar approach
*   Packages using C libraries don't need to be compiled manually by you: define the nix package once, reuse everywhere

For installing nix, follow [the manual](http://nixos.org/nix/manual/#chap-quick-start). Make sure you read the entire document to learn the nix syntax.  
  
For more examples on how to write dependencies, you can look at nixpkgs [goPackages itself](https://github.com/NixOS/nixpkgs/blob/master/pkgs/top-level/go-packages.nix).  
  
Drop by #nixos on [irc.freenode.net](http://webchat.freenode.net/) for any doubts.
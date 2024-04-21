---
title: 'Nix pill 4: the basics of the language'
date: 2014-07-26T10:52:00.000-07:00
draft: false
url: /2014/07/nix-pill-4-basics-of-language.html
tags: 
- nixpkgs
- nix
- nixpills
- nixos
---

Welcome to the fourth Nix pill. In the previous [third pill](http://lethalman.blogspot.it/2014/07/nix-pill-3-enter-environment.html) we entered the Nix environment. We installed software as user, managed the profile, switched between generations, and queried the nix store. That's the very basics of nix administration somehow.  
  
The [Nix language](http://nixos.org/nix/manual/#chap-writing-nix-expressions) is used to write derivations. The [nix-build](http://nixos.org/nix/manual/#sec-nix-build) tool is used to build derivations. Even as a system administrator that wants to customize the installation, it's necessary to master Nix. Using Nix for your jobs means you get the features we saw in the previous pills for free.  
  
The syntax is very uncommon thus looking at existing examples may lead to thinking that there's a lot of magic behind. In reality, it's only about writing utility functions for making things convenient.  
On the other hand, this same syntax is great for describing packages.  
  
Important: in Nix, everything is an expression, there are no statements. This is common to many functional languages.  
Important: values in Nix are immutable.  
  

### Value types

  

We've installed nix-repl in the previous pill. If you didn't, nix-env -i nix-repl. The nix-repl syntax is slightly different than nix syntax when it comes to assigning variables, but no worries.  I prefer playing with nix-repl with you before cluttering your mind with more complex expressions.

  

Launch nix-repl. First of all, nix supports basic arithmetic operations: +, -, and \*. The integer division can be done with builtins.div.

```
nix-repl> 1+3
4
nix-repl> builtins.div 6 3
2

```
Really, why doesn't nix have basic operations such as division? Because it's not needed for creating packages. Nix is not a general purpose language, it's a domain-specific language for writing packages.  

Just think that builtins.div is not being used in the whole of our [nixpkgs repository](https://github.com/NixOS/nixpkgs/): it's useless.

  

Other operators are ||, && and ! for booleans, and relational operators such as !=, ==, <, >, <=, >=. In Nix, <, >, <= and >= are not much used. There are also [other operators](http://nixos.org/nix/manual/#table-operators) we will see in the course of this series.

  

Nix has integer (not floating point), string, path, boolean and null [simple types](http://nixos.org/nix/manual/#ssec-values). Then there are lists, sets and functions. These types are enough to build an operating system.

  

Nix is strongly typed, but it's not statically typed. That is, you cannot mix strings and integers, you must first do the conversion. 

  

Try to use / between two numbers:

```
nix-repl> 2/3
/home/nix/2/3

```

Nix parsed 2/3 as a relative path to the current directory. Paths are parsed as long as there's a slash. Therefore to specify the current directory, use ./.

In addition, Nix also parses urls.

  

Not all urls or paths can be parsed this way. If a syntax error occurs, it's still possible to fallback to plain strings. Parsing urls and paths are convenient for additional safety.

  

  

### Identifiers

  

Not much to say, except that dash (-) is allowed in identifiers. That's convenient since many packages use dash in its name. In fact:

```
nix-repl> a-b
error: undefined variable \`a-b' at (string):1:1
nix-repl> a - b
error: undefined variable \`a' at (string):1:1

```

As you can see, a-b is parsed as identifier, not as operation between a and b.

  

### Strings

  

It's important to understand the syntax for strings. When reading Nix expressions at the beginning, you may find dollars ($) ambiguous in their usage.

Strings are enclosed by double quotes ("), or two single quotes ('').

```
nix-repl> "foo"
"foo"
nix-repl> ''foo''
"foo"

```

In python you can use also single quotes for strings like 'foo', but not in Nix.

  

It's possible to [interpolate](http://nixos.org/nix/manual/#ssec-values) whole Nix expressions inside strings with ${...} and only with ${...}, not $foo or {$foo} or anything else.

```
nix-repl> foo = "strval"
nix-repl> "$foo"
"$foo"
nix-repl> "${foo}"
"strval"
nix-repl> "${2+3}"
error: cannot coerce an integer to a string, at (string):1:2

```

Note: ignore the foo = "strval" assignment, it's nix-repl special syntax.

  

As said previously, you cannot mix integers and strings. You explicitly need conversion. We'll see this later: function calls are another story.

  

Using the syntax with two single quotes, it's useful for writing double quotes inside strings instead of escaping:

```
nix-repl> ''test " test''
"test \\" test"
nix-repl> ''${foo}''
"strval"

```

Escaping ${...} within double quoted strings is done with the backslash. Within two single quotes, it's done with '':

```
nix-repl> "\\${foo}"
"${foo}"
nix-repl> ''test ''${foo} test''
"test ${foo} test"

```

No other magic about strings for now.  
  

### Lists

  

Lists are a sequence of expressions delimited by space (not comma):

```
nix-repl> \[ 2 "foo" true (2+3) \]
\[ 2 "foo" true 5 \]

```

Lists, like anything else in Nix, are immutable. Adding or removing elements from a list is possible, but will return a new list.

  

### Sets

  

Sets are an association between a string key and a Nix expression. Keys can only be strings. When writing sets you can also use identifiers as keys.

```
nix-repl> s = { foo = "bar"; a-b = "baz"; "123" = "num"; }
nix-repl> s
{ 123 = "num"; a-b = "baz"; foo = "bar"; }

```

Note: here the string representation from nix is wrong, you can't write { 123 = "num"; } because 123 is not an identifier.

You need semicomma (;) after every key-value assignment.

  

For those reading Nix expressions from nixpkgs: do not confuse sets with argument sets used in functions.

  

To access elements in the set:

```
nix-repl> s.a-b
"baz"
nix-repl> s."123"
"num"

```

Yes, you can use strings for non-identifiers to address keys in the set.

  

You cannot refer inside a set to elements of the same set:

```
nix-repl> { a = 3; b = a+4; }
error: undefined variable \`a' at (string):1:10

```

To do so, use [recursive sets](http://nixos.org/nix/manual/#idm47361539166560):

```
nix-repl> rec { a= 3; b = a+4; }
{ a = 3; b = 7; }

```

This will be very convenient when defining packages.

  

### If expression

  

Expressions, not statements.

```
nix-repl> a = 3
nix-repl> b = 4
nix-repl> if a > b then "yes" else "no"
"no"

```

You can't have only the "then" branch, you must specify also the "else" branch, because an expression must have a value in all cases.

  

  

### Let expression

  

This kind of expression is used to define local variables to inner expressions.

```
nix-repl> let a = "foo"; in a
"foo"

```

The syntax is: first assign variables, then "in" expression. The overall result will be the final expression after "in".

```
nix-repl> let a = 3; b = 4; in a + b
7

```

Let's write two let expressions, one inside the other:

```
nix-repl> let a = 3; in let b = 4; in a + b
7

```

With let you cannot assign twice to the same variable. You can however shadow outer variables:

```
nix-repl> let a = 3; a = 8; in a
error: attribute \`a' at (string):1:12 already defined at (string):1:5
nix-repl> let a = 3; in let a = 8; in a
8

```

You cannot refer to variables in a let expression outside of it:

```
nix-repl> let a = (let b = 3; in b); in b
error: undefined variable \`b' at (string):1:31

```

You can refer to variables in the let expression when assigning variables like with recursive sets:

```
nix-repl> let a = 4; b = a + 5; in b
9

```

So beware when you want to refer to a variable from the outer scope, but it's being defined in the current let expression. Same applies to recursive sets.

  

### With expression

  

This kind of expression is something you hardly see in other languages. Think of it like a more granular "using" of C++, or "from module import \*" from Python. You decide per-expression when to include symbols into the scope.

```
nix-repl> longName = { a = 3; b = 4; }
nix-repl> longName.a + longName.b
7
nix-repl> with longName; a + b
7

```

That's it, it takes a set and includes symbols in the scope of the inner expression. Of course, only valid identifiers from the set keys will be included.

If a symbol exists in the outer scope and also in the "with" scope, it will **not** be shadowed. You can however still refer to the set:

```
nix-repl> let a = 10; in with longName; a + b
14
nix-repl> let a = 10; in with longName; longName.a + b
7

```

### Laziness

  

Nix evaluates expression only [when needed](http://en.wikipedia.org/wiki/Lazy_evaluation). This is a great feature when working with packages.

```
nix-repl> let a = builtins.div 4 0; b = 6; in b
6

```

Since "a" is not needed, there's no error about division by zero, because the expression is not in need to be evaluated.

That's why we can have all the packages [defined here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/top-level/all-packages.nix), yet access to specific packages very fast.

  

### Next pill

  

...we will talk about functions and imports. In this pill I've tried to avoid function calls as much as possible, otherwise the post would have been too long.  
  
Nix pill 5 is available for [reading here](http://lethalman.blogspot.it/2014/07/nix-pill-5-functions-and-imports.html).  
  
To be notified about the new pill, stay tuned on [#NixPills](https://twitter.com/search?src=typd&q=%23NixPills), follow [@lethalman](https://twitter.com/lethalman) or subscribe to the [nixpills rss](http://lethalman.blogspot.com/feeds/posts/default/-/nixpills).
---
title: 'Regex in Haskell patterns'
date: 2013-09-06T16:03:00.001-07:00
draft: false
url: /2013/09/regex-in-haskell-patterns.html
tags: 
- regex
- haskell
---

Have you ever wanted to do case expr **of** regexhere **\->** ... ?  
You can do almost that with view patterns!  
  

{-# LANGUAGE ViewPatterns #-}  
  
import Text.Regex.Posix  
  
\-- Helper  
pat :: [String](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:String) \-> [String](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:String) \-> \[\[[String](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:String)\]\]  
pat p s \= s \=~ p  
  
\-- Function with matching  
foo :: [String](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:String) \-> [String](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:String)  
foo (pat "foo(bar|baz)" \-> \[\[\_,x\]\]) \= x  
foo \_ \= "no!"  
  
main :: [IO](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#t:IO) ()  
main \= do  
  [print](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#v:print) $ foo "foobar"  
  [print](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#v:print) $ foo "foobaz"  
  [print](http://haskell.org/ghc/docs/latest/html/libraries/base/Prelude.html#v:print) $ foo "yes?"

  
The above code will print barbazno! . Have fun!
---
title: 'Lua for Pythoners - Lists'
date: 2009-12-13T05:58:00.001-08:00
draft: false
url: /2009/12/lua-for-pythoners-lists.html
tags: 
- comparison
- languages
- python
- lua
---

Hello,  
lately I'm discovering [Lua](http://www.lua.org) as general purpose language. Many people don't agree with lua being used as a general purpose language, many others (including a newbie like me) think Lua has such a simple syntax and powerful tables to become a full fledged language.  
I use a lot of Python, so I start from here: what Python does that Lua can't do almost in the same way? Read the question as it is, don't read "what Python does that Lua can't do", it's different.  
  
This is the first of several post series I'm writing. I'm trying to "translate" [python pills](http://www.java2s.com/Code/Python/CatalogPython.htm) in Lua + [Penlight](http://penlight.luaforge.net)  
  
Please consider that many things can be done really better in Lua. As I said, this is a kind of "translation". You will understand that Lua does better than Python in other things that will not be shown because the examples are made in Python.  
  
[Here's the snippet](http://www.refactory.org/s/lua_for_pythoners_lists/view/2), you can run it with a stand-alone Lua interpreter.  
  
If you know better ways of doing things like in Python please comment. Comments like 'Hey, it's inefficient! This is not the way you do things in Lua' are accepted of course but not related to the post.  
  
Errata:  
I've had some important feedback thanks to #lua people in IRC:  
\- Variables in Lua are globally assigned, so at least in functions you must use local  
\- Using table.insert in loops is slow, better use tbl\[#tbl+1\] assignment, and even better remember the next free position tbl\[next\] = element; next = next + 1
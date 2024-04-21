---
title: 'Speeding up zsh completion'
date: 2009-10-07T14:23:00.001-07:00
draft: false
url: /2009/10/speeding-up-zsh-completion.html
tags: 
- zsh
- completion
- performance
---

Hello,

since I've started using [zsh](http://www.zsh.org/), a great shell with great out of the box completion, one of the most boring issues was having a really slow completion. I can understand it could be slow to get a list of packages, remote files or command line options, but also paths were often slow to be completed. After lots of searches I've ended up in adding this magic line to my ~/.zshrc:

> zstyle ':completion:\*' accept-exact '\*(N)'

This way you tell zsh comp to take the first part of the path to be exact, and to avoid partial globs. Now path completions became nearly immediate.

  

Another important speed up is using the cache for packages and other stuff:

> zstyle ':completion:\*' use-cache on
> 
> zstyle ':completion:\*' cache-path ~/.zsh/cache

If you know how to boost up options/remote files, please share :)
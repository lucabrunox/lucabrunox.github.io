---
title: 'Complete variables with cd command in bash'
date: 2011-05-27T05:51:00.000-07:00
draft: false
url: /2011/05/complete-variables-with-cd-command-in.html
tags: 
- completion
- bash
- debian
---

Hello,  
lately I've been searching for a way to complete variables containing directories with the "cd" command in bash. This is very helpful if you have something like "cd $mydir/". This is [not actually working in debian](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=628123) bash-completion.  
Then I've realized that other commands such as "ls" actually expand variables. I looked for some "complete" combo used for "ls" but not for "cd" in /etc/bash\_completion and I came out with the following:  
  

> complete -F \_longopt -o default cd

  
Luckily, this is exactly the command needed to enable variable expansion with the "cd" command. Put that in your .bashrc after loading bash\_completion and you're done.
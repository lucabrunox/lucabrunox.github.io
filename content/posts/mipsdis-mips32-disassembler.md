---
title: 'Mipsdis MIPS32 disassembler'
date: 2010-07-29T02:28:00.001-07:00
draft: false
url: /2010/07/mipsdis-mips32-disassembler.html
tags: 
- mips
- mipsdis
- reverse engineering
- vala
---

Hello,  
I've written a MIPS32 (Release 2) disassembler for ELF files. It is not a simple disassembler, it's mostly made for reverse engineering proprietary boxes for educational purposes. It has been successfully tested on Vodafone Station which has Broadcom binaries. These boxes don't have a sections table, therefore normal disassemblers don't work. Mipsdis instead will guess the bounds of those sections (most important ones are TEXT and RODATA for strings).  
  
This console program outputs a friendly assembly code, whose each instruction is commented (comments copied directly from the mips specification). It also features labels for branches and symbol resolution for strings, global variables and functions.  
  
More information and downloads [here](http://lethalman.hostei.com/mipsdis.html).
---
title: 'Writing binary files with bash'
date: 2011-06-02T03:04:00.001-07:00
draft: false
url: /2011/06/writing-binary-files-with-bash.html
tags: 
- audio
- wav
- bash
- development
---

Hello,  
I'm trying to see if I'm able to write some binary file using bash. So, when writing a binary file you often want to write a number into binary format. I ended up with this simple function for writing numbers in little endian:  
  
```
function num2bin() {  
   printf $(printf %.$(($2\*2))x\\\\n $1|  
        sed 's/\\(\[0-9a-f\]\[0-9a-f\]\\)/\\\\x\\1/g')|  
        awk -F '' '{ printf $4$3$2$1 }'  
}
```
  
  
The first parameter is the number to write, the second is the number of bytes (up to 4). For example "num2bin 40 4" will output a 4-byte long string containing the number 40 in little endian.  
  
How do we use it? I wrote an example script for creating a wav file with noise (according to [wav specifications](http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html)) that you can [read here](http://www.refactory.org/s/writing_wav_files_with_bash/view/latest).  
  
Let me know if you have a simpler version of the num2bin function.
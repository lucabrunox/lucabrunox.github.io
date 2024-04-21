---
title: 'JMF and MPEG'
date: 2009-02-24T14:11:00.000-08:00
draft: false
url: /2009/02/jmf-and-mpeg.html
tags: 
- media
- development
- java
---

Hello,  
I'm recently writing a game with Java AWT/Swing/SwingX/JMF for a university exam.  
If you are using the Java Media Framework and most of the formats (all the well known and used formats) can't be handled by the library here's your definitive solution to the problem.  
You will usually get "Unable to handle format: MPEG" or something like that.  
  
How do you get rid of that and make things work? There's a great plugin named [jffmpeg](http://jffmpeg.sourceforge.net/) which handles a huge number of audio and video formats (including ogg/vob).  
Just follow the instructions on the project website to install the plugins.  
  
Alternatively you can register only the codec and demux you use from within your application code as follows (e.g. only handle MPEG video format on input):  
  
`Format[] inFormats = { new VideoFormat ("MPEG") };  
  
PlugInManager.addPlugIn ("net.sourceforge.jffmpeg.VideoDecoder", inFormats, null, PlugInManager.CODEC);  
  
PlugInManager.commit ();`
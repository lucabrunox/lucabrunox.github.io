---
title: 'Base64 and Quoted-Printable GConverters for GMua'
date: 2011-01-14T23:55:00.000-08:00
draft: false
url: /2011/01/base64-and-quoted-printable-gconverters.html
tags: 
- gio
- decrew
- gmua
- mail
- mutt
- development
- vala
---

Hello,

lately I'm writing [GMua](http://gitorious.org/decrew/gmua/) for educational purposes and for evaluating [Vala](http://live.gnome.org/Vala), whose purpose is to simplify writing Mail User Agents or simple scripts, ala [Java Mail](http://www.oracle.com/technetwork/java/index-jsp-139225.html).

It currently parses IMAP (not yet complete) and has a graphical interface called Gutt (yes, inspired by Mutt) for testing.

In order to parse MIME parts with base64 or quopri content-transfer-encoding I chose to implement a couple of [GConverter](http://library.gnome.org/devel/gio/unstable/GConverter.html#GConverter-struct) (will use GMime a day, maybe when they switch to gio, not yet needed) in Vala that you can find here:

*   [Base64 GConverter](http://gitorious.org/decrew/gmua/blobs/master/gmua/base64.vala)
*   [Quoted-Printable GConverter](http://gitorious.org/decrew/gmua/blobs/master/gmua/quopri.vala)

I'm pretty sure there are bugs in these converters, by the way I wanted to share them :)
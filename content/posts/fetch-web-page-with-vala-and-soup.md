---
title: 'Fetch web page with Vala and Soup'
date: 2010-01-24T03:04:00.000-08:00
draft: false
url: /2010/01/fetch-web-page-with-vala-and-soup.html
tags: 
- soup
- vala
---

Hello,

I'm lately using the [Vala](http://live.gnome.org/Vala) language widely. I find it a great and well designed language.

You may know I'm the maintainer of [Freespeak](http://freespeak.berlios.de/). This program is written in Python. Now I'm rewriting it in Vala, both for providing a good and really simple API in C and for learning Vala.

  

I will now paste a snippet from the new freespeak code that I use for creating a cancellable asyncronous operation for fetching a web page using libsoup either with a GET or a POST method.

  

Here's the [snippet at refactory](http://www.refactory.org/s/fetch_web_pages_with_vala_and_soup/view/3).
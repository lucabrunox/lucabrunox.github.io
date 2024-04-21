---
title: 'Render tables with pangocairo like reportlab'
date: 2009-05-27T14:22:00.000-07:00
draft: false
url: /2009/05/render-tables-with-pangocairo-like.html
tags: 
- gnome
- pango
- cairo
- pdf
---

Hello,  
lately I was wondering if there was any alternative to the well known [reportlab](http://www.reportlab.org/) python software for creating PDF reports. I immediately thought about [Cairo](http://cairographics.org/). The only two problems are:  

*   Cairo doesn't create multiple pages
*   No support for creating tables containing text, necessary for table-based reports

I still can't realize how to achieve the first feature, but the second one could be solved using [Pango](http://www.pango.org/) layouts.

The idea is to create the cells of the table using such layouts, so that the text get wrapped etc.

  

Here's the [Pango tables code snippet](https://developer.berlios.de/snippet/detail.php?type=snippet&id=100049) containing the necessary classes for achieving the job. Notice that the methods in the snippet often make use of Pango units instead of pixels.

Now let's use the Table class as follows: **create a table with two rows and two columns, then show it twice with different background colors**.

  

`surface = cairo.PDFSurface ("test.pdf", 300, 400)  
cr = cairo.Context (surface)  
cr = pangocairo.CairoContext (cairo.Context (surface))  
  
sizes = [pango.SCALE*12*10, pango.SCALE*12*10]  
data = [["first test with pango tables", "seems to work correctly"],  
["though it needs", "support for borders and spans"]]  
  
table = Table (cr, sizes, data, pango.FontDescription ("Sans 12"))  
cr.rectangle (0, 0, pango.PIXELS(table.get_width ()), pango.PIXELS(table.get_height()))  
cr.set_source_rgb (0.8, 0.8, 0.8)  
cr.fill ()  
cr.set_source_rgb (0, 0, 0)  
table.show_table (cr)  
  
cr.translate (0, 200)  
cr.rectangle (0, 0, pango.PIXELS(table.get_width ()), pango.PIXELS(table.get_height()))  
cr.set_source_rgb (0.4, 0.5, 0.7)  
cr.fill ()  
cr.set_source_rgb (0, 0, 0)  
table.show_table (cr)`

  
Here's the result **test.pdf**:

  

![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEij34iY-Hfcolar48bAkomRcOscr6SMY83bW5FsLCTorZIsUiKByIf05zx6IMfqbQ8d6ipDsvIEb-ILcQWOLWhDxjIuxA6tXnGFYH-6fJvtom7qvD517rBUai2tsgad_xJx9pdA/s800/Screenshot.png)
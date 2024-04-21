---
title: 'Inline commenting system for blog sites'
date: 2013-06-28T13:04:00.000-07:00
draft: false
url: /2013/06/inline-commenting-system-for-blog-sites.html
tags: 
- algorithms
- javascript
- blog
- comments
---

_One side of the idea:_  
Lately I've seen some comment systems that inline comments in the text itself, see an [example here](http://book.realworldhaskell.org/read/functional-programming.html).  
  
_Other side of the idea:_  
I've implemented a couple of [unsupervised](http://dl.acm.org/citation.cfm?id=1998149) [algorithms](http://www.hpl.hp.com/techreports/2009/HPL-2009-185.pdf) for news text extraction from web pages in Javascript, and they work generally well. They're also capable of splitting the news text into paragraphs and avoid image captions or other unrelated text.  
  
_The idea:_  
Merge the two ideas, as a new commenting service (like Disqus) for blogs, in a modern and interesting way.  

1.  The algorithms are capable of extracting the news text from your blog and splitting it into paragraphs.
2.  For each paragraph, add a seamless event so that when the user overs a paragraph with the mouse, a comment action button appears.
3.  When clicking the comment button a popup will appear showing a text box at the top where you can write the comment, and the list of comments at the bottom that are related to that paragraph only. (I please you, let the user order comments by date.)
4.  _Optional killer feature_: together with the text box, you can also choose to add two buttons: "This is true", "This is false", so that there's a kind of voting system about the truth value of that paragraph from the readers perspective.
5.  Once you send the comment, that comment is tied to that paragraph.
6.  Give the possibility to create comments the old way, in case the user does not want to strictly relate the comment to a paragraph.
7.  Give the possibility to show all the comments at the bottom of the page (button "Show all comments"). If a comment is related to a paragraph, insert an anchor to the paragraph.

Given that the blogger shouldn't add any additional HTML code for the paragraphs because of the unsupervised news extraction algorithms, the comment service API will not differ in any way than the current ones being used.  
  
Problems of this approach:  

*   There's no clear chronology for the user between comments of two different paragraphs. In my opinion, this shouldn't be a big deal, as long as comments between two paragraphs are unrelated.
*   If a paragraph is edited/deleted, what happens to the comments? One solution is to not show them in the text, but add a button "Show obsolete comments" at the buttom of the page, or rather show them unconditionally.
*   The unsupervised algorithm may fail to identify the post. In that case, the blogger may fall back to manually define the DOM element containing the article.
---
title: 'Bubble sort for prolog'
date: 2011-02-24T10:30:00.000-08:00
draft: false
url: /2011/02/bubble-sort-for-prolog.html
tags: 
- logic programming
- prolog
- algorithms
- comparison
- sorting
---

Hello again,  
this time I've found a version of [bubble sort here](http://kti.mff.cuni.cz/%7Ebartak/prolog/sorting.html). I wanted to provide my version, which is less iterative and, I think, more intuitive. What it does is, simply, bubble until it's sorted:  
  
```
bubblesort(L1, L2) :- bubblesort2(L1,L2,unsorted),!.  
bubblesort2(L,L,sorted).  
bubblesort2(L1,L2,unsorted) :- bubble(L1,L3,C), bubblesort2(L3,L2,C).  
bubble(\[\],\[\],sorted).  
bubble(\[X\],\[X\],sorted).  
bubble(\[X,Y|L\], \[X|L1\], C) :- X <= Y, bubble(\[Y|L\],L1,C).  
bubble(\[X,Y|L\], \[Y|L1\], unsorted) :- X \> Y, bubble(\[X|L\],L1,\_).  
  
Yes, the exam is tomorrow so I will finally stop annoying you readers ;)  

```
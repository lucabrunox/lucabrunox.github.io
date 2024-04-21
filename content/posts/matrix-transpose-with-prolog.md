---
title: 'Matrix transpose with Prolog'
date: 2011-02-15T12:20:00.000-08:00
draft: false
url: /2011/02/matrix-transpose-with-prolog.html
tags: 
- logic programming
- prolog
- algorithms
- matrices
---

Hello,  
an exam exercise requires me to write a matrix transpose method. I've written one and it took a little before I was able to define it completely in 4 rules.  
I'm curious then I've found this on [stackoverflow](http://stackoverflow.com/questions/4280986/how-to-transpose-a-matrix-in-prolog): the approach is to calculate first transposed column, then shift by one column and calculate the transpose of that new matrix.  
This was one of the first solutions I've thought but I haven't realized it because I'm too lazy to create a rule for calculating the shifted matrix.  
  
My approach is iterative thus less intuitive:  
```
trans(M1, M2) :- trans2(M1, M1, \[\], M2, 0), !.
  
trans2(\[A|\_\], \_, \_, \[\], N) :- length(A, N).
  
trans2(M, \[\], H1, \[H1|R1\], N) :- N1 is N+1, trans2(M, M, \[\], R1, N1).
  
trans2(M, \[H|R\], L, \[H1|R1\], N) :- nth0(N, H, X),
  
   append(L, \[X\], L1), trans2(M, R, L1, \[H1|R1\], N).
  

```
  
Ok, apart the fact that I haven't got the time to beautify it, the code will iterate columns and for each column it calculates a row of the transposed matrix (yes, exactly what you expect a transpose method to do :P). The key is "passing" around the nth column we're looking at.  
After we finish calculating a row, we restart from the first row but looking at the nth+1 column. Recursion ends when there are no more resulting rows, i.e. when we reached the end of the columns.
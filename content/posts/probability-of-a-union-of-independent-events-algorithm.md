---
title: 'Probability of a union of independent events algorithm'
date: 2011-08-09T10:29:00.000-07:00
draft: false
url: /2011/08/probability-of-union-of-independent.html
tags: 
- algorithms
- probability
---

Lately I was looking for a copy 'n paste algorithm to calculate the [probability](http://en.wikipedia.org/wiki/Probability) of a union of [independent](http://en.wikipedia.org/wiki/Independence_%28probability_theory%29) events that are not [mutually exclusive](http://en.wikipedia.org/wiki/Mutually_exclusive_events) (aka [inclusion-exclusion principle in probability](http://en.wikipedia.org/wiki/Inclusion-exclusion_principle#In_probability)). Unfortunately I couldn't find any algorithm for such a basic problem.  
Therefore, I decided to write the following naive algorithm which is fast enough for my purposes (O(n2) in time and space, where n is the number of events), and share with everyone:  
  
You can find the [code snippet here](http://www.refactory.org/s/probability_of_a_union_of_independent_non_mutually_exclusive_events/view/latest), sorry for not embedding it in the blog post but blogger is really boring me with snippets having broken layout.  
  
The idea behind the [dynamic programming](http://en.wikipedia.org/wiki/Dynamic_programming) approach starts from this observation:  
  
Let A, B and C be independent non mutually exclusive events. Then:  
  
P(A or B or C) \= P(A) + P(B) + P(C) - P(A)P(B) - P(A)P(C) - P(B)P(C) + P(A)P(B)P(C)  
  
Let me simplify the expression using A instead of P(A):  
  
P(A or B or C) \= A+B+C - AB - AC - BC + ABC  
  
Notice that AB+AC+BC = A(B+C) + BC. In general:  
  
AB+AC+AD+...+AZ + BC+BD+....+BZ \= A(B+C+D+...+Z) + B(C+D+...+Z)  
  
ABC+...+ABZ + ACD+...+ACZ+...+AYZ + BCD+...+BYZ \= A(B(C+D+...+Z)+C(D+...+Z)+...+YZ) + B(C(D+...+Z)+...+YZ)  
  
That's exactly where we exploit the dynamic programming to avoid recalculating the same expressions twice.  
  
Edit: My effort was totally useless given that for independent events this is equivalent to 1 - (1 - pA)(1 - pB)..., which can be calculated in linear time. I even used this formula once and forgot about it :-(
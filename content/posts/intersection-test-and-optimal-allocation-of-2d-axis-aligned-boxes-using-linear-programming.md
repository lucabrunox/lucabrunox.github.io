---
title: 'Intersection test and optimal allocation of 2D axis-aligned boxes using linear programming'
date: 2014-01-20T09:31:00.001-08:00
draft: false
url: /2014/01/intersection-test-and-optimal.html
tags: 
- glpk
- geometry
- linear programming
- milp
- problem solving
---

(function () { var script = document.createElement("script"); script.type = "text/javascript"; script.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML\_HTMLorMML"; document.getElementsByTagName("head")\[0\].appendChild(script); })(); **Either-or trick**  
In this solution, we will make use of the either-or trick. The constraints in a program are all in _and_, but we want some of them to be in _or_.  
Consider the following logic formula: \\(a\\ge b\\vee c\\ge d\\). It can be written with the following _and_ constraints: \\\[ \\begin{alignedat}{2}\\, & M\\cdot x\\; & +a\\; & \\ge b\\\\ \\, & M\\cdot\\left(1-x\\right)\\; & +c\\; & \\ge d\\\\ \\, & \\, & x\\; & \\in\\left\\{ 0,1\\right\\} \\end{alignedat} \\\] where \\(M \\gt 0\\) is big (depending on the specific context as we'll see later).  
When \\(x=0\\), then \\(a \\ge b\\) must hold, while the second constraint is always satisfied. When \\(x=1\\), then \\(c \\ge d\\) must hold, while the first constraint is always satisfied.  
In other words, either one of the two constraint must hold for a given value of \\(x\\). If neither do, then the original _or_ formula is not satisfied.  
  
**Empty intersection test**  
Given two AABB boxes \\(i,j\\) at position \\(x\_i,y\_i\\) and \\(x\_j,y\_j\\) with size \\(w\_i,h\_i\\) and \\(w\_j,h\_j\\) respectively, we want to constraint our program such that their intersection is empty.  
This can be expressed with the following logic formula:  
\\\[ \\left(x\_{i}\\ge x\_{j}+w\_{j}\\vee x\_{j}\\ge x\_{i}+w\_{i}\\right)\\vee\\left(y\_{i}\\ge y\_{j}+h\_{j}\\vee y\_{j}\\ge y\_{i}+h\_{i}\\right) \\\]  
We can encode the above expression with 3 either-or tricks using 3 binary variables:  
\\\[ \\begin{alignedat}{3}\\; & M\\cdot b\_{1}\\; & \\, & +M\\cdot b\_{3} & +x\_{i}\\; & \\ge x\_{j}+w\_{j}\\\\ \\; & M\\cdot\\left(1-b\_{1}\\right)\\; & \\, & +M\\cdot b\_{3} & +x\_{j}\\; & \\ge x\_{i}+w\_{i}\\\\ \\; & M\\cdot b\_{2}\\; & \\, & +M\\cdot\\left(1-b\_{3}\\right) & +y\_{i}\\; & \\ge y\_{j}+w\_{j}\\\\ \\; & M\\cdot\\left(1-b\_{2}\\right)\\; & \\, & +M\\cdot\\left(1-b\_{3}\\right) & +y\_{j}\\; & \\ge y\_{i}+w\_{i}\\\\ \\, & \\, & \\, & \\; & b\_{1},b\_{2},b\_{3}\\; & \\in\\left\\{ 0,1\\right\\} \\end{alignedat} \\\] **Real problem**  
Given a fixed area of size \\((cols)\\times(rows)\\) and a set of boxes with fixed width \\(w\_i\\) for each \\(i=1..n\\) (where \\(n\\) is the number of boxes), find the optimal allocation \\(x\_i, y\_i, h\_i\\) for each box \\(i=1..n\\) such that we cover all the area and maximize the size of the boxes fairly.  
To achieve fair allocation we choose to maximize the minimum height of the boxes. For example, if we had an area of size \\(5\\times100\\), and two boxes of width \\(5\\) each, we prefer them to have height \\(50\\) and \\(50\\) respectively, rather than \\(1\\) and \\(99\\).  
  
This problem can be encoded as follows: \\\[ max\\; minh+C\\cdot{\\displaystyle \\sum\_{i=1}^{n}h\_{i}} \\\] \\\[ subject\\;to: \\\] \\begin{equation} \\forall i=1..n:\\; minh\\leq h\_{i} \\end{equation}  
\\\[ \\forall i=1..n-1,\\, j=i+1..n: \\\] \\begin{equation} \\begin{alignedat}{3}\\; & M\\cdot b\_{1}^{\\left(ij\\right)}\\; & \\, & +M\\cdot b\_{3}^{\\left(ij\\right)} & +x\_{i}\\; & \\ge x\_{j}+w\_{j}\\\\ \\; & M\\cdot\\left(1-b\_{1}^{\\left(ij\\right)}\\right)\\; & \\, & +M\\cdot b\_{3}^{\\left(ij\\right)} & +x\_{j}\\; & \\ge x\_{i}+w\_{i}\\\\ \\; & M\\cdot b\_{2}^{\\left(ij\\right)}\\; & \\, & +M\\cdot\\left(1-b\_{3}^{\\left(ij\\right)}\\right) & +y\_{i}\\; & \\ge y\_{j}+w\_{j}\\\\ \\; & M\\cdot\\left(1-b\_{2}^{\\left(ij\\right)}\\right)\\; & \\, & +M\\cdot\\left(1-b\_{3}^{\\left(ij\\right)}\\right) & +y\_{j}\\; & \\ge y\_{i}+w\_{i}\\\\ \\, & \\, & \\, & \\; & b\_{1}^{\\left(ij\\right)},b\_{2}^{\\left(ij\\right)},b\_{3}^{\\left(ij\\right)}\\; & \\in\\left\\{ 0,1\\right\\} \\end{alignedat} \\end{equation}  
\\\[ \\forall i=1..n: \\\] \\begin{equation} \\begin{alignedat}{1}x\_{i}+w\_{i}\\; & \\le cols\\\\ y\_{i}+h\_{i}\\; & \\leq rows\\\\ 0\\leq x\_{i}\\; & \\leq cols-1\\\\ 0\\leq y\_{i}\\; & \\leq rows-1\\\\ 1\\leq h\_{i}\\; & \\leq rows \\end{alignedat} \\end{equation} Equation \\((1)\\) is used to get the minimum height of the boxes together with the objective function. Equations \\((2)\\) ensure that the boxes do not overlap. Equations \\((3)\\) ensure that the boxes don't lie outside of the allocation area.  
In the objective function we also add a second component, which ensures that on equal \\(minh\\) we chose the allocation that fills the remaining space. This component must thus be \\(< 1\\) to not bias the \\(minh\\) component.  
  
Now, what are the values of \\(M\\) and \\(C\\)? The constant \\(M\\) must be big enough to make an inequality always true, so:  
\\begin{gather\*} \\forall i,j:\\; M\\ge x\_{j}+w\_{j}-x\_{i}\\\\ M\\ge\\max\\left\\{ x\_{j}+w\_{j}-x\_{i}\\right\\} \\\\ M\\ge\\max\\left\\{ x\_{j}+w\_{j}\\right\\} -\\min\\left\\{ x\_{i}\\right\\} \\\\ M\\ge cols \\end{gather\*} Since it must hold also for rows, \\(M\\ge\\max\\left\\{ cols,rows\\right\\}\\). The result is very intuitive if you look at the original inequalities. We can choose a value of \\(M=cols+rows\\).  
The constant \\(C\\) instead must be such that: \\begin{gather\*} C\\cdot{\\displaystyle \\sum\_{i=1}^{n}h\_{i}}<1\\\\ C\\cdot n\\cdot\\max\\left\\{ h\_{i}\\right\\} <1\\\\ C\\cdot n\\cdot rows<1\\\\ C<\\frac{1}{n\\cdot rows} \\end{gather\*} This result is also very intuitive. We can choose \\(C=\\frac{1}{2\\cdot n\\cdot rows}\\) to avoid numerical instability.  
  
**Demonstration**  
I've prepared a GMPL program to allocate \\(10\\) boxes with width \\(3,4,10,7,4,8,2,9,8,5\\) in an area of \\(10\\,cols\\times100\\, rows\\). GLPK does not converge, so you can limit the time to 1 second (or more) in order to get a feasible but suboptimal solution.  
You can visualize the result in the screenshot below of the two solutions while running for 1 second and 5 second respectively. After 60 seconds the solution didn't improve.  
Please note that there is no relationship between the colors of the two tests.  
  

image/svg+xml 1s 5s

  
Relaxing the _integer_ constraint on \\(x,y,h,minh\\) might also give you better solutions in less time.  
You can download the gist below and run it as: glpsol --tmlim 5 -m aabb\_alloc.mod:
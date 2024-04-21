---
title: 'Accessing simple private fields in PHP'
date: 2013-06-05T07:53:00.000-07:00
draft: false
url: /2013/06/accessing-simple-private-fields-in-php.html
tags: 
- php
---

A way of accessing private fields in PHP is by changing the accessibility of the fields themselves with [http://php.net/manual/en/reflectionproperty.setaccessible.php](http://php.net/manual/en/reflectionproperty.setaccessible.php).  
However this approach requires PHP 5.3.  
  
For PHP < 5.3 there's another subtle way of accessing private properties:  
  

function getPrivateProperty($fixture, $propname) {  
    try {  
     $arr \= ([array](http://www.php.net/array))$fixture;  
 } catch (Exception $e) {  
 }  
 $class \= [get\_class](http://www.php.net/get_class)($fixture);  
 $privname \= "\\0$class\\0$propname";  
 return $arr\[$privname\];  
}

  
Usage is pretty straightforward, pass in the object and the property name as string. The property must be private and must be convertible to array.
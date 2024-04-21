---
title: 'Python and RSA'
date: 2009-11-14T06:34:00.000-08:00
draft: false
url: /2009/11/there-are-many-python-toolkits-for.html
tags: 
- crypto
- python
- development
---

[![](http://sial.org/howto/openssl/lock.jpg)](http://sial.org/howto/openssl/lock.jpg)  
There are many Python toolkits for crypto, so I hope I've done the best choice (at least for now). This is a simple utility class for managing RSA keys, a sort of wrappera to the [m2crypto](http://sandbox.rulemaker.net/ngps/m2/) [class](http://www.heikkitoivonen.net/m2crypto/api/M2Crypto.RSA.RSA-class.html).  
  

import M2Crypto  
```
class RSA (object):  
def \_\_init\_\_ (self, bits=1024, padding=M2Crypto.RSA.pkcs1\_padding, exp=65537):  
    self.bits = bits  
    self.padding = padding  
    self.exp = exp  
    self.rsa = None  
  
def generate (self):  
    self.rsa = M2Crypto.RSA.gen\_key(  
        self.bits, self.exp, lambda x: None)  
  
def encrypt (self, s):  
    c = ""  
    bytes = self.bits/8\-11  
    for i in range(0, len(s), bytes):  
        c += self.rsa.public\_encrypt (s\[i:i+bytes\], self.padding)  
    return c  
  
def sign (self, s, algo="sha1"):  
    dgst = M2Crypto.EVP.MessageDigest (algo)  
    dgst.update (s)  
    return self.rsa.sign (dgst.digest (), algo)  
  
def verify (self, s, sign, algo="sha1"):  
    dgst = M2Crypto.EVP.MessageDigest (algo)  
    dgst.update (s)  
    try:  
        self.rsa.verify (dgst.digest (), sign, algo)  
    except:  
        return False  
    return True  
  
def decrypt (self, c):  
    s = ""  
    bytes = self.bits/8  
    for i in range(0, len(c), bytes):  
        s += self.rsa.private\_decrypt (c\[i:i+bytes\], self.padding)  
    return s
```
Example usage:

  
`rsa = RSA ()  
rsa.generate () # generate key pair  
s = "a"*2000 # test data  
edata = rsa.encrypt (s)  
sign = rsa.sign (s)  
  
ddata = rsa.decrypt (edata)  
assert rsa.verify (ddata, sign) == True`
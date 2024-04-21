---
title: 'TypeScript and NodeJS, I''m sold'
date: 2016-01-04T13:33:00.000-08:00
draft: false
url: /2016/01/typescript-and-nodejs-im-sold.html
tags: 
- nodejs
- javascript
- typescript
- development
---

[TypeScript](http://www.typescriptlang.org/) is a typed superset of JavaScript that compiles to plain JavaScript, the way you expect it to be.

I’ve heard of it a long time ago, but recently with [TypeScript 1.7](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#typescript-17) it got `async` functions, which means you can `await`asynchronous function calls, similarly to C#, Vala, Go and other languages with syntax support for concurrency. That makes coroutines a pleasant experience compared to plain JavaScript. That’s also the main reason why I didn’t choose Dart.

I’m writing a NodeJS application so I decided to give it a go. Here’s my personal tour of TypeScript and why I’m sold to using it.

### Does it complain when using undeclared variables?

```
console.log(foo);
```
```
Cannot find name 'foo'. 
```

Sold!

### Does it infer types?

```
var foo = 123;
foo = "bar";
```
```
Type 'string' is not assignable to type 'number'. 
```

Sold!

### Does it support async arrow functions?

```
async function foo() {
}
var bar = async () => { await (foo); };
```

Sold!

### Does it support sum types?

```
var foo: number | string;
foo = 123;
foo = "bar";
```

Sold!

### Does it play nice with CommonJS/AMD imports and external libraries?

Yes, it does very well. Sold!

### Is it easy to migrate from and to JavaScript?

Yes. TypeScript makes use of latest ECMAScript features in its syntax when possible, so that JavaScript -> TypeScript is as painless as possible. Sold!

Also to go back from TypeScript to JavaScript, either use the generated code, or remove all the type annotations in the code by yourself.

### Does it have non-nullable variables?

No. This is mostly due to the JavaScript nature though. But I’m sure the TypeScript community will come up with a nice solution [throughout this topic](https://github.com/Microsoft/TypeScript/issues/185).

* * *

I’m going to use TypeScript wherever I can in this new year instead of plain JavaScript. In particular, I’m rewriting my latest NodeJS application in TypeScript right now.

I hope it will be a great year for this language. The project is exceptionally active, and I hope to contribute back to it.
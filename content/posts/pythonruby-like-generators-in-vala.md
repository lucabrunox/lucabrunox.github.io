---
title: 'Python/Ruby like generators in Vala'
date: 2011-07-09T00:42:00.000-07:00
draft: false
url: /2011/07/pythonruby-like-generators-in-vala.html
tags: 
- ruby
- languages
- python
- coroutine
- development
- vala
- generator
---

Hello,  
the post below is copied straight [from here](http://valajournal.blogspot.com/2011/07/generators-in-vala.html).  
  
Here I'll show a cool snippet code making use Vala async functions and iterators for emulating Python/Ruby generators. Creating a generator is as simple as extending the Generator class and implementing the generate() method.  
  
```
abstract class Generator {
    private bool consumed;
    private G value;
    private SourceFunc callback;

    public Generator () {
        helper ();
    }

    private async void helper () {
        yield generate ();
        consumed \= true;
    }

    protected abstract async void generate ();

    protected async void feed (G value) {
        this.value \= value;
        this.callback \= feed.callback;
        yield;
    }

    public bool next () {
        return !consumed;
    }

    public G get () {
        var result \= value;
        callback ();
        return result;
    }

    public Generator<G> iterator () {
        return this;
    }
}

class IntGenerator : Generator<int> {
    protected override async void generate () {
        for (int i\=0; i < 10; i++) {
            yield feed (i);
        }
    }
}

void main () {
    var gen \= new IntGenerator ();
    foreach (var i in gen) {
        message ("%d", i);
    }
} 
```
  
You can find the above [code snippet here](http://www.refactory.org/s/generators_in_vala/view) as well.
# __

functional js 

## Record

Return an instance of the record type class. 

```javascript
let Record = require('./record')();

let r = Record.compute((_, i) => i)(['x', 'y', 'z']);

//> r = {x: 0, y: 1, z: 2}

r = Record.map(i => i + 1)(r);

//> r = {x: 1, y: 2, z: 3}

let sum = Record.reduce((a, b) => a + b, 0);

r = Record.update({t: sum})(r);
//> r = {x: 1, y: 2, z: 3, t: 6}

let prod = Record.reduce((a, b) => a * b, 1);

let r1 = Record.update({p: prod, q: prod})(r),
    r2 = Record.update({p: prod}, {q: prod})(r);

[r1, r2] = __.map(Record.get('p', 'q'))([r1, r2]);

//> r1 = {p: 36, q: 36}
//> r2 = {p: 36, q: 1296} 
```


## __.R 

real algebra

## __.C 

complex algebra


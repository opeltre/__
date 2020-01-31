## __

Basic functional tools in the __ [file](src/__.js). 

```javascript
let __ = require('./src/__');

let f = x => x**2;


//====== pipes ======

let b = __.pipe(f, f, f)(3);
//  b = 6'561

let square = g => __.pipe(g, g);
    F = __.pipe(square, square);

let c = F(f)(3);
//  c = 43'046'721


//====== map ======

let xs = __.range(6);
//  xs = [0, 1, 2, 3, 4, 5]

let ys = __.map(f)(xs);
//  ys = [0, 1, 4, 9, 16, 25]


//====== application ======

let $x = __.$(5),
    y = $x(f);
//  y = 25

let apply = fs => x => __.map(__.$(x))(fs);

let iter = __.pipe(
    __.range, 
    __.map(_ => f),
    fs => __.pipe(...fs)
);
    
let fs = __.range(5).map(iter);
    ys = apply(fs)(3);
//  ys = [3, 9, 81, 6'561, 43'046'721, 1'853'020'188'851'841]
```
:rocket:


## Record

A [record](src/record.js) type instance 
exposes methods such as `map`, `filter`, `reduce`, `forEach`... 
dedicated to js objects. 

```javascript
let Record = require('./record'),
    record = Record();

let r = record.compute((_, i) => i)(['x', 'y', 'z']);
//  r = {x: 0, y: 1, z: 2}

r = record.map(i => i + 1)(r);
//  r = {x: 1, y: 2, z: 3}

let sum = record.reduce((a, b) => a + b, 0),
    prod = record.reduce((a, b) => a * b, 1);

r = record.update({t: sum})(r);
//  r = {x: 1, y: 2, z: 3, t: 6}

//====== compare: ======

let r1 = record.update({p: prod, q: prod})(r),
    r2 = record.update({p: prod}, {q: prod})(r);

[r1, r2] = __.map(record.get('p', 'q'))([r1, r2]);
//  r1 = {p: 36, q: 36}
//  r2 = {p: 36, q: 1296} 
```

## ND Arrays 

An [nd-array](src/nd_array.js) type instance exposes 
methods such as `map`, `reduce`, etc. 
dedicated to n-dimensional arrays. 

```javascript

let ND = require('./nd_array'),
    nd = ND();

let f_ij = ([xi, xj]) => xi * xj; 

let a = nd.compute([[1, 2, 3], [4, 5]])(f_ij);
//  a = [[4, 8, 12],
//       [5, 10, 15]] 

let sum = nd.reduce((x, y) => x + y),
    mean = a => sum(a) / nd.size(a);

m = mean(a);
//  m = 9

let b = nd.map(y => y - m)(a);
//  b = [[-5, -1, 3],
//       [-4, 1, 6]] 

let c = nd.map2((x, y) => x * y)(a, b);
//  c = [[-20, -8, 36],
//       [-20, 10, 90]];
```

## Tensors 

[Real](src/R.js) and [complex](src/C.js) algebra of nd-arrays, 
i.e. inherit from an nd-array type instance 
but provide with additional methods such as `add`, `mult`, `scale`, 
`int`, `inner` ...

Fast fourier transform implemented in [fourier](src/fourier.js)

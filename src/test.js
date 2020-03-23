let __ = require('./__'),
    set = require('./set')
    Nerve = require('./nerve'),
    Tensor = require('./tensor'),
    R = require('./R'),
    Complex = require('./complex');

let {cell, chain} = require('./id');

let vertices = ['i', 'j', 'k'],
    edges = ['i.j','j.k','i.k'];

let N = Nerve(edges);

let E = i => [-1, 1];
    A = Tensor.functor(E);

let K = Complex(A, edges);

let B = 0.1, J = 1;

let hi = A.compute('i')(xi => B * xi),
    hij = A.compute('i.j')((xi, xj) => J * xi * xj);

let h = K.zero(0);
vertices.forEach(
    i => h[i] = hi
);
edges.forEach(
    ij => h[ij] = hij
);


//------ message-passing ------

let Deff = 
    U => K.compute(1)(__.pipe(
        chain, 
        ([a, b]) => R.subt(
            U[chain.id([b])], 
            R.effE(a, b)(U[chain.id([a])])
        )
    ));

let zeta = K.zeta(0), 
    _Deff = __.pipe(Deff, K.scale(-1)),
    mu = K.mu(1),
    div = K.codiff(1); 

let tau = __.pipe(zeta, _Deff, mu, div); 

let integrate = 
    (dx, dt, t) => x0 => 
        __.range(Math.floor(t/dt)).reduce(
            (xs, i) => [...xs, K.add(xs[i], K.scale(dt)(dx(xs[i])))],
            [x0]
        );

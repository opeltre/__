let __ = require('./__'),
    Nerve = require('./nerve'),
    set = require('./set'),
    record = require('./record'),
    {chain, cell} = require('./id');

//------ extend a functor `G: X -> Ab' to `NX' ------
/*
    instance G : (X => Ab) 
    where
        G.func :    (a > b) -> G a -> G b
        G.zero :    a -> G a 
        G.add :     G a -> G a -> G a
        G.scale :   num -> G a -> G a

    ------ natural transformations ------

    complex :   (X => Ab)   =>  (NX => Ab)*
                (X => Ab)*  =>  (NX => Ab)
                (X =<> Ab)  =>  (NX =<> Ab)
*/


module.exports = function (G, X) {

    let N = Nerve(X),
        NG = baseSpace(G, N); 

    if (G. func) 
        NG = cochainComplex(G, N, NG);

    if (G.cofunc)
        NG = chainComplex(G, N, NG);

    return NG;
}


//------ (X => Ab) -> (NX => Ab)* ------

function baseSpace (G, N) {

    let NG = record();

    let compute = NG.compute;

    NG.compute = 
        k => f => compute(
            f, 
            a => chain.id(a)
        )(N(k));

    NG.zero = 
        k => NG.compute(k)(
            a => G.zero(chain.cell(a))
        );

    NG.add2 = 
        NG.map2(G.add2);
    
    NG.add = 
        (...us) => us.reduce(NG.add2);

    NG.mult = 
        (...us) => us.reduce(NG.map2(
            (ua, va, a) => G.mult(ua, va)
        ));

    NG.scale = 
        s => NG.map(G.scale(s));

    NG.int = 
        NG.reduce((x, y) => x + y, 0);

    NG.inner =
       (u, v) => NG.int(NG.map2(G.inner)(u, v));

    return NG;
}


//------ (X => Ab) -> Ch* ------

function cochainComplex (G, N, NG) {

    if (!NG) 
        NG = baseSpace(G, N);

    NG.cofunc = 
        (a, b) => G.func(chain.cell(b), chain.cell(a));


    NG.diff = 
        k => 
            u => __.range(k + 2)
                .map(j => NG.coface(j, k)(u))
                .reduce(NG.add2);

    NG.coface = 
        (j, k) => 
            u => NG.map(__.pipe(
                (_, a) => chain(a),
                a => [a, N.face(j)(a)],
                ([a, b]) => NG.cofunc(a, b)(u[chain.id(b)]),
                va => G.scale((-1)**j)(va)
            ))(NG.zero(k + 1));

    return NG;
}


//------ (X => Ab)* -> Ch ------

function chainComplex (G, N, NG) {

    if (!NG) 
        NG = baseSpace(G, N);

    NG.func = 
        (a, b) => G.cofunc(chain.cell(b), chain.cell(a));

    NG.face = 
        (j, k) => 
            u => NG.map(__.pipe(
                (_, b) => N.cofaces(j)(chain(b))
                    .map(a => NG.func(a, b)(u[chain.id(a)]))
                    .reduce(G.add2, G.zero(b)),
                vb => G.scale((-1)**j)(vb)
            ))(NG.zero(k - 1));

    NG.codiff = 
        k => 
            u => __.range(k + 1)
                .map(j => NG.face(j, k)(u))
                .reduce(NG.add2);

    let iprod = 
        a0 => u => as => u([a0, ...as]); 

    let zeta = 
        k => u => k === 0
            ? __.pipe(
                chain, 
                ([a]) => N
                    .cone(a)
                    .map(b => G.cofunc(a, b)(u([b])))
                    .reduce(G.add2) 
            )
            : __.pipe(
                chain,
                ([a0, a1, ...as]) => N
                    .intercone(a0, a1)
                    .map(b0 => zeta(k-1)(iprod(b0)(u))([a1, ...as]))
                    .reduce(G.add2)
            );

    NG.zeta = 
        k => u => NG.compute(k)(
            zeta(k)(as => u[chain.id(as)] || G.zero(as[as.length - 1]))
        );
    
    let last = 
        as => as[as.length - 1];

    let nu = 
        (a0, k) => v => k === 0
            ? ([]) => N
                .cone(a0)
                .map(b => G.cofunc(a0, b)(
                    G.scale(N.mu(a0, b))(v([b]))
                ))
                .reduce(G.add2)
            : (as) => N
                .intercone(a0, as[0])
                .map(b0 => G.cofunc(last(as), set.cap(b0, last(as)))(
                    G.scale(N.mu(a0, b0))(
                        v([a0, ...as].map(aj => set.cap(b0, aj)))
                    )
                ))
                .reduce(G.add2);

    NG.mu = 
        k => v => NG.compute(k)(
            __.pipe(
                chain, 
                as => as.reduce(
                    (u, aj, j) => nu(aj, k - j)(u),
                    bs => v[chain.id(bs)] || G.zero(bs[bs.length - 1]) 
                )([])
            )
        );

    return NG;

}

let __ = require('./__');


let Alg = {};

Alg.map = f => 
    p => Array.isArray(p)
        ? p.map(Alg.map(f))
        : f(p);

Alg.map2 = f => 
    (p, q) => Array.isArray(p)
        ? p.map((_, i) => Alg.map2(f)(p[i], q[i]))
        : f(p, q);

Alg.mapN = f => 
    (...ps) => Array.isArray(ps[0])
        ? ps[0].map(
            (_, i) => Alg.mapN(f)(...ps.map(p => p[i]))
        )
        : f(...ps);

Alg.eval = ([k, ...ks]) =>
    p => Array.isArray(p) 
        ? Alg.eval(ks)(p[k])
        : p;

// (b -> a -> b) -> Alg a -> b  
Alg.reduce = f => 
    p => Array.isArray(p)
        ? p.reduce(
            (pi, pj) => f(
                Alg.reduce(f)(pi), 
                Alg.reduce(f)(pj)
            )
        )
        : p;

Alg.add = 
    Alg.map2((x, y) => x + y);

Alg.mult = 
    Alg.map2((x, y) => x * y);

Alg.scale = 
    z => Alg.map(y => z * y);

Alg.subt = 
    (p, q) => Alg.add(p, Alg.scale(-1)(q));

let minus = 
    (N, i) => (N - i) % N 

Alg.reverse = 
    p => Array.isArray(p) 
        ? p.map(
            (_, i) => p[minus(p.length, i)].map(Alg.reverse)
        )
        : p;

Alg.mass = Alg.reduce(Alg.add);

Alg.volume = 
    u => Alg.shape(u).reduce(Alg.mult);

Alg.mean = 
    u => Alg.mass(u) / Alg.volume(u);

Alg.scalar = __.pipe(
    Alg.mult,
    Alg.mass
);

Alg.norm = 
    p => Math.sqrt(Alg.scalar(a, a));

let marginal = 
    ([i, ...is], [j, ...js]) => 
        q => typeof(i) === 'undefined'
            ? q
            : ( i === j 
                ? __.map(Alg.marginal(is, js))(q)
                : Alg.marginal(is, [j, ...js])(q.reduce(Alg.add))
            );

let extend = 
    ([i, ...is], [j, ...js], [E, ...Es]) => 
        q => typeof i === 'undefined' 
            ? q 
            : (i === j 
                ? q.map(Alg.extend(is, js, Es))
                : E.map(
                    _ => Alg.extend(is, [j, ...js], Es)(q)
                )
            );

let cell = js => 
    Array.isArray(js) 
        ? js
        : js.split('.').filter(j => j !== '');

Alg.marginal = 
    (a, b) => marginal(...[a, b].map(cell));

Alg.extend = 
    (a, b, Es) => extend(...[a, b].map(cell), Es);

let compute = ([E, ...Es]) => 
    f => typeof(E) === 'undefined'
        ? f([])
        : E.map(
            x => Alg.compute(Es)(xs => f([x, ...xs]))
        );

Alg.compute = 
    Es => compute(Es.map(E => Array.isArray(E) ? E : __.range(E)));

/* array <--> lambda */

Alg.shape = 
    q => Array.isArray(q)
        ? [q.length, ...Alg.shape(q[0])]
        : [];

Alg.call = q => 
    (i, ...is) => typeof(i) === 'undefined'
        ? q
        : Alg.call(q[i])(...is)

/* lambda */

Alg.proj = (a, b) => 
    x => b
        .map(i => a.indexOf(i))
        .map(j => x[j]);


Alg.ext = (a, b) =>
    f => (...xs) => f(...Alg.proj(a, b)(xs));


/* prob */

Alg.Gibbs = H => {
    let Q = Alg.map(h => Math.exp(-h))(H),
        Z = Alg.mass(Q);
    return Alg.map(q => q / Z)(Q);
}

Alg.expect = (a,b) => f =>
    p => Alg.mult(
        Alg.marginal(a,b)(Alg.mult(f,p)),
        Alg.map(y => 1 / y)(Alg.marginal(a,b)(p))
    );

/* exports */
module.exports = Alg;


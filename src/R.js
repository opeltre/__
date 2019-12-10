let __ = require('./__');


let R = {};

R.map = f => 
    p => Array.isArray(p)
        ? p.map(R.map(f))
        : f(p);

R.map2 = f => 
    (p, q) => Array.isArray(p)
        ? p.map((_, i) => R.map2(f)(p[i], q[i]))
        : f(p, q);

R.mapN = f => 
    (...ps) => Array.isArray(ps[0])
        ? ps[0].map(
            (_, i) => R.mapN(f)(...ps.map(p => p[i]))
        )
        : f(...ps);

R.eval = ([k, ...ks]) =>
    p => Array.isArray(p) 
        ? R.eval(ks)(p[k])
        : p;

// (b -> a -> b) -> R a -> b  
R.reduce = f => 
    p => Array.isArray(p)
        ? p.reduce(
            (pi, pj) => f(
                R.reduce(f)(pi), 
                R.reduce(f)(pj)
            )
        )
        : p;

R.add = 
    R.map2((x, y) => x + y);

R.mult = 
    R.map2((x, y) => x * y);

R.scale = 
    z => R.map(y => z * y);

R.subt = 
    (p, q) => R.add(p, R.scale(-1)(q));

R.shape = 
    q => Array.isArray(q)
        ? [q.length, ...R.shape(q[0])]
        : [];

R.mass = R.reduce(R.add);

R.volume = 
    u => R.shape(u).reduce(R.mult);

R.mean = 
    u => R.mass(u) / R.volume(u);

R.scalar = 
    __.pipe(R.mult, R.mass);

R.norm = 
    p => Math.sqrt(R.scalar(p, p));

let marginal = 
    ([i, ...is], [j, ...js]) => 
        q => typeof(i) === 'undefined'
            ? q
            : ( i === j 
                ? __.map(R.marginal(is, js))(q)
                : R.marginal(is, [j, ...js])(q.reduce(R.add))
            );

let extend = 
    ([i, ...is], [j, ...js], [E, ...Es]) => 
        q => typeof i === 'undefined' 
            ? q 
            : (i === j 
                ? q.map(R.extend(is, js, Es))
                : E.map(
                    _ => R.extend(is, [j, ...js], Es)(q)
                )
            );

let cell = js => 
    Array.isArray(js) 
        ? js
        : js.split('.').filter(j => j !== '');

R.marginal = 
    (a, b) => marginal(...[a, b].map(cell));

R.extend = 
    (a, b, Es) => extend(...[a, b].map(cell), Es);

let compute = ([E, ...Es]) => 
    f => typeof(E) === 'undefined'
        ? f([])
        : E.map(
            x => R.compute(Es)(xs => f([x, ...xs]))
        );

R.compute = 
    Es => compute(Es.map(E => Array.isArray(E) ? E : __.range(E)));

/**/ 
let minus = 
    (N, i) => (N - i) % N 

R.reverse = 
    p => Array.isArray(p) 
        ? p.map(
            (_, i) => p[minus(p.length, i)].map(R.reverse)
        )
        : p;

/**/

/* array <--> lambda */

R.call = q => 
    (i, ...is) => typeof(i) === 'undefined'
        ? q
        : R.call(q[i])(...is)

/* lambda */

R.proj = (a, b) => 
    x => b
        .map(i => a.indexOf(i))
        .map(j => x[j]);


R.ext = (a, b) =>
    f => (...xs) => f(...R.proj(a, b)(xs));


/* prob */

R.Gibbs = H => {
    let Q = R.map(h => Math.exp(-h))(H),
        Z = R.mass(Q);
    return R.map(q => q / Z)(Q);
}

R.expect = (a,b) => f =>
    p => R.mult(
        R.marginal(a,b)(R.mult(f,p)),
        R.map(y => 1 / y)(R.marginal(a,b)(p))
    );

/* exports */
module.exports = R;


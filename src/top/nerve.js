let __ = require('../__'),
    S = require('./set'),
    id = require('./id');

let {cell, chain} = id;


//------ Nerve type class ------ 

function Nerve (X) { 

    let N = 
        k => Ns[k] || [];
    
    let N0 = X.map(a => [a]),
        Ns = chains([N0]);

    N.face = 
        k => 
            as => [...as.slice(0, k), ...as.slice(k + 1)];

    N.cofaces = 
        k => 
            as => N(as.length)
                .filter(bs => S.eq(N.face(k)(bs), as));


    N.cone = 
        a => [a, ...X.filter(b => S.sup(a, b))]

    N.cocone = 
        b => [b, ...X.filter(a => S.sup(a, b))]

    N.intercone = 
        (a, c) => X.filter(b => S.geq(a, b) && !S.geq(c, b));

    N.interval = 
        (a, c) => X.filter(b => S.sup(a, b) && S.sup(b, c));

    N.mu = 
        (a, c) => S.eq(a, c)
            ? 1
            : [a, ...N.interval(a, c)]
                .map(b => - N.mu(a, b))
                .reduce((x, y) => x + y);


    return N;
}



//------ Nerve with cones & intervals in memory ------

Nerve.record = function (X) {

    let N = Nerve(X),
        _r = __.record();

    let cones = _r.compute(N.cone, cell.id)(X),
        cocones = _r.compute(N.cocone, cell.id)(X),
        intervals = _r.compute(__(N.interval), chain.id)(N(1)),
        intercones = _r.compute(__(N.intercone), chain.id)(N(1));
        
    let mu = _r.compute(__(N.mu), chain.id)([...X.map(a => [a, a]), ...N(1)]);

    N.cone = a => cones[cell.id(a)];
    N.cocone = b => cocones[cell.id(b)];
    N.interval = (a, c) => intervals[chain.id([a, c])];
    N.intercone = (a, c) => intercones[chain.id([a, c])];

    N.mu = (a, c) => mu[chain.id([a, c])];

    N.cofaces =  
        k => 
            bs => {
                let n = bs.length; 
                if ((k < 0) || (k > n)) {
                    return [];
                }
                else if (n === 0) {
                    return X.map(a => [a])
                } 
                else if (k === 0) {
                    return N.cocone(bs[0]).slice(1)
                        .map(a => [a, ...bs]);
                }
                else if (k === n) {
                    return N.cone(bs[n - 1]).slice(1)
                        .map(c => [...bs, c]);
                }
                else {
                    return N.interval(bs[k - 1], bs[k])
                        .map(b => [...bs.slice(0, k), b, ...bs.slice(k)]);
                }
            }

    return N;

}


module.exports = 
    __.pipe(
        __.map(cell),
        Nerve.record
    );


//-------- compute the nerve -------

function chains (N) {

    return N[N.length - 1].length 
        ? chains([
            ...N, 
            N[N.length - 1]
                .map(
                    as => N[0]
                        .filter(([b]) => S.sup(as[as.length - 1], b))
                        .map(([b]) => [...as, b])
                )
                .reduce((xs, ys) => [...xs, ...ys])
        ])
        : N.slice(0, N.length - 1);
};

let __ = require('./__');


//------ cast to set: filter and order ------

let S =
    ([i, ...is], ord) => typeof i !== 'undefined' 
        ? S.cup(S(is), [i], ord) 
        : [];


//------ equality ------

let arrEq = 
    ([i, ...is], [j, ...js]) => S.eq(i, j)
        ? (is.length || js.length ? arrEq(is, js) : true)
        : false;

S.eq = 
    (a, b) => Array.isArray(a) && Array.isArray(b)
        ? arrEq(a, b)
        : a === b;


//------ membership ------

S.in = 
    (i, [j, ...js]) => typeof j !== 'undefined'
        ? (S.eq(i, j) ? true : S.in(i, js))
        : false;


//------ boolean algebra ------

S.cap = 
    (a, b) => a.filter(i => S.in(i, b));

S.cup = 
    (a, b, ord) => [...a, ...b.filter(j => !S.in(j, a))]
        .sort(ord);

S.diff = 
    (a, b) => a.filter(i => !S.in(i, b));


//------ order relations --------

S.leq = 
    (a, b) => S.eq(a, S.cap(a,b));

S.geq = 
    (a, b) => S.eq(S.cap(a,b), b);

S.sub = 
    (a, b) => S.leq(a, b) && !S.eq(a, b);

S.sup = 
    (a, b) => S.geq(a, b) && !S.eq(a, b);


//------ cap-closure ------

S.closure = 
    op => as => as.length
        ? [ 
            ...as,
            ...S.closure(op)(S(
                as
                    .map(
                        (a, i) => as.slice(i+1).map(b => op(a, b))
                    )
                    .reduce((xs, ys) => [...xs, ...ys])
                    .filter(c => ! S.in(c, as))
            ))
        ]
        : [];

S.capClosure = S.closure(S.cap);


module.exports = S;

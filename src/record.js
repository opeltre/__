let __ = require('./__');

let _r = Record();
    _r.new = Record;

module.exports = _r;

/*------ Records ------

Note: operations could be made chainable:

    let f = _r()
        .map((v, k) => f(v, k))
        .set(k1, v1)
        .set(k2, v2)

    let r1 = f(r0);

This would be a nice balance for the necessity 
to pass the record at the end 

>> Monads
*/

function Record () {

    let my = {};

    //------ record properties ------

    //.keys : {a} -> [str] 
    my.keys = 
        r => Object.keys(r);

    //.isEmpty : {a} -> bool
    my.isEmpty =
        r => my.keys(r).length === 0;
    
    //.null : [str] -> {null} 
    my.null = 
        ks => my.fromPairs(ks.map(k => [null, k]));


    //------ record access ------
    
    //.get : str -> {a} -> a
    my.get = 
        k => r => r[k];

    //.pluck : ...[str] -> {a} -> {a}
    my.pluck = 
        (...ks) => 
            r => my.fromPairs(
                ks.map(k => [r[k], k])
            );

    //.without : ...[str] -> {a} -> {a}
    my.without = 
        (...ks) => __.pipe(
            ...ks.map(k => my.filter((rj, j) => j !== k))
        );


    //------ record update ------

    //.set : str -> a -> {a} -> {a}
    my.set = 
        (k, v) => r => my.write(k, v)(my.assign(r)({}));
    
    //.update : {a} -> {a} -> {a}
    my.update = 
        (...rs) => r => my.assign(r, ...rs)({});

    //.write : str -> a -> St({a}, {a})
    my.write = 
        (k, v) => r => {r[k] = v; return r}; 

    //.assign : str -> a -> St({a}, {a})
    my.assign = 
        (...rs) => r => Object.assign(r, ...rs);


    //------ sequential updates ------

    //         : {a -> b} -> {a} -> {b} 
    my.stream = 
        rf => typeof rf === 'function'
            ? r => rf(r)
            : r => my.map(f => __(f)(r))(rf);

    let stream = 
        rf => typeof rf === 'function'
            ? r => my.update(rf(r))(r)
            : r => my.update(
                my.map(v => __(v)(r))(rf)
            )(r);

    //.streamline : ...[{a -> a}] -> {a} -> {a}  
    my.streamline = 
        (...rfs) => __.pipe(...rfs.map(stream));

    
    //------ record iteration ------

    //.forEach : (a -> _) -> {a} -> Iter(a)
    my.forEach = 
        f => 
            r => my.keys(r).forEach(
                k => f(r[k], k)
            );
    
    //.reduce : ((a -> b), b) -> {a} -> b
    my.reduce = 
        (f, r) => q => 
            my.keys(q).reduce(
                (a, k) => f(a, q[k], k),
                typeof r !== 'undefined' ? r : {}
            );


    //------ record transformation ------
    
    //.apply : {a -> b} -> a -> {b} 
    my.apply = 
        r_f => 
            (...xs) => my.map(__.$(...xs))(r_f);

    //.map : (a -> b) -> {a} -> {b} 
    my.map = 
        (...fs) => as => {
            let bs = {},
                f = __.pipe(...fs);
            Object.keys(as).forEach(k => {
                bs[k] = f(as[k]);
            });
            return bs;
        };

    //.map2 : (a -> b -> c) -> {a} -> {b} -> {c}
    my.map2 = 
        f => 
            (r, q) => my.map(
                (rk, k) => f(rk, q[k], k)
            )(r);

    //.filter : (a -> bool) -> {a} -> {a} 
    my.filter = 
        f => r => {
            let sub = {};
            my.forEach((v, k) => f(v, k) && (sub[k] = v))(r);
            return sub;
        };


    //------ store function values ------
    
    //.compute : (a -> b, a -> str) -> a -> {b}
    my.compute = 
        (f=__.id, g=__.id) => __.pipe(
            __.map((...xs) => [f(...xs), g(...xs)]),
            my.fromPairs 
        );
 

    //------ key-value pairs ------

    //.toPairs : {a} -> [(a, str)]
    my.toPairs = 
        r => {
            let pairs = [];
            my.forEach(
                (rk, k) => pairs.push([rk, k])
            )(r);
            return pairs;
        };

    //.sortBy : (a -> a -> Bool, Bool) -> {a} -> [(a, str)] 
    my.sortBy = (ord, rev) => r => {
        let sorts = (x, y) => x < y ? -1 : (x > y ? 1 : 0),
            sign = m => o => m ? - o : o,
            order;
        // sortBy('!field') 
        if (typeof ord === 'string' && ord[0] === '!' 
            && typeof rev === 'undefined')
            return my.sortBy(ord.slice(1), true)(r);
        // sortBy('field')
        if (typeof ord === 'string') 
            order = ([xi, i], [yj, j]) => sign(rev)(sorts(xi[ord], yj[ord]));
        // sortBy(boolf) 
        else if (typeof ord === 'function')
            order = ([xi, i], [yj, j]) => sign(rev)(ord(xi, yj) ? -1 : 1)
        // sortBy()
        else
            order = ([xi, i], [yj, j]) => sign(ord)(sorts(i, j))
        return my.toPairs(r)
            .sort(order);
    }
    
    //.fromPairs : [(a, str)] -> {a} 
    my.fromPairs = 
        pairs => {
            let r = {};
            (pairs || []).forEach(
                ([rk, k]) => r[k] = rk
            );
            return r;
        };

    return my;
}

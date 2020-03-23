let __ = require('./__');

module.exports = Record;

function Record () {

    let my = {};

    //------ record properties ------

    my.keys = 
        r => Object.keys(r);

    my.isEmpty =
        r => my.keys(r).length > 0


    //------ record access ------
    
    my.get = 
        (...ks) => 
            r => my.fromPairs(
                ks.map(k => [r[k], k])
            );
    
    my.set = 
        (...rs) => 
            r => Object.assign(r, ...rs);

    //------ sequential update ------

    let update = 
        r_f => 
            r => my.set(my.apply(r_f)(r))(r);

    my.update = 
        (...r_fs) => __.pipe(...r_fs.map(update));

    
    //------ record iteration ------

    my.forEach = 
        f => 
            r => my.keys(r).forEach(
                k => f(r[k], k)
            );

    my.reduce = 
        (f, r={}) => 
            q => my.keys(q).reduce(
                (a, k) => f(a, q[k], k),
                r
            );


    //------ record transformation ------
    
    my.apply = 
        r_f => 
            (...xs) => my.map(__.$(...xs))(r_f);

    my.map = 
        f => my.reduce(
            (r, qk, k) => __.do(_ => r[k] = f(qk, k))(r),
            {}
        );

    my.map2 = 
        f => 
            (r, q) => my.map(
                (rk, k) => f(rk, q[k], k)
            )(r);

    my.filter = 
        f => r => {
            let sub = {};
            my.forEach((v, k) => f(v, k) && (sub[k] = v))(r);
            return sub;
        };

    my.without = 
        (...ks) => __.pipe(ks.map(
            k => my.filter((rj, j) => j !== k)
        ));


    //------ store function values ------

    my.compute = 
        (f, g=__.id) => __.pipe(
            __.map((...xs) => [f(...xs), g(...xs)]),
            my.fromPairs 
        );
 

    //------ key-value pairs ------

    my.toPairs = 
        r => {
            let pairs = [];
            my.forEach(
                (rk, k) => pairs.push([rk, k])
            )(r);
            return pairs;
        };

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

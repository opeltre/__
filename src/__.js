/*** __ ***/

let __ = 
    f => xs => f(...xs);

if (typeof module !== 'undefined')
    module.exports = __;


//-------- logic ---------

__.$ = 
    (...xs) => 
        f => f(...xs);

__.val = 
    (f, x) => (!typeof x === 'undefined') ? f(x) : f;


__.null = 
    () => {};

__.id =
    x => x;

__.return = 
    x => () => x;

__.not = 
    b => !b;

__.if = 
    (f, g, h) => 

        (...xs) => f(...xs) ? g(...xs) : h(...xs);


//------- composition and chains ---------

__.pipe = 
    (f=__.id, ...fs) => fs.length
        ? (...xs) =>  __.pipe(...fs)(f(...xs))
        : (...xs) => f(...xs);

__.do = 
    (f=__.id, ...fs) => fs.length
        ? __.pipe(__.do(f), __.do(...fs))
        : x => {f(x); return x} 


//------- arrays and records -------------

__.range =
    n => [...Array(n).keys()];

__.map = 
    (...fs) => 
        arr => Array.isArray(arr)
            ? arr.map(__.pipe(...fs))
            : __.pipe(...fs)(arr);
            
__.toKeys = 
    pairs => {
        let out = {};
        pairs.forEach(
            ([v, k]) => out[k] = v
        )
        return out;
    };

__.toPairs = 
    obj => {
        let out = [];
        __.forKeys(
            (v, k) => out.push([v, k])
        )(obj);
        return out;
    };

__.computeKeys = 
    (v, k) => __.pipe(
        __.map(x => [v(x), k(x)]),
        __.toKeys
    );

__.mapKeys = 
    (...fs) => 
        obj => {
            let obj2 = {};
            Object.keys(obj).forEach(
                k => obj2[k] = __.pipe(...fs)(obj[k], k)
            )
            return obj2;
        };

__.map2Keys = 
    (f, ...fs) => 
        (u, v) => __.mapKeys(
            (uk, k) => f(uk, v[k], k),
            ...fs
        )(u);

__.forKeys = 
    (...fs) => 
        obj => Object.keys(obj).forEach(
            k => __.pipe(...fs)(obj[k], k)
        );

__.setKeys = 
    (f, ...fs) => 
        obj => f 
            ? __.setKeys(...fs)(Object.assign(obj, __.val(f, obj)))
            : obj;

__.subKeys = 
    (...ks) => 
        obj => {
            let sub = {};
            ks.filter(k => (obj[k] !== undefined))
                .forEach(k => sub[k] = obj[k]);
            return sub;
        };

__.emptyKeys =
    obj => {
        let out = true;
        __.forKeys(k => out = false)(obj);
        return out;
    };


//--------- z z z -----------------

__.sleep = 
    ms => new Promise(then => setTimeout(then, ms));

__.log = 
    x => {console.log(x); return x};

__.logs = 
    str => 
        x => {__.log(str || 'logs:'); return  __.log(x)};


//--------- get set ---------------

__.getset = 
    (my, a, as) => getset(getsetArray(my, as), a);


/* getset */

function getset (my, attrs={}) {
    let method = 
        key => function (x) {
            if (!arguments.length)
                return attrs[key];
            attrs[key] = x;
            return my;
        };
    __.forKeys(
        (v, k) => my[k] = method(k)
    )(attrs);
    return my;
}

function getsetArray (my, attrs={}) {
    let method =
        key => function (x, ...xs) {
            if (typeof x === 'undefined')
                return attrs[key];
            if (Array.isArray(x))
                attrs[key] = x;
            else 
                attrs[key] = [...attrs[key], x, ...xs];
            return my;
        };
    __.forKeys(
        (v, k) => my[k] = method(k)
    )(attrs);
    return my;
}


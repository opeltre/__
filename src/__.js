/*** __ ***/

let __ = 
    f => __.xargs(f);

if (typeof module !== 'undefined')
    module.exports = __;


//------ argument application -------

__.$ = 
    (...xs) => f => f(...xs);

__.xargs =
    f => xs => f(...xs);


//------- composition and chains ---------

__.pipe = 
    (f=__.id, ...fs) => fs.length
        ? (...xs) =>  __.pipe(...fs)(f(...xs))
        : (...xs) => f(...xs);

__.do = 
    (f=__.id, ...fs) => fs.length
        ? __.pipe(__.do(f), __.do(...fs))
        : x => {f(x); return x} 

//------ logic ------

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


//------ return or compute value ------

__.val = 
    (f, x) => 
        (typeof f === 'function' && typeof x !== 'undefined')
            ? f(x) 
            : f;


//------- arrays -------------

__.range =
    n => [...Array(n).keys()];

__.map = 
    (...fs) => 
        arr => Array.isArray(arr)
            ? arr.map(__.pipe(...fs))
            : __.pipe(...fs)(arr);
     

__.apply = 
    fs => (...xs) => __.map(__.$(...xs))(fs);


//--------- z z z -----------------

__.sleep = 
    ms => new Promise(then => setTimeout(then, ms));

__.log = 
    x => {console.log(x); return x};

__.logs = 
    str => 
        x => {__.log(str || 'logs:'); return  __.log(x)};


//--------- get set (MOVE) ---------------

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


let __ = require('./__');

//------ cell ------

//       : str -> [I] 
let cell = 
    is => Array.isArray(is) 
        ? is 
        : is.split('.').filter(s => s!== '');

//      : [I] -> str
cell.id =  
    is => Array.isArray(is) 
        ? is.join('.') 
        : is;


//------ chain ------

//        : str -> [[I]]
let chain = 
    as => Array.isArray(as) 
        ? as 
        : as.split(' > ').map(cell);

//       : [[I]] -> str
chain.id =
    as => Array.isArray(as) 
        ? as.map(cell.id).join(' > ') 
        : as;

//         : [[I]] -> [I] 
chain.cell = 
    __.pipe(chain, ch => ch[ch.length - 1]);


//-------
module.exports = {cell, chain};

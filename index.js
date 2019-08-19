let __ = require('./src/__.js'),
    R = require('./src/R'),
    C = require('./src/C'),
    Fourier = require('./src/fourier');

Object.assign(
    __, 
    {R, C, Fourier}
);

module.exports = __;

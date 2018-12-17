const BigNumber = require('bignumber.js')

var obj = module.exports

obj.REAL_FBITS = 64
obj.REAL_ONE = (new BigNumber(2)).pow(obj.REAL_FBITS)

obj.fromReal = function(real) {
  return real.dividedBy(obj.REAL_ONE).toNumber()
}

obj.toReal = function(float) {  
  if (isNaN(float)) {
    throw new Error("NaN cannot be represented in fixed-point!")
  }
  
  if (Math.log2(Math.abs(float)) >= 43) {
    throw new Error("Magnitude of " + float + " is too large for 44 bit signed int!")
  }
  
  return obj.REAL_ONE.times(float.toString())
}

var expect = require('chai').expect
var typeCheck = require('../scripts/type-check')

describe('typeCheck', function () {
  // NOTE: When testing for errors, we must create thunks for the functions, 
  // otherwise the actual errors will be thrown. That's why so many functions
  // are wrapped with arrows
  it('should be a function', function () {
    expect(typeCheck).be.a('function')
  })

  function f (x, y) {return x + y + 1}

  it('should fail when we provide bad input', function () {
    expect(() => typeCheck(['random', '3', 1], () => 1)).to.throw(Error)
    expect(() => typeCheck(['string'], 'this should be a function')).to.throw(Error)
  })

  it('should be able to handle strings', function () {
    var stringF = typeCheck(['string', 'string'], f)
    expect(stringF).to.be.a('function')
    expect(stringF('one', 'one')).to.equal('oneone1')
    expect(() => stringF('one', 2)).to.throw(Error)
    expect(() => stringF(2, 'one')).to.throw(Error)
  })

  it('should be able to handle numbers', function () {
    var numberF = typeCheck(['number', 'number'], f)
    expect(numberF).to.be.a('function')
    expect(numberF(1, 1)).to.equal(3)
    expect(() => numberF(1, 'foo')).to.throw(Error)
    expect(() => numberF('foo', 1)).to.throw(Error)
  })

  it('should be able to handle functions', function () {
    var functionF = typeCheck(['function', 'function'], () => 1)
    var foo = () => '1'
    var bar = (n) => n
    expect(functionF).to.be.a('function')
    expect(functionF(foo, bar)).to.equal(1)
    expect(() => functionF(foo, 1)).to.throw(Error)
    expect(() => functionF(1, bar)).to.throw(Error)
  })

  it('should be able to handle objects', function () {
    var objectF = typeCheck(['object', 'object'], () => 1)
    var foo = {}
    var bar = {hello: 'world'}
    expect(objectF).to.be.a('function')
    expect(objectF(foo, bar)).to.equal(1)
    expect(() => objectF(foo, 1)).to.throw(Error)
    expect(() => objectF(1, bar)).to.throw(Error)
  })

  it('should be able to handle booleans', function () {
    var objectF = typeCheck(['boolean', 'boolean'], () => 1)
    var foo = false
    var bar = true
    expect(objectF).to.be.a('function')
    expect(objectF(foo, bar)).to.equal(1)
    expect(() => objectF(foo, 1)).to.throw(Error)
    expect(() => objectF(1, bar)).to.throw(Error)
  })
})

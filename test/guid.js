const expect = require('chai').expect
const guid = require('../scripts/guid')

describe('guid.js', function () {
  describe('generate', function () {
    it('should be a function', function () {
      expect(guid.generate).to.be.a('function')
    })

    it('should generate random GUIDs', function () {
      expect(guid.generate()).to.be.a('string')
        .and.to.have.lengthOf(36)
    })
  })

  describe('validate', function () {
    it('should be a function', function () {
      expect(guid.validate).to.be.a('function')
    })

    it('should throw errors with bad input', function () {
      var foo = () => 'foo'
      expect(() => guid.validate('not a number', foo)).to.throw(Error)
      // Negative numbers
      expect(() => guid.validate(-100, foo)).to.throw(Error)
      // Non-integer numbers
      expect(() => guid.validate(1.1, foo)).to.throw(Error)
      // Passing a non-function for f
      expect(() => guid.validate(0, 'HELLO')).to.throw(Error)
    })

    const dummyFun1 = (guid) => 'foo'
    const dummyFun2 = (guid, x) => x + 1
    const dummyFun3 = (guid, x) => x + 'hello'

    const safeDummyFun1 = guid.validate(0, dummyFun1)
    const safeDummyFun2 = guid.validate(0, dummyFun2)
    const safeDummyFun3 = guid.validate(0, dummyFun3)

    const testGUID = guid.generate()

    it('should not modify the result of the original function', function () {
      expect(safeDummyFun1(testGUID, 0)).to.be.equal(dummyFun1(testGUID, 0))
      expect(safeDummyFun2(testGUID, 5)).to.be.equal(dummyFun2(testGUID, 5))
      expect(safeDummyFun3(testGUID, ' world')).to.be.equal(dummyFun3(testGUID, ' world'))
    })

    it('should throw errors when the GUID is not valid', function () {
      const badGUID = 'I am totally not a GUID, but I am a String!'
      expect(() => safeDummyFun1(badGUID, 0)).to.throw(Error)
      expect(() => safeDummyFun2(badGUID, 0)).to.throw(Error)
      expect(() => safeDummyFun3(badGUID, 0)).to.throw(Error)
    })
  })
})

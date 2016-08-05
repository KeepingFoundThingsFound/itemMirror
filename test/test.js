var should = require('chai').should()

var foo = true
var bar = 1

// Dummy test just for demonstartion purposes
describe('Good test', function () {
  it('should be true', function () {
    foo.should.be.a('boolean')
    foo.should.be.true
  })
})

describe('Bad test', function () {
  it('should be one', function () {
    bar.should.be.a('number')
    bar.should.equal(2)
  }) 
})

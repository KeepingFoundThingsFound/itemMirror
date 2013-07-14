// chai needed to be loaded through requirejs, or things get confused.
require(['./lib/chai.js'], function(chai){
  window.chai = chai;

  var mochaRun = mocha.run;

  require([
    './spec/ItemMirrorTest.js'
  ], function () {
    mochaRun();
  });

});
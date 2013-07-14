({
  baseUrl: "../scripts",
  name: "ItemMirror",
  out: "../build/ItemMirror.dev.js",
  optimize: "none",
  useStrict: true,
  enforceDefine: true,
  wrap: {
    startFile: ["LICENSE"]
  },
  //Introduced in 2.1.3: Some situations do not throw and stop the optimizer
  //when an error occurs. However, you may want to have the optimizer stop
  //on certain kinds of errors and you can configure those situations via
  //this option
  throwWhen: {
    //If there is an error calling the minifier for some JavaScript,
    //instead of just skipping that file throw an error.
    optimize: true
  }
})
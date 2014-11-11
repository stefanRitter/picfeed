function once (fn) {
  var executed = false;
  
  return function () {
    return executed ? undefined : 
      ((executed = true), fn.apply(this, arguments));
  };
}

var doOnce = once(function () { console.log(this); });

doOnce();
// >> global

doOnce();
// >> undefined

doOnce = once(function () { console.log(this); });

var fromObject = { print: doOnce };

fromObject.print();
// >> { print: [Function] }

fromObject.print();
// >> undefined

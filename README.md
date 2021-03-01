# xml-http-promise

> Instrumentation retrofitting an XMLHttpRequest like interface on Promises

XMLHttpRequest was one of the first times an asynchronous process was modelled in JavaScript.

As it turns out, it has a number of really nice capabilities:

1. You can watch the xhr object advance, by checking it's `readyState` or via `onreadystatechange`.
   i. the onreadystatechange handler gets a reference to the xhr object.
2. `response` is synchronously available on the xhr object.
3. `status` says whether the xhr suceeded.
4. `timeout` behavior provided

All in all, this is a much more information-rich environment than EcmaScript Promises. This library
is a prototype set of instrumentation that takes a Promise-class like Fetch & enhances the fetch
promise with XMLHttpRequest like behaviors.

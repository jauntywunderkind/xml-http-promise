# xml-http-promise

> Instrumentation retrofitting an XMLHttpRequest like interface on Promises

A non-serious experiment giving arbitrary (non http transfer related) promises interfaces that
looked alike XMLHttpRqeuest. Where-as modern JavaScript like Fetch fully close over the http
transferring process, old Object-Oriented design favored creating a a model for the http-transfer
and creating an operational interface/controls on that model. This library explores,
what if we tried modelling our asynchronous processes our. In this case, it does so by
creating an XMLHttpRequest like interface atop existing Promise functions.

Some of the noted controls on the XHR object:

1. You can watch the xhr object advance, by checking it's `readyState` or via `onreadystatechange`.
   i. the onreadystatechange handler gets a reference to the xhr object.
2. `response` is synchronously available on the xhr object.
3. `status` says whether the xhr suceeded.
4. `timeout` behavior provided

All in all, this is a much more information-rich environment than EcmaScript Promises.

const SYMBOL= Symbol.for( "xml-http-promise")
const SYMBOL_PROPS= Symbol.for( "xml-http-promise:props")
const ABORT_SIGNAL= typeof AbortSignal!== "undefined"&& AbortSignal

function open(){
}

/**
* Tell the promise that someone wants a response
*/
function send(){
	if( this.readyState> 0){
		return
	}
	this.then()
}

function abort(){
	if( this.readyState> 1){
		return
	}
	this.readyState= 4
	this.onabort && this.onabort({ target: this})
	const props= this[ SYMBOL_PROPS]
	if( props){
		// this feels incredibly crude / ugly
		props.aborted= true

		if( props.signal){
			// TODO: read-only, so this hack will not work! we'd need to proxy bah
			props.signal.aborted= true
			// this should usually work
			props.signal.onabort && props.signal.onboart.call( this)
			// this might work
			props.signal.dispatchEvent && props.signal.dispatchEvent(new Event( "abort"))
		}
	}

	// TODO: timeouts and abort do not currently affect resolve or reject at all & this seems unwell
	// huge downside: we'd always need to instrument!
}

function makeXhpConstructor( p){
	return function xhp( ...args){
		const self= new xhpConstructor( ...args)
		// TODO: evil (great) thought, we could define 2->3 as floating point indicating progress of computation
		self.readyState= 0
		self[ SYMBOL]= p[ SYMBOL]

		const signal= ABORT_SIGNAL&& args[0]&& args[0].signal
		if( signal){
			// see note in abort(), we are sadly forced to proxy this
			// really wish we had the AbortController itself so we could actuate it with our own abort() directly
			self[ SYMBOL_PROPS]= { signal}
		}

		Object.defineProperties( self, {
			abort: {
				value: abort
			},
			open: {
				value: open
			},
			send: {
				value: send
			},
			timeout: {
				set: function( val){

					const props= this[ SYMBOL_PROPS]|| (this[ SYMBOL_PROPS]= {})
					props.timeout= val

					// if we're not running, don't try to set up timeout machinery
					if ( !(this.readyState > 0)) {
						return
					}

					if( props.timeoutHandle){
						clearTimeout( props.timeoutHandle)
					}

					// so we can adjust timeout. note that run time when no timeout is set is never counted
					if( !props.start){
						props.start= Date.now()
					}else{
						// adjust timeout by whatever time has passed
						timeout= props.start - Date.now() + timeout
						if( timeout< 0){
							// has already tripped
							_timeout.call( this)
							return	
						}
					}
					props.timeoutHandle= setTimeout( _timeout.bind( this), timeout)
					
				},
				get: function(){
					const props= this[ SYMBOL_PROPS]|| (this[ SYMBOL_PROPS]= {})
					return props.timeout
				}
			}
		})
		return self
	}
}

/**
* Advance `readyState` to a specified `to` if not there yet
*/
function _ratchetReadyState( self, to){
	const old= self.readyState
	if( !( old> to)){
		self.readyState= to
		if (self.onreadystatechange) {
			// TODO: after we update state!
			self.onreadystatechange({ target: self })
		}

		if( old){
			return true
		}

		this.timeout= this.timeout
		return true
	}
	return false
}

function _timeout(){
	if( this.readyState>= 4){
		return
	}

	this.readyState= 4
	this.ontimeout && this.ontimeout({ target: this})

	// i dont see xhr doing so but i would prefer exposing this status
	// and ideally not kind of tucked away, like this
	this[ SYMBOL_PROPS] && (this[ SYMBOL_PROPS].timedout= true);
}


/**
* A handler for resolve or reject
*/
function xhpHandler( val){
	if( _ratchetReadyState( this.self, 4)){
		if( this.field) {
			this.self[ this.field]= val
			this.self.status= this.status
		}
		const got= this.handler&& this.handler.call( null, val)
		if( got&& this.throw){
			throw got;
		}
		return got
	}
}

/**
* The first time someone asks the promise to resolve, we sweep in and build some
* intercepting handlers that monitor the promise's execution
*/
function _instrument( self, res, rej){
	res= xhpCapture.bind({ self, field: "response", handler: res, status: 200 })
	rej= xhpCapture.bind({ self, field: "responseError", handler: rej, status: 400, throw: true })
	return self[ SYMBOL].then( res, rej)
}

function xhpCatch( rej){
	if (_ratchetReadyState( this, 1)){
		return _instrument( this, null, rej)
	}
	return this[ SYMBOL].catch( rej)
}

function xhpFinally( fn){
	if( _ratchetReadyState( this, 1)){
		_instrument( this)
	}
	return this[ SYMBOL].finally( fn)
}

function xhpThen( res, rej){
	if( _ratchetReadyState( this, 1)){
		return _instrument( this, res, rej);
	}
	return this[ SYMBOL].then( res, rej)
}

/**
* Take a constructor & yield a wrapped constructor that exhibits XHP/XHR-alike behaviors
*/
function wrap( p){
	p[ SYMBOL]= {
		catch: p.catch,
		finally: p.finally,
		then: p.then
	}
	p.catch= xhpCatch
	p.finally= xhpFinally
	p.then= xhpFinally
	return makeXhpConstructor( p)
}

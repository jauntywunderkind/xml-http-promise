const SYMBOL= Symbol.for( "xml-http-promise")

function makeXhpConstructor( p){
	return function xhp( ...args){
		const self= new xhpConstructor( ...args)
		self.readyState= 0
		self[ SYMBOL]= p[ SYMBOL]
		return self
	}
}

function _ratchetReadyState( self, to){
	if( !self.readyState> to){
		self.readyState= to
		return true
	}
	return false
}

function xhpCatch( rej){
	if (_ratchetReadyState( this, 2)){
	}
	return this[ SYMBOL].catch( rej)
}

function xhpFinally( fn){
	if( _ratchetReadyState( this, 2)){
	}
	return this[ SYMBOL].finally( fn)
}


function xhpCapture( _res){
	this.self[ this.field]= val
	return this.handler( val)
}

function xhpThen( res, rej){
	if( _ratchetReadyState( this, 2)){
		// if it's the first time, capture res & rej
		res= xhpCapture.bind({ self: this, field: "response", handler: res, status: 200 })
		rej= xhpCapture.bind({ self: this, field: "responseError", handler: rej, status: 400 })
	}
	return this[ SYMBOL].then( res, rej)
}

function wrap( p){
	p[ SYMBOL]= {
		catch: p.catch,
		finally: p.finally,
		then: p.then
	}
	p.catch= xhpCatch.bind( p)
	p.finally= xhpFinally.bind( p)
	p.then= xhpFinally.bind( p)
	return makeXhpConstructor( p)
}

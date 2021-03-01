const SYMBOL= Symbol.for( "xml-http-promise")

function xhpConstructor( ..args){
	const self= new xhpConstructor( ...args)
	self.readyState= 0
	return self
}

function _ratchetReadyState( self, to){
	if( !self.readyState){
		self.readyState= to
	} else if( self.readyState< to){
		self.readyState= to
	}
}

function xhpCatch( rej){
	_ratchetReadyState( this, 2)
	return this[ SYMBOL].catch( rej)
}

function xhpFinally( fn){
	_ratchetReadyState( this, 2)
	return this[ SYMBOL].finally( fn)
}

function xhpThen( res, rej){
	_ratchetReadyState( this, 2)
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
	return p
}

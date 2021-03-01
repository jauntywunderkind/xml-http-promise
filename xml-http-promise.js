const SYMBOL= Symbol.for( "xml-http-promise")

function xhpCatch( rej){
	return this[ SYMBOL].catch( rej)
}

function xhpFinally( fn){
	return this[ SYMBOL].finally( fn)
}

function xhpThen( res, rej){
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

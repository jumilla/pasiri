
var fetch;

if (typeof window !== 'undefined') {
	// supported browser
	if (typeof window.fetch !== 'undefined') {
		fetch = window.fetch
	}
	// non supported browser
	else {
		require('whatwg-fetch')
		fetch = self.fetch
	}
}
else {
	// node
	global.self = {}
	require('whatwg-fetch')
	fetch = self.fetch
}



var QS = require('qs')



var mocks = {}

mocks.request = function (method, url, callback) {
	var mock = {
		method: method,
		url: url,
		callback: callback,
	}

	this[method + ':' + url] = mock

	return this;
}

mocks.get = function (url, callback) {
	return this.request('GET', url, callback)
}

mocks.post = function (url, callback) {
	return this.request('POST', url, callback)
}

mocks.put = function (url, callback) {
	return this.request('PUT', url, callback)
}

mocks.delete = function (url, callback) {
	return this.request('DELETE', url, callback)
}

mocks.match = function (url, options) {
	return this[options.method + ':' + url]
}

mocks.invoke = function (mock, url, options) {
	var promise = new Promise(function (resolve, reject) {
		try {
			var result = mock.callback(options.data, {
				resolve: resolve,
				reject: reject,
			})

			if (typeof result !== 'undefined') {
				var response
				if (Response.prototype.isPrototypeOf(result)) {
					response = result
				}
				else {
					if (typeof result === 'array') {
						response = new Response(JSON.stringify(result))
					}
					else if (typeof result === 'object' && Object.prototype.isPrototypeOf(result)) {
						response = new Response(JSON.stringify(result))
					}
					else if (typeof Response.prototype.isPrototypeOf(result)) {
						response = result
					}
					else {
						response = new Response(result)
					}
				}

				resolve(response)
			}
		}
		catch (e) {
			reject(e)
		}
	})

	return promise
}



function Request(method, url, args) {
	this.method = method.toUpperCase()
	this.url = url
	this.headers = {}
	this.args = args || {}

	return this
}

Request.prototype.header = function (name, value) {
	this.headers[name] = value

	return this
}

Request.prototype.data = function (data) {
	this.data = data

	return this
}

Request.prototype.send = function () {
	var url, body

	url = this.url

	if (this.method === 'GET') {
		if (typeof this.data !== 'undefined') {
			url += '?' + QS.stringify(this.data)
		}
	}
	else {
		if (typeof this.data !== 'undefined') {
			if (typeof this.data === 'string') {
				this.headers['Content-Type'] = 'text/plain'
				body = this.data
			}
			else if (Blob.prototype.isPrototypeOf(body)) {
				this.headers['Content-Type'] = 'application/octet-stream'
				body = this.data
			}
			else if (FormData.prototype.isPrototypeOf(body)) {
				this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
				body = this.data
			}
			else {
				this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
				body = QS.stringify(this.data)
			}
		}
	}

	var args = {
		method: this.method,
		headers: new Headers(this.headers),
		body: body,
		mode: 'cors',
		credentials: 'same-origin',			// use Cookie
	}

	for (var key in this.args) {
		args[key] = this.args[key]
	}

	args.data = this.data

	return fetchOrMock(url, args)
}

Request.prototype.fetch = function (callback) {
	return this.send()
		.then(callback)
}

Request.prototype.fetchResponse = function (callback) {
	return this.send()
		.then(callback)
}

Request.prototype.fetchText = function (callback) {
	return this.send()
		.then(function (response) {
			return response.text()
		})
		.then(callback)
}

Request.prototype.fetchJson = function (callback) {
	return this.fetch()
		.then(function (response) {
			return response.json()
		})
		.then(callback)
}

function fetchOrMock(url, args) {
	var mock
	if (mock = mocks.match(url, args)) {
		return mocks.invoke(mock, url, args)
	}
	else {
		return fetch(url, args)
	}
}

Request.prototype.then = function (success, failure) {
	return this.fetch().then(success, failure)
}

Request.prototype.catch = function (failure) {
	return this.fetch().catch(failure)
}



var agent = (function (fetch) {
	var object = {
	}

	object.mock = function (options) {
		if (options) mocks.options = options

			if (options) {
				fetch = self.fetch
			}

		return mocks
	}

	object.request = function (method, url, args) {
		return new Request(method, url, args)
	}

	object.get = function (url, args) {
		return this.request('GET', url, args)
	}

	object.post = function (url, args) {
		return this.request('POST', url, args)
	}

	object.put = function (url, args) {
		return this.request('PUT', url, args)
	}

	object.delete = function (url, args) {
		return this.request('DELETE', url, args)
	}

	object.fetch = function (url, args) {
		return fetchOrMock(url, url, args)
	}

	return object;
}(fetch))

module.exports = agent

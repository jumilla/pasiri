
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



var mocks = (function () {
	var object = {}

	object.request = function (method, url, callback) {
		var mock = {
			method: method,
			url: url,
			callback: callback,
		}

		this[method + ':' + url] = mock

		return this;
	}

	object.get = function (url, callback) {
		return this.request('GET', url, callback)
	}

	object.post = function (url, callback) {
		return this.request('POST', url, callback)
	}

	object.put = function (url, callback) {
		return this.request('PUT', url, callback)
	}

	object.delete = function (url, callback) {
		return this.request('DELETE', url, callback)
	}

	object.match = function (url, options) {
		var key = options.method + ':' + url.split('?')[0];
		return this[key]
	}

	object.invoke = function (mock, url, options) {
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

	return object
}())



var Request = (function () {
	var _method, _url, _headers, _data, _args

	function Request(method, url, args) {
		_method = method.toUpperCase()
		_url = url
		_headers = {}
		_args = args || {}

		return this
	}

	Request.prototype.header = function (name, value) {
		_headers[name] = value

		return this
	}

	Request.prototype.headers = function (dictionary) {
		_headers = dictionary

		return this
	}

	Request.prototype.data = function (data) {
		_data = data

		return this
	}

	Request.prototype.send = function () {
		var url, body

		url = _url

		if (_method === 'GET') {
			if (typeof _data !== 'undefined') {
				url += '?' + QS.stringify(this.data)
			}
		}
		else {
			if (typeof _data !== 'undefined') {
				if (typeof _data === 'string') {
					_headers['Content-Type'] = 'text/plain'
					body = _data
				}
				else if (Blob.prototype.isPrototypeOf(body)) {
					_headers['Content-Type'] = 'application/octet-stream'
					body = _data
				}
				else if (FormData.prototype.isPrototypeOf(body)) {
					_headers['Content-Type'] = 'application/x-www-form-urlencoded'
					body = _data
				}
				else {
					_headers['Content-Type'] = 'application/x-www-form-urlencoded'
					body = QS.stringify(_data)
				}
			}
		}

		var args = {
			method: _method,
			headers: new Headers(_headers),
			body: body,
			mode: 'cors',
			credentials: 'same-origin',			// use Cookie
		}

		for (var key in _args) {
			args[key] = _args[key]
		}

		args.data = _data

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
		return this.send()
			.then(function (response) {
				return response.json()
			})
			.then(callback)
	}

	Request.prototype.then = function (success, failure) {
		return this.send().then(success, failure)
	}

	Request.prototype.catch = function (failure) {
		return this.send().catch(failure)
	}

	return Request
}())



function fetchOrMock(url, args) {
	var mock
	if (mock = mocks.match(url, args)) {
		return mocks.invoke(mock, url, args)
	}
	else {
		return fetch(url, args)
	}
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
		return fetchOrMock(url, args)
	}

	return object;
}(fetch))

module.exports = agent

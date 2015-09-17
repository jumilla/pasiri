
# Pasiri

**Fetch or Mock ?**

Flexible request agent for client-side.
Includes HTTP request mock.

Use [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API)

## Installation

### for Browser

Download [pasiri.min.js](https://raw.githubusercontent.com/jumilla/pasiri/master/dist/pasiri.min.js) (master)

or

Bower

```sh
bower install pasiri --save
```



### for Node

```sh
npm install pasiri --save
```



## Usage

### 1. Fetch

#### GET

```javascript

pasiri.get('/user/orders')
	.fetchText(function (text) {
		console.log(text)
	})
	.catch(function (error) {
		console.error(error)
	})
```

#### POST

```javascript

pasiri.post('/user/orders')
	.header('X-CSRF-TOKEN', csrf_token)
	.data({
		'coffee': 2,
		'kouign amann': 1,
	})
	.fetchJson(function (json) {
		console.log(json)
	})
	.catch(function (error) {
		console.error(error)
	})
```

```javascript

pasiri.post('/user/orders')
	.header('X-CSRF-TOKEN', csrf_token)
	.data(new FormData(document.querySelector('#form')))
	.fetchJson(function (json) {
		console.log(json)
	})
	.catch(function (error) {
		console.error(error)
	})
```

#### GET with search parameters

```javascript

pasiri.get('/search')
	.data({
		q: 'word1 word2',
	})
	.fetchJson(function (json) {
		console.log(json)
	})
	.catch(function (error) {
		console.error(error)
	})
```

#### Use response

```javascript

pasiri.get('/search')
	.data({
		q: 'word1 word2',
	})
	.fetch(function (response) {
		console.log('Status', response.status)
		return response.json()
	})
	.then(function (json) {
		console.log(json)
	})
	.catch(function (error) {
		console.error(error)
	})
```


### 2. Mock

#### Application API mock

```javascript

pasiri.mock()
	.get('/user/orders', function(data) {
		return {'coffee': 1, 'tea': 1}
	})

```

`pasiri.mock().get(url, callback)` is same as `pasiri.mock().request('GET', url, callback)`.

```javascript

pasiri.mock()
	.post('/user/orders', function(data) {
		app.orders.push(data)

		return {result: 'OK'}
	})

```

When return HTTP status code, use [Response](https://developer.mozilla.org/ja/docs/Web/API/Response).

```javascript

pasiri.mock()
	.put('/user/orders/123', function(data) {
		return new Response({
			status: 400,
			headers: {
			},
		}, 'Invalid argument')
	})

```

#### External server API mock

```javascript

pasiri.mock()
	.get('https://api.github.com/user/orgs', function(data) {
		return [
			{
				home_url: 'http://...',
				avatar_url: 'http://...',
			}
		]
	})

```

## License

[MIT](http://opensource.org/licenses/MIT).

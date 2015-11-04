# DevKit-ES6

A JS library to work with the Olapic API.

[![Build Status](https://travis-ci.org/olapic/DevKit-ES6.svg?branch=master)](https://travis-ci.org/olapic/DevKit-ES6) [![Coverage Status](https://coveralls.io/repos/olapic/DevKit-ES6/badge.svg?branch=master&service=github)](https://coveralls.io/github/olapic/DevKit-ES6?branch=master) [![Documentation Status](https://doc.esdoc.org/github.com/olapic/DevKit-ES6/badge.svg)](https://doc.esdoc.org/github.com/olapic/DevKit-ES6/) [![Dev dependencies status](https://david-dm.org/olapic/DevKit-ES6/dev-status.svg)](https://david-dm.org/olapic/DevKit-ES6#info=devDependencies)

Built with [ES6](http://es6-features.org/#Constants), and compiled with [Babel](http://babeljs.io), DevKit makes working with the Olapic API something really **easy and simple**. Forget about endpoints and query strings, just think about entities. Let's take a look at a simple example so you get the idea:

I want to list the photos from an specific stream:

```javascript
// Import the required classes from DevKit
import {
	OlapicDevKit,
	OlapicBatch
} from 'DevKit-ES6';

// Connect the DevKit instance using your API KEY.
OlapicDevKit.getInstance('<YOUR-API-KEY>').connect()
.then((customer) => {
    // Search for a stream (it returns a Promise).
	return customer.searchStream('my-stream-key');
})
.then((stream) => {
    // Now that you have the stream, you can create a batch for that entity.
    // Fetch the media from the stream.
	return new OlapicBatch(stream).fetch();
})
.then((list) => {
    // Done, you have a list of media for the selected stream.
	list.forEach((media) => {
		console.log(media.get('images/mobile'));
	});
})
.catch((error) => {
    // An of course, if there's an error, show it!.
	console.log('Error ', error);
})
```

That was easy right? Well, that the whole point of DevKit :)

## Installation
You can install DevKit using [npm](https://www.npmjs.com/).

    npm install devkit-es6 --save_dev

## Basic usage

This is a quick overview of how DevKit works, for the full documentation, you can go to our [ESDoc page](https://doc.esdoc.org/github.com/olapic/DevKit-ES6/).

### The classes

Before you do anything with DevKit, you need the load the DevKit JS classes index, which gives you an object with all the DevKit classes, so you can just import it and deconstruct the ones you need:

```javascript
import {
    OlapicDevKit,
    OlapicBatch,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicCategoriesHandler,
    OlapicCategoryEntity,
    OlapicCustomersHandler,
    OlapicCustomerEntity,
    OlapicMediaHandler,
    OlapicMediaEntity,
    OlapicMediaBatch,
    OlapicStreamsHandler,
    OlapicStreamEntity,
    OlapicUsersHandler,
    OlapicUserEntity,
    OlapicWidgetsHandler,
    OlapicWidgetEntity,
    OlapicRestClient,
    OlapicUtils,
} from 'DevKit-ES6';
```

Before moving to the next part, let's do a quick review of each class:

| Class                     | Short Description                            |
|---------------------------|----------------------------------------------|
| `OlapicDevKit`            | The main singleton of the library.           |
| `OlapicBatch`             | An interface for entities collections.       |
| `OlapicEntity`            | An interface for entities objects.           |
| `OlapicEntitiesHandler`   | An interface for the entities handlers.      |
| `OlapicCategoriesHandler` | The categories entities handler.             |
| `OlapicCategoryEntity`    | The categories entity.                       |
| `OlapicCustomersHandler`  | The customer entities handler.               |
| `OlapicCustomerEntity`    | The customer entity.                         |
| `OlapicMediaHandler`      | The media entities handler.                  |
| `OlapicMediaEntity`       | The media entity.                            |
| `OlapicMediaBatch`        | Manage media entities collections.           |
| `OlapicStreamsHandler`    | The streams entities handler.                |
| `OlapicStreamEntity`      | The stream entity.                           |
| `OlapicUsersHandler`      | The users (uploaders) entities handler.      |
| `OlapicUserEntity`        | The user entity.                             |
| `OlapicWidgetsHandler`    | The Olapic widget entities handler.          |
| `OlapicWidgetEntity`      | The Olapic widget entity.                    |
| `OlapicRestClient`        | The object in charge of the API connections. |
| `OlapicUtils`             | A set of utitliy methods for the library.    |

### Connection

In order to have access to the Olapic API entities, you first need to connect DevKit using your Olapic API Key:

```javascript
import {OlapicDevKit} from 'OlapicDevKit';

OlapicDevKit.getInstance('<YOUR-API-KEY>').connect()
.then((customer) => {
	console.log('Hello ', customer.get('name'));
})
.catch((error) => {
	console.log('Error ', error);
})
```

The `OlapicDevKit` object it's the main singleton of the library and because it's a singleton, you can't instantiate it using the `new` keyword, so you use the `getInstance()` method. As you can see, this method can also be used to set the your API Key, and once that's set, just call `connect()`, which will return a `Promise` object that when resolve will give you your first entity: The customer.

If you read the example from the the first section, you'll probably be getting the idea for now: entities are connected, and once you have one (like the customer), you can use its methods to connect with other data sources (like streams).

### Handlers

Handlers are abstract classes with a set of static methods that allows you to create, parse and obtain entities. For example, DevKit will connect the API and obtain a media entity, but it can't just return it directly to you, there's a lot of information that would be unnecessary for you and other that makes sense on a REST environment. So DevKit sends this raw API response to a handler and the handler takes care of parsing the data, wrapping it on an entity object and returning it to you when its ready to be used.

Most of the handlers methods are used internally by DevKit, but they also have a couple of methods that can help you access entities that are not directly related to the ones you have access to: `get{Entity}ByID()` and `get{Entity}ByUrl()`. Those methods go directly to the API without needing any other entity.

There are currently six handler classes, one for each entity type:

- `OlapicCategoriesHandler`
- `OlapicCustomersHandler`
- `OlapicMediaHandler`
- `OlapicStreamsHandler`
- `OlapicUsersHandler`
- `OlapicWidgetsHandler`

### Entities

These are the most basic type of data in DevKit and represent singular objects from the API. Entities objects have two different types of methods:

- Methods that are just a _reflex_ of the handlers methods. Like `OlapicMediaEntity.getUser()`, which it's actually a call to `OlapicMediaHandler.getMediaUser()`.
- The `get()` method. This one doesn't use the handler and it's just a _friendly interface_ for accessing properties using a _path-like_ format. For example, assuming `m` it's an `OlapicMediaEntity`, `m.get('images/mobile')` would be the same as calling `m.data.images.mobile` (`data` it's where all the entity properties are stored).

### Batches

Batches are entities collections, and right now there's only one type of batches: The media batch. Most of the entities have a media batch associated, so you just need an entity in order to instantiate a media batch:

```javascript
const batch = new OlapicMediaBatch(entity);
```

The way batches work it's very simple, you have three methods to get the media, and they all return the same promise, an `Array` of `OlapicMediaEntity`:

- `.fetch()`: This loads the first page of the batch.
- `.next()`: It loads the next page of the batch.
- `.prev()`: It loads the previous page of the batch.

## Extra

### ES5

Yes, DevKit was built to work with ES6, but if you are still transitioning, we also generate an ES5 build, you just need to `require('DevKit-ES6/es5')` and you'll be good to go!.

## Development

### Install Git hooks

    ./hooks/install

### npm tasks

| Task               | Description                                                        |
|--------------------|--------------------------------------------------------------------|
| `npm start`        | Start the test server                                              |
| `npm run build`    | Generate a new build of the library.                               |
| `npm test`         | Run the [Jest](https://facebook.github.io/jest/) unit tests suite. |
| `npm run lint`     | Lint the plugin's code with [JSCS](http://jscs.info) and [ESLint](https://github.com/eslint/eslint).    |
| `npm run coverage` | Run the unit tests and open the coverage report on the browser.    |
| `npm run docs`     | Generate the project documentation with [ESDoc](http://esdoc.org). |

### Quick start

1. Run `npm start`.
2. Open `./demo/index.js` and start playing.

### Built with...

- [Babel](https://babelio.js): Compile ES6 code to ES5 compatible.
- [Gulp](http://gulpjs.com/): Manage the project tasks (`build`, `serve`, `lint`, and `docs`).
- [Jest](https://facebook.github.io/jest/): Facebook test suite for ES6 built in top of [jasmine](jasmine.github.io).
- [Coveralls](https://coveralls.io): Track the code coverage generated by Jest.
- [Bundlerify](https://github.com/homer0/gulp-bundlerify): A set of tools for easy running and deployment of ES6 apps.
- :heart: from the [Olapic](https://olapic.com) Frontend team.

## Version History

#### 1.0.0

Initial version of DevKit.

## License

MIT. [License file](./LICENSE).

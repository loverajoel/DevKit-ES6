
/**
 * Handles all the connections between DevKit and the Olapic API.
 * This class is instantiated by the DevKit singletion and saved on the `rest`
 * property.
 * @see {OlapicDevKit}
 */
export default class OlapicRestClient {
    /**
     * Rest client class constructor.
     */
    constructor() {
        /**
         * A flag to determine if it should show debug messages on the console.
         * @type {boolean}
         */
        this.debug = false;
        /**
         * A flag to determine if the pre cache it's enabled.
         * @type {boolean}
         */
        this.preCacheEnabled = false;
        /**
         * A flag to determine if the urls on the pre cache should be cleaned from
         * the Olapic CDN sharding pattern.
         * @type {boolean}
         */
        this.filterSharding = true;
        /**
         * A regex used to remove the sharding pattern from the pre cache urls.
         * @type {RegExp}
         */
        this.shardingPattern = /z?[z0-9]?(photorankmedia|photorankapi)\-a\./g;
        /**
         * This object will store all the pre cache entries using their urls as key.
         * @type {Object}
         */
        this.preCache = {};
        /**
         * For the pre cache to be executed after a request, the endpoint has to match this
         * expression.
         * @type {RegExp}
         */
        this.preCacheEndpoints = /\/(media|stream|users)\/([0-9]+|recent)\?/g;
        /**
         * A list of the embedded properties that can be pre cached.
         * @type {Array}
         */
        this.preCacheEmbeddedProperties = [
            'base_image',
            'cover_media',
            'streams:all',
            'categories:all',
            'media',
        ];
        /**
         * An extra validation for the embedded properties that can be pre cached. This is
         * optional, and if a property is listed, the main endpoint (where the request was made)
         * should match against the specified expression.
         *
         * @example
         * .preCacheEmbeddedPropertiesPerEndpoint = {
         *     'streams:all': /\/media\/[0-9]+\?/g,
         * }
         *
         * @type {Object}
         */
        this.preCacheEmbeddedPropertiesPerEndpoint = {};
        /**
         * A list of entities which names will be replaced when they are retrieved from the pre
         * cache.
         *
         * @example
         * .preCacheEntityNamesReplacement = {
         *     base_image: 'media',
         *     cover_media: 'media',
         * }
         *
         * @type {Object}
         */
        this.preCacheEntityNamesReplacement = {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            base_image: 'media',
            cover_media: 'media',
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        };
        /**
         * The pre cache saves the metadata of the current request
         * so it can be injected on entries when they're retrieved.
         * @type {Object}
         * @private
         * @ignore
         */
        this._currentMetadata = {};
        /**
         * The base query string for every request. This is used by DevKit to include the API key
         * so it doesn't need to be added every time `.get()` it's called.
         * @type {Object}
         * @private
         * @ignore
         */
        this._baseQuery = {};
        /**
         * The base headers for every request. They work exactly as `._baseQuery` but for headers.
         * @type {Object}
         * @private
         * @ignore
         */
        this._baseHeaders = {};
        /**
         * A list of the options that can be edited and obtained using `setOption`, `setOptions`
         * and `getOptions`.
         * @type {Array}
         * @private
         * @ignore
         */
        this._accessibleOptions = [
            'debug',
            'preCacheEnabled',
            'filterSharding',
            'shardingPattern',
            'preCache',
            'preCacheEndpoints',
            'preCacheEmbeddedProperties',
            'preCacheEmbeddedPropertiesPerEndpoint',
            'preCacheEntityNamesReplacement',
        ];
        /**
         * The fetch polyfill required to make the requests. It can be set with `setFetchObject`
         * and in a development environment, it wouldn't be necessary thanks to the native `fetch`
         * object, but for unit tests, this would be a stub to intercept the requests.
         * @type {Object}
         * @private
         * @ignore
         */
        this._fetchObject = null;
    }
    /**
     * Converts a JS objet into a query string.
     * @example
     * // Returns '?a=b&c=d'
     * ._objectToQueryString({
     *     a: 'b',
     *     c: 'd',
     * });
     *
     * @param  {Object} obj - The query string parameters names and their values.
     * @return {string} A valid query string.
     * @private
     * @ignore
     */
    _objectToQueryString(obj) {
        let query = '';
        Object.keys(obj).forEach((key, index) => {
            query += (index === 0 ? '?' : '&') + key + '=' + obj[key];
        });

        return query;
    }
    /**
     * Merges the existing base of parameters({_baseQuery}) with a given list so they can later be
     * converted on to a valid query string with {_objectToQueryString}.
     * @param  {Object} [query={}] - The new list of parameters that need to be merged into base
     *                               the list.
     * @return {Object} The merged list of parameters.
     * @private
     * @ignore
     */
    _parseQuery(query = {}) {
        return Object.assign(this._baseQuery, query);
    }
    /**
     * Parse a url with a list of parameters in order to remove duplicated values from the list
     * that are already in the query string.
     * @param  {string} url   The target url.
     * @param  {Object} query The parameters list for the query string. {_parseQuery} will be used
     *                        on the list.
     * @return {string}       The parsed url with it's final query string.
     * @private
     * @ignore
     */
    _parseUrl(url, query = {}) {
        query = this._parseQuery(query);
        const keys = Object.keys(query);
        if (keys.length) {
            keys.forEach((key) => {
                if ((new RegExp('[?|&]' + key + '=')).test(url)) {
                    delete query[key];
                }
            }, this);
        }

        return url + this._objectToQueryString(query);
    }
    /**
     * Merges the existing base of headers({_baseHeaders}) with a given list.
     * @param  {Object} [headers={}] - The new list of headers that need to be merged into base
     *                                 the list.
     * @return {Object} The merged list of headers.
     * @private
     * @ignore
     */
    _parseHeaders(headers = {}) {
        return Object.assign(this._baseHeaders, headers);
    }
    /**
     * Makes an actual request to the Olapic API.
     * @example
     * const {newUrl, fetchCall} = ._fetch('media/recent', {count: 20});
     * console.log('Request to ', newUrl);
     * fetchCall().then((response) => {
     *     console.log(response);
     * });
     *
     * @param  {string} url     - The request url.
     * @param  {Object} query   - The parameters for the query string.
     * @param  {Object} headers - The headers for the request.
     * @param  {String} method  - The request method.
     * @param  {Object} body    - A request body in case it's a post.
     * @return {Object} The generated url and the call for the request.
     * @property {string} newUrl the generated url.
     * @property {Function} fetchCall The request to be made.
     * @private
     * @ignore
     */
    _fetch(url, query = {}, headers = {}, method = 'get', body = {}) {
        url = this._parseUrl(url, query);
        return {
            newUrl: url,
            fetchCall: (() => {
                const args = {
                    headers: this._parseHeaders(headers),
                    method: method,
                };
                if (method == 'post' && Object.keys(body).length) {
                    args.body = JSON.stringify(body);
                }

                return this.getFetchObject()(url, args);
            }).bind(this),
        };
    }
    /**
     * Checkes whether an option is editable/accessible via the `getOption`, `setOptions` and
     * `setOptions` method.
     * @param  {string}  option - The name of the option to check.
     * @return {boolean} Whether the option is editable/accessible.
     * @private
     * @ignore
     */
    _isOptionAccessible(option) {
        return this._accessibleOptions.indexOf(option) > -1;
    }
    /**
     * Detect embedded elements on an object and save them on the pre cache.
     * @param  {Object} data        - The data to evaluate. This can be the `data` property of an
     *                                API request response or the content of an already saved
     *                                property (it runs recursively).
     * @param  {string} endpointURL - The main request url.
     * @private
     * @ignore
     */
    _detectEmbeddedItems(data, endpointURL) {
        // Only parse content with the 'embedded' property.
        if (data._embedded && Object.keys(data._embedded).length) {
            // Loop the 'embedded' property...
            Object.keys(data._embedded).forEach((entity) => {
                const embeddedEntity = data._embedded[entity];
                // Validate if it can be pre cached.
                if (data._links && data._links.self) {
                    // Detect the '_fixed' flag.
                    if (embeddedEntity && embeddedEntity._fixed) {
                        // Check if the embedded content is an array.
                        const embeddedArray = this._isEmbeddedArray(embeddedEntity);
                        // Check if it can be pre cached or it should skipt it and go
                        // for its children.
                        if (this._canBePreCached(entity, data, endpointURL)) {
                            // Save it on the pre cache.
                            this._addPreCacheItem(entity, embeddedEntity);
                        }
                        // The embedded object is an array or an object?
                        if (embeddedArray) {
                            // It's an array, loop it and scan it.
                            this._detectEmbeddedItemsInArray(
                                embeddedEntity._embedded[Object.keys(embeddedEntity)[0]],
                                endpointURL
                            );
                        } else {
                            // It's an object, scan it.
                            this._detectEmbeddedItems(embeddedEntity, endpointURL);
                        }
                    }else if (embeddedEntity && embeddedEntity.length) {
                        this._detectEmbeddedItemsInArray(embeddedEntity, endpointURL);
                    }

                } else if (data._links && !data._links.length && embeddedEntity.length) {
                    // An array of elements without links? just scan its contents.
                    this._detectEmbeddedItemsInArray(embeddedEntity, endpointURL);
                }
            }, this);
        }
    }
    /**
     * Given a list of embedded elements, it loops and evaludate them with
     * {_detectEmbeddedItems}.
     * @param  {Array}  array       - The list of elements to loop and evaluate.
     * @param  {string} endpointURL - The main request url.
     * @private
     * @ignore
     */
    _detectEmbeddedItemsInArray(array, endpointURL) {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                this._detectEmbeddedItems(array[i], endpointURL);
            }
        }

    }
    /**
     * Checks if the content of an embedded element it's an array or an object.
     * @param  {Object}  data - The embedded element to evaluate.
     * @return {boolean} Whether the embedded content it's an array or not.
     * @private
     * @ignore
     */
    _isEmbeddedArray(data) {
        const keys = Object.keys(data);
        return (keys.length === 3 &&
            data._embedded &&
            data._links &&
            data._fixed &&
            Object.keys(data._embedded).length === 1);
    }
    /**
     * Adds an entry to the pre cache. If there's already an entry for the given url, it will
     * increase the value of the `needed` property. Every time an entry it's used, it increases
     * the value of its `used` property, and when they both match, `needed` and `used`, the entry
     * it's removed from the pre cache.
     * @param {Object} entity - The name of the entity that will be stored.
     * @param {Object} data   - The embedded element properties.
     * @private
     * @ignore
     */
    _addPreCacheItem(entity, data) {
        if (this._hasURL(data)) {
            let url = data._links.self.href;
            const originalUrl = url;
            const embeddedArray = this._isEmbeddedArray(data);
            if (this.filterSharding) {
                url = this._getURLWithoutSharding(url);
            }

            if (!this.preCache[url]) {
                this._log('Add resource: ' + entity);
                this.preCache[url] = {
                    metadata: Object.assign({}, this._currentMetadata),
                    data: data,
                    entity: entity,
                    url: url,
                    originalUrl: originalUrl,
                    needed: 1,
                    used: 0,
                };
            } else {
                this._log('Increment resource counter: ' + entity);
                this.preCache[url].needed++;
            }
        }
    }
    /**
     * Retrieves an entry from the pre cache based on its url. This wil be used before doing the
     * fetch in order to prevent the request if the content it's already saved.
     * @param  {string} url - The url used to save the entry.
     * @return {?Object} The pre cache entry, if there's one.
     * @private
     * @ignore
     */
    _getCache(url) {
        if (this.filterSharding) {
            url = this._getURLWithoutSharding(url);
        }

        let result = null;
        if (this.preCache[url]) {
            const cached = this.preCache[url];
            cached.used++;
            result = Object.assign({}, cached);
            if (cached.used >= cached.needed) {
                delete this.preCache[url];
                this._log('Remove resource: ' + cached.entity);
            }

        }

        return result;
    }
    /**
     * Checks whether an object has a valid API url an can be used in the pre cache.
     * @param  {Object}  data - The target object to evaluate.
     * @return {boolean} Whether or not the object has a valid API url.
     * @private
     * @ignore
     */
    _hasURL(data) {
        return (data._links && data._links.self && data._links.self.href);
    }
    /**
     * Evaluates whether an entity object can be pre cached or not. This will use the class
     * settings to check its entity name and the endpoint pattern.
     * @param  {string} entity      - The name of the entity that wants to be saved.
     * @param  {Object} data        - The contents of the embedded entity.
     * @param  {string} endpointURL - The main request url.
     * @return {boolean} Whether or not the entity can be saved on the pre cache.
     * @private
     * @ignore
     */
    _canBePreCached(entity, data, endpointURL) {
        if (endpointURL.match(this.preCacheEndpoints) &&
            this.preCacheEmbeddedProperties.indexOf(entity) > -1 &&
            data._embedded[entity]) {
            if (this.preCacheEmbeddedPropertiesPerEndpoint[entity] &&
                !endpointURL.match(this.preCacheEmbeddedPropertiesPerEndpoint[entity])) {
                return false;
            }

            return true;
        }

        return false;
    }
    /**
     * Parse a url and removes the sharding the Olapic CDN adds to the urls.
     * @param  {string} url - The target url to clean.
     * @return {string} The cleaned url.
     * @private
     * @ignore
     */
    _getURLWithoutSharding(url) {
        return url.replace(this.shardingPattern, '');
    }
    /**
     * If debug mode it's enabled, it will log the given message on the console.
     * @param  {string} message - The message to debug.
     * @return {boolean} Whether or not the message was logged.
     * @private
     * @ignore
     */
    _log(message) {
        if (this.debug) {
            console.log('OlapicRestClient: ' + message);
        }

        return this.debug;
    }
    /**
     * Set a fetch object to be used for the API requests. This is intended to inject a stub that
     * can be used for unit testing.
     * @param {Object} obj - The new fetch object.
     */
    setFetchObject(obj) {
        this._fetchObject = obj;
    }
    /**
     * Get access to the fetch object that the rest client uses for every request to the API.
     * @return {Object} If no object was injected with {setFetchObject}, it will return the native
     *                  `fetch` object.
     */
    getFetchObject() {
        return this._fetchObject || fetch;
    }
    /**
     * Sets a list of parameters to be included on every request query string.
     * @param {Object} [query={}] - The list of parameters and their values.
     */
    setRequestBaseQuery(query = {}) {
        this._baseQuery = Object.assign({}, query);
    }
    /**
     * Gets a list of base parameters that are included on every request query string.
     * @return {Object} The list of parameters for every request query string.
     */
    getRequestBaseQuery() {
        return this._baseQuery;
    }
    /**
     * Sets a list of headers to be included on every request.
     * @param {Object} [headers={}] - A list of headers and their values.
     */
    setRequestBaseHeaders(headers = {}) {
        this._baseHeaders = Object.assign({}, headers);
    }
    /**
     * Gets a list of base headers to be included on every request.
     * @return {Object} The list of headers and their values.
     */
    getRequestBaseHeaders() {
        return this._baseHeaders;
    }
    /**
     * Change the value of one of th editable options of the class.
     * @param {string}  name           - The option name.
     * @param {*}       value          - The option new value.
     * @param {boolean} [append=false] - If `true` and both the current and new value are Object,
     *                                   they'll be merged.
     * @todo Remove this and replace the editable options with simple properties and/or getters and
     *       setters.
     */
    setOption(name, value, append = false) {
        if (this._isOptionAccessible(name)) {
            if (append && typeof this[name] === 'object'
                && typeof this[name].length === 'undefined'
                && Object.keys(value).length) {
                this[name] = Object.assign(this[name], value);
            } else {
                this[name] = value;
            }

        }

        return this;
    }
    /**
     * A shortcut to call {setOption} for a list of options.
     * @example
     * .setOptions({
     *     option1: 'value1',
     *     option2: 'value2',
     * });
     *
     * @param {Object} options - A dictionary with the options to edit and their values.
     * @return {void}
     * @todo Remove this and replace the editable options with simple properties and/or getters and
     *       setters.
     */
    setOptions(options) {
        Object.keys(options).forEach((option) => {
            this.setOption(option, options[option]);
        }, this);
    }
    /**
     * Get the value of one of the editable options.
     * @param  {string} name - The option name.
     * @return {*} The option value.
     * @todo Remove this and replace the editable options with simple properties and/or getters and
     *       setters.
     */
    getOption(name) {
        let result = null;
        if (this._isOptionAccessible(name)) {
            result = this[name];
        }

        return result;
    }
    /**
     * Makes a GET request to the API.
     * @example
     * .get('/media/12', {auth_token: 'abc'}).then((response) => {
     *     console.log(response);
     * });
     *
     * @param  {string} url          - The API url.
     * @param  {Object} [query={}]   - A list of parameters for the query string.
     * @param  {Object} [headers={}] - A list of headers for the request.
     * @return {Promise<Object,Error>} If everything goes well, it will return the response.
     */
    get(url, query = {}, headers = {}) {
        return new Promise(((resolve, reject) => {
            const {newUrl, fetchCall} = this._fetch(url, query, headers);
            const cached = this._getCache(newUrl);
            if (cached) {
                this._log('Retrieve resource: ' + newUrl);
                resolve(cached);
            } else {
                fetchCall().then((response) => {
                    return response.json();
                }).then((response) => {

                    if (response && response.metadata && response.metadata.code === 404) {
                        reject(response);
                    } else {
                        if (this.preCacheEnabled && response.data && response.data._embedded) {
                            this._currentMetadata = Object.assign({
                                cached: 'true',
                            }, response.metadata);
                            this._detectEmbeddedItems(response.data, newUrl);
                        }

                        resolve(response);
                    }

                }).catch(reject);
            }
        }).bind(this));
    }
    /**
     * Makes a POST request to the API.
     * @example
     * .post('/media/12/report', {reason: '...'}, {auth_token: 'abc'}).then((response) => {
     *     console.log(response);
     * });
     *
     * @param  {string} url          - The API url.
     * @param  {Object} [data={}]    - A list of form fields to post as the body of the request.
     * @param  {Object} [query={}]   - A list of parameters for the query string.
     * @param  {Object} [headers={}] - A list of headers for the request.
     * @return {Promise<Object,Error>} If everything goes well, it will return the response.
     */
    post(url, data = {}, query = {}, headers = {}) {
        const {fetchCall} = this._fetch(url, query, headers, 'post', data);
        return fetchCall().then((response) => {
            return response.json();
        });
    }
    /**
     * This method is for when the embedded properties are used from the raw response and should
     * be removed from the pre cache.
     * @param  {string} url - The url for the entry.
     * @return {boolean} Whether there was an entry or not.
     */
    useCache(url) {
        return this._getCache(url) ? true : false;
    }
    /**
     * Removes all the entries from the pre cache.
     * @return {Array} A list of the urls that were removed.
     */
    cleanCache() {
        const result = Object.keys(this.preCache);
        result.forEach((key) => {
            delete this.preCache[key];
        }, this);

        return result;
    }

}

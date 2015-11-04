
import OlapicDevKit from '../devkit';
import OlapicUtils from '../../tools/utils';
import OlapicMediaHandler from '../entities/media/media.handler';
/**
 * The abstract class to manage entities collections, like a media feed.
 * @abstract
 */
class OlapicBatch {
    /**
     * A quick shortcut to get access to the DevKit singleton.
     * @type {OlapicDevKit}
     */
    get DevKit() {
        return OlapicDevKit.getInstance();
    }
    /**
     * The class constructor that sets the basic information for the batch, like the initial url and
     * the batch settings.
     * @param  {String}  intialUrl          - The url for the batch first page.
     * @param  {Number}  [limit=20]         - How many element per page will be fetched.
     * @param  {Boolean} [rightsOnly=false] - If this is true, it will only return entities with
     *                                        approved rights.
     */
    constructor(intialUrl, limit = 20, rightsOnly = false) {
        /**
         * The url that will be used for the next request. This will be changed by the pagination
         * methods.
         * @type {String}
         * @private
         * @ignore
         */
        this._currentUrl = intialUrl;
        /**
         * After a response it's received, this variable will store the pagination url to go
         * back a page.
         * @type {String}
         * @private
         * @ignore
         */
        this._prevUrl = '';
        /**
         * After a response it's received, this variable will store the pagination url to load
         * the next page.
         * @type {String}
         * @private
         * @ignore
         */
        this._nextUrl = '';
        /**
         * The amount of entities per page.
         * @type {Number}
         * @private
         * @ignore
         */
        this._limit = limit;
        /**
         * A flag to know if the list should only be populated with entities with rights
         * approved.
         * @type {Boolean}
         * @private
         * @ignore
         */
        this._rightsOnly = rightsOnly;
        /**
         * A flag to know if the batch it's currently fetching content.
         * @type {Boolean}
         * @private
         * @ignore
         */
        this._fetching = false;
    }
    /**
     * Makes a request to the API and returns a entities list, or an `Error` if something goes
     * wrong.
     * If this method it's called before another `fetch` promise is resolved, it will automatically
     * reject the promise with an error.
     *
     * @example
     * .fetch().then((entities) => {
     *     for (let i = 0; i < entities.length; i++) {
     *         console.log('Entity: ', entities[i].toString());
     *     }
     * }).catch((e) => console.log('Error: ', e));
     *
     * @return {Promise<Array, Error>} If everything goes well, it will return an entities list,
     *                                 otherwise, it will return an `Error`.
     */
    fetch() {
        let result = null;

        if (this._fetching) {
            result = OlapicUtils.rejectedPromise(new Error('The batch it\'s already fetching'));
        } else {
            this._fetching = true;
            const requestParameters = {
                count: this._limit,
            };

            if (this._rightsOnly) {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                requestParameters.rights_given = 1;
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            }

            result = this.DevKit.rest.get(this._currentUrl, requestParameters)
            .then(((response) => {
                this._fetching = false;
                const extract = OlapicMediaHandler.extractEntities(response);
                this._prevUrl = extract.links.prev ? extract.links.prev : null;
                this._nextUrl = extract.links.next ? extract.links.next : null;
                return extract.media;
            }).bind(this));
        }

        return result;
    }
    /**
     * Checks whether there's a next page to load or not.
     * @return {Boolean} Whether there's a next page or not.
     */
    hasNextPage() {
        return this._nextUrl ? true : false;
    }
    /**
     * Loads the batch next page. This method returns a call to `.fetch()`, so they can be
     * handled the same way.
     * You should always check first if there's a next page using `.hasNextPage()`.
     * @example
     * .next().then((entities) => {
     *     for (let i = 0; i < entities.length; i++) {
     *         console.log('Entity: ', entities[i].toString());
     *     }
     * }).catch((e) => console.log('Error: ', e));
     *
     * @return {Promise<Array, Error>} If everything goes well, it will return an entities list,
     *                                 otherwise, it will return an `Error`.
     */
    next() {
        this._currentUrl = this._nextUrl;
        return this.fetch();
    }
    /**
     * Checks whether there's a previous page to load or not.
     * @return {Boolean} Whether there's a previous page or not.
     */
    hasPrevPage() {
        return this._prevUrl ? true : false;
    }
    /**
     * Loads the batch previous page. This method returns a call to `.fetch()`, so they can be
     * handled the same way.
     * You should always check first if there's a previous page using `.hasPrevPage()`.
     * @example
     * .prev().then((entities) => {
     *     for (let i = 0; i < entities.length; i++) {
     *         console.log('Entity: ', entities[i].toString());
     *     }
     * }).catch((e) => console.log('Error: ', e));
     *
     * @return {Promise<Array, Error>} If everything goes well, it will return an entities list,
     *                                 otherwise, it will return an `Error`.
     */
    prev() {
        this._currentUrl = this._prevUrl;
        return this.fetch();
    }
}
/**
 * @type {OlapicBatch}
 * @module OlapicBatch
 */
export default OlapicBatch;

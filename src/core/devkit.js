
import OlapicRestClient from '../tools/rest';
import OlapicUtils from '../tools/utils';
import OlapicCustomersHandler from './entities/customer/customer.handler';
import OlapicWidgetsHandler from './entities/widget/widget.handler';

/**
 * The symbol key to store the singleton on the static object.
 * @type {symbol}
 * @ignore
 */
const singleton = Symbol();
/**
 * The private key to ensure the singleton constructor can only be called from inside this module.
 * @type {symbol}
 * @ignore
 */
const singletonPrivateKey = Symbol();

/**
 * The main singleton for the DevKit project. It handles the first connection to to the API and
 * stores the customer information.
 * To have access to this object, you should always call `.getInstance()`. If you try to
 * instantiate it with the `new` keyword it will throw an error.
 *
 * @example
 * let instance = OlapicDevKit.getInstance();
 */
class OlapicDevKit {
    /**
     * Gets the singleton instance, and optionally sets a new API key.
     * @example
     * let instance = OlapicDevKit.getInstance();
     *
     * @param  {string} [APIKey=null] - The Olapic customer API key.
     * @return {OlapicDevKit} The singleton instance of OlapicDevKit.
     */
    static getInstance(APIKey = null) {
        if (!this[singleton]) {
            this[singleton] = new OlapicDevKit(singletonPrivateKey);
        }

        if (APIKey) {
            this[singleton].APIKey = APIKey;
        }

        return this[singleton];
    }
    /**
     * OlapicDevKit class constructor.
     * @param  {symbol} [singletonKey] - The private key to ensure it can be only call from here.
     * @private
     * @ignore
     */
    constructor(singletonKey) {
        if (singletonKey !== singletonPrivateKey) {
            throw new Error('OlapicDevKit is a singleton, use .getInstance() instead');
        }
        /**
         * The Olapic API entry point.
         * @type {string}
         */
        this.APIUrl = '//photorankapi-a.akamaihd.net';
        /**
         * A flag to know if the instance is connected and has the customer information.
         * @type {boolean}
         */
        this.connected = false;
        /**
         * The rest client that makes the requests to the API.
         * @see {OlapicRestClient}
         * @type {OlapicRestClient}
         */
        this.rest = new OlapicRestClient();
        /**
         * The connected customer information.
         * @see {OlapicCustomerEntity}
         * @type {OlapicCustomerEntity}
         */
        this.customer = null;
        /**
         * The Olapic customer API key.
         * @type {?string}
         * @ignore
         */
        this._APIKey = null;
        /**
         * The API version.
         * @type {string}
         * @ignore
         */
        this._APIVersion = 'v2.2';
        /**
         * The Olapic API endpoints that DevKit may require.
         * @type {Object}
         */
        this._knownEndpoints = {
            categoryByID: '/category/{ID}',
            widgetByHash: '/widgets/{hash}',
            widgetSettingsByID: '/widgets/settings/{ID}',
            customerByID: '/customers/{ID}',
            mediaByID: '/media/{ID}',
            streamByID: '/streams/{ID}',
            userByID: '/users/{ID}',
            instagramUserForCustomer: '/customers/{ID}/instagram_users/{username}',
        };

        this._setRestClientBaseQuery();
    }
    /**
     * This method is called by the setters of APIKey and APIVersion and rewrites the rest
     * client base query string for every request.
     * @private
     * @ignore
     */
    _setRestClientBaseQuery() {
        this.rest.setRequestBaseQuery({
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            auth_token: this._APIKey,
            wrap_responses: 1,
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            version: this._APIVersion,
        });
    }
    /**
     * Connects DevKit to the API and returns the customer entity.
     * @example
     * .connect(widgetID).then((response) => {
     *     let {customer, widget} = response;
     * });
     *
     * @see {OlapicCustomerEntity}
     * @see {OlapicWidgetEntity}
     * @param  {string} [widgetInstance=null] - A widget instance ID so the connection will also
     *                                          retrieve a widget entity.
     * @return {Promise<Object, Error>} If the widget instance is specified, it will return an
     *                                  Object with the keys customer and widget, otherwise, it
     *                                  will return a customer entity.
     */
    connect(widgetInstance = '') {
        return new Promise(((resolve, reject) => {
            if (this.connected && this.customer) {
                resolve(this.customer);
            } else {
                let url = this.APIUrl;
                if (widgetInstance) {
                    url += '/widgets/' + widgetInstance;
                }

                this.rest.get(url).then((response) => {
                    this.connected = true;
                    this.customer = OlapicCustomersHandler.entityFromJSON(response);
                    if (widgetInstance) {
                        resolve({
                            customer: this.customer,
                            widget: OlapicWidgetsHandler.entityFromJSON(response),
                        });
                    } else {
                        resolve(this.customer);
                    }
                }).catch(reject);
            }
        }).bind(this));
    }
    /**
     * Disconnect DevKit from the current customer.
     */
    disconnect() {
        this.connected = false;
        this.customer = null;
    }
    /**
     * Get one of the endpoints for the Olapic API.
     * @example
     * // Returns .../category/12
     * .getEndpoint('categoryByID', { ID: 12 });
     * // Returns .../widgets/abc
     * .getEndpoint('widgetByHash', { hash: 'abc' });
     * // Returns .../widgets/settings/12
     * .getEndpoint('widgetSettingsByID', { ID: 12 });
     * // Returns .../customers/12
     * .getEndpoint('customerByID', { ID: 12 });
     * // Returns .../media/12
     * .getEndpoint('mediaByID', { ID: 12 });
     * // Returns .../streams/12
     * .getEndpoint('streamByID', { ID: 12 });
     * // Returns .../users/12
     * .getEndpoint('userByID', { ID: 12 });
     * // Returns .../customers/12/instagram_users/olapic
     * .getEndpoint('instagramUserForCustomer', { ID: 12, username: 'olapic'});
     *
     * @param  {string} endpoint        - The endpoint name.
     * @param  {Object} [parameters={}] - A list of required parameters for the endpoint.
     * @return {string} The generated API endpoint.
     */
    getEndpoint(endpoint, parameters = {}) {
        let url = this._knownEndpoints[endpoint];
        if (url) {
            url = this.APIUrl + url;
            url = OlapicUtils.assignToString(url, parameters);
        }

        return url ? url : null;
    }
    /**
     * Set the Olapic customer API key.
     * @type string
     */
    set APIKey(value) {
        this._APIKey = value;
        this._setRestClientBaseQuery();
    }
    /**
     * Get the Olapic customer API key.
     * @type string
     */
    get APIKey() {
        return this._APIKey;
    }
    /**
     * Set the Olapic API version to use.
     * @type string
     */
    set APIVersion(value) {
        this._APIVersion = value;
        this._setRestClientBaseQuery();
    }
    /**
     * Get the Olapic API version.
     * @type string
     */
    get APIVersion() {
        return this._APIVersion;
    }

}
/**
 * @type {OlapicDevKit}
 * @module OlapicDevKit
 */
export default OlapicDevKit;

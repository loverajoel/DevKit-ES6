
/**
 * A list of utlity methods for the DevKit library.
 * @abstract
 */
class OlapicUtils {
    /**
     * Returns an already fullfilled promise with a given value.
     * @param  {bollean} success  - Whether to call `resolve` or `reject`.
     * @param  {*}       response - The object to resolve or reject.
     * @return {Promise<*,*>}
     * @private
     * @ignore
     */
    static _fullfilledPromise(success, response) {
        return new Promise((resolve, reject) => {
            if (success) {
                resolve(response);
            } else {
                reject(response);
            }
        });
    }
    /**
     * Returns an already rejected promise.
     * @example
     * OlapicUtils.rejectedPromise('error message').catch((e) => {
     *     // It will log 'error message'
     *     console.log(e);
     * });
     *
     * @param  {*} response - The object to send to the `.catch` method.
     * @return {Promise<null, *>} This promise won't call `.then` but `.catch` directly.
     */
    static rejectedPromise(response) {
        return this._fullfilledPromise(false, response);
    }
    /**
     * Returns an already resolved promise.
     * @example
     * OlapicUtils.rejectedPromise('hello world').then((message) => {
     *     // It will log 'hello world'
     *     console.log(message);
     * });
     *
     * @param  {*} response - The object to send to the `.then` method.
     * @return {Promise<*, null>} This promise won't call `.catch`.
     */
    static resolvedPromise(response) {
        return this._fullfilledPromise(true, response);
    }
    /**
     * Assign a list of parameters to a string with placeholders.
     * @example
     * // It will return 'Hello world'
     * OlapicUtils.assignToString('Hello {target}', { target: 'world' });
     *
     * @param  {string} string          - The base string.
     * @param  {Object} [assigments={}] - A dictionary with named assignments for the string
     *                                    placeholders.
     * @return {string} The parsed string.
     */
    static assignToString(string, assigments = {}) {
        if (typeof string === 'string') {
            Object.keys(assigments).forEach((key) => {
                string = string.replace('{' + key + '}', assigments[key]);
            });
        }

        return string;
    }

}
/**
 * @type {OlapicUtils}
 * @module OlapicUtils
 */
export default OlapicUtils;

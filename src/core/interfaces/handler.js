
import OlapicDevKit from '../devkit';
/**
 * This is an abstract class that all the entities handler will extend and implement.
 * @abstract
 */
class OlapicEntitiesHandler {
    /**
     * When implemented, this method would receive a raw object from a request response and return
     * a entity object.
     * @param  {Object} json - The raw object to parse.
     * @return {?OlapicEntity} A subclass of `OlapicEntity` depending on the handler that
     *                         implements it.
     * @ignore
     */
    static entityFromJSON(json) {
        return null;
    }
    /**
     * When implemented, this method would receive a raw response from the API and
     * extract all the entities from it.
     * @param  {Object} obj - The raw object to parse.
     * @return {Array|Object} A list of entities, and depending on the implementation, its links.
     * @ignore
     */
    static extractEntities(obj) {
        return null;
    }
    /**
     * This will be used when creating an entity to parse any list of linked entities and
     * returns them with a better format.
     * @example
     * // This will return {media:{recent:{link:'...'}}}
     * .getResourcesFromObject({
     *     'media:recent': {
     *         _links: {
     *             self: {
     *                 href: '...',
     *             },
     *         },
     *     },
     * });
     *
     * @param  {Object} obj - The object to parse.
     * @return {Object} The formatted object.
     */
    static getResourcesFromObject(obj) {
        let result = {};
        const newObj = {};

        Object.keys(obj).forEach((key) => {
            if (key.indexOf(':') > -1 && obj[key]) {
                const parts = key.split(':');
                newObj[parts[0]] = {};
                newObj[parts[0]][parts[1]] = {
                    link: obj[key]._links.self.href,
                };
                result = Object.assign(result, newObj);
            } else if (key !== 'media' && key !== 'customer' && obj[key]) {
                result[key] = {
                    link: obj[key]._links.self.href,
                };
            }
        });

        return result;
    }
    /**
     * This will be used when creating an entity to parse any list of action forms and
     * returns them with a better format.
     * @example
     * // This will return {streams:{search:{method:'GET}}}
     * .getFormsFromObject({
     *     'streams:search': {
     *         method: 'GET',
     *     },
     * });
     *
     * @param  {Object} obj - The object to parse.
     * @return {Object} The formatted object.
     */
    static getFormsFromObject(obj) {
        let result = {};
        const newObj = {};

        Object.keys(obj).forEach((key) => {
            if (key.indexOf(':') > -1) {
                const parts = key.split(':');
                newObj[parts[0]] = {};
                newObj[parts[0]][parts[1]] = obj[key];
                result = Object.assign(result, newObj);
            } else if (key !== 'media') {
                result[key] = obj[key];
            }
        });

        return result;
    }
    /**
     * A quick shortcut to get access to the DevKit singleton.
     * @return {OlapicDevKit} The singleton instance.
     */
    static get DevKit() {
        return OlapicDevKit.getInstance();
    }

}
/**
 * @type {OlapicEntitiesHandler}
 * @module OlapicEntitiesHandler
 */
export default OlapicEntitiesHandler;

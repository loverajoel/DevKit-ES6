
/**
 * This is the abstract class that all the entities will extend and implement.
 * @abstract
 */
export default class OlapicEntity {
    /**
     * A quick shortcut for the entities so they can access their own entities handler.
     * For example, the `OlapicMediaEntity` will get the `OlapicMediaHandler`.
     * @return {OlapicEntitiesHandler} The handler class for that specific entity.
     */
    get handler() {
        return null;
    }
    /**
     * The class constructor that will receive all the entity information. On an implementation,
     * this object will be instantiated from the `entityFromJSON` handler method, which will take
     * care of parsing raw data before creating the entity.
     *
     * All the information sent with the `data` argument will later be accessible using the `get`
     * method.
     *
     * @param  {Object} data - The entity information.
     */
    constructor(data) {
        /**
         * The entity information.
         * @type {Object}
         */
        this.data = data;
        /**
         * An alias/name for the entity, for debug purposes.
         * @type {String}
         */
        this.alias = 'OlapicEntity';
    }
    /**
     * Access the entity data using a path-like format.
     *
     * @example
     * let entity = new OlapicEntity({
     *     name: 'MyEntity',
     *     props: {
     *         olapic: 'rocks',
     *     },
     * });
     * // This will log 'MyEntity'
     * console.log(entity.get('name'));
     * // This will log 'rocks'
     * console.log(entity.get('props/olapic'));
     *
     * @param  {string} path - The path-like name for the property.
     * @return {*} The value of the wanted property.
     */
    get(path) {
        let result = null;
        path.split('/').forEach((part, index) => {
            if (index === 0 || result) {
                result = (index < 1) ? this.data[part] : result[part];
            } else {
                result = null;
            }
        });

        return result;
    }
    /**
     * A utility method that returns the entity name/alias.
     * @return {string} The class alias.
     */
    toString() {
        return '<' + this.alias + '>';
    }

}

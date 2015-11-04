
import OlapicEntity from '../../interfaces/entity';
import OlapicCustomersHandler from './customer.handler';
/**
 * This represents the Olapic customers in DevKit.
 * This is one of the most important entities, and once connected, you can find your
 * customer entity in the singleton `.customer` property.
 * @example
 * let devkit = OlapicDevKit.getInstance('<YOU-API-KEY>');
 * devkit.connect().then((customer) => {
 *     console.log(customer.get('name'));
 * });
 * @extends {OlapicEntity}
 */
class OlapicCustomerEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the customers handler object.
     * @return {OlapicCustomersHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicCustomersHandler;
    }
    /**
     * The class constructor that receives the customer information.
     * @param  {Object} data All the information for the customer.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicCustomerEntity';
    }
    /**
     * Gets a user to upload media for the customer.
     * @example
     * .getUser().then((user) => {
     *     console.log(user.get('name'));
     * });
     *
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    getUser() {
        return this.handler.getUserFromCustomer(this);
    }
    /**
     * Creates a new user to upload media for the customer.
     * @example
     * .createUser('myName', 'my@email.com').then((user) => {
     *     console.log(user.get('name'));
     * });
     *
     * @param  {string} name  - The new user name.
     * @param  {string} email - The new user email address.
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    createUser(name, email) {
        return this.handler.createUserForCustomer(this, name, email);
    }
    /**
     * Searches for the customer stream based on its tag key.
     * @example
     * .searchStream('shoes').then((stream) => {
     *     console.log(stream.get('name'));
     * });
     *
     * @param  {String} tag - The stream tag key.
     * @return {Promise<OlapicStreamEntity, Error>} A promise with the stream entity or an `Error`
     *                                              object if something goes wrong.
     */
    searchStream(tag) {
        return this.handler.searchStreamFromCustomer(this, tag);
    }
    /**
     * Searches for the customer category based on its tag key.
     * @example
     * .searchCategory('shoes').then((category) => {
     *     console.log(category.get('name'));
     * });
     *
     * @param  {String} tag - The category tag key.
     * @return {Promise<OlapicCategoryEntity, Error>} A promise with the catgory entity or an
     *                                                `Error` object if something goes wrong.
     */
    searchCategory(tag) {
        return this.handler.searchCategoryFromCustomer(this, tag);
    }
}
/**
 * @type {OlapicCustomerEntity}
 * @module OlapicCustomerEntity
 */
export default OlapicCustomerEntity;

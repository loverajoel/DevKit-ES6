
import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicUsersHandler from '../user/user.handler';
import OlapicStreamsHandler from '../stream/stream.handler';
import OlapicCategoriesHandler from '../category/category.handler';
import OlapicCustomerEntity from './customer.entity';
import OlapicUtils from '../../../tools/utils';
/**
 * The entities handler for the Olapic customers in DevKit.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicCustomersHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a customer entity.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         name: 'Olapic Customer',
     *     },
     * };
     * let customer = OlapicCustomersHandler.entityFromJSON(JSONInfo);
     * // It will log 'Olapic Customer'
     * console.log(customer.get('name'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicCustomerEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        const data = json.data._embedded.customer;
        const customer = Object.assign({}, data);
        [
            '_embedded',
            '_fixed',
            '_forms',
            '_links',
            'views',
        ].forEach((remove) => {
            delete customer[remove];
        });

        customer.link = data._links.self.href;
        customer.resources = this.getResourcesFromObject(data._embedded);
        customer.actions = this.getFormsFromObject(data._forms);
        return new OlapicCustomerEntity(customer);
    }
    /**
     * Gets a user to upload media for a customer.
     * @example
     * OlapicCustomersHandler.getUserFromCustomer(customerEntity)
     * .then((user) {
     *     console.log(user.get('name'));
     * });
     *
     * @param  {OlapicCustomerEntity} customer - The customer entity for which the user will be
     *                                           obtained.
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    static getUserFromCustomer(customer) {
        let result = null;
        if (customer._user) {
            result = OlapicUtils.resolvedPromise(customer._user);
        } else {
            result = this.DevKit.rest.get(customer.get('resources/user/link')).then((response) => {
                customer._user = OlapicUsersHandler.entityFromJSON(response);
                return customer._user;
            });
        }

        return result;
    }
    /**
     * Creates a new user to upload media for a customer.
     * @example
     * OlapicCustomersHandler.createUserForCustomer(customerEntity, 'myName', 'my@email.com')
     * .then((user) => {
     *     console.log(user.get('name'));
     * });
     *
     * @param  {OlapicCustomerEntity} customer - The customer entity for which the user will
     *                                           be created.
     * @param  {String}               name     - The new user name.
     * @param  {String}               email    - The new user email address.
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    static createUserForCustomer(customer, name, email) {
        const url = customer.get('actions/users/create/action/href');
        return this.DevKit.rest.post(url, {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            screen_name: name,
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            email: email,
        }).then((response) => {
            customer._user = OlapicUsersHandler.entityFromJSON(response);
            return customer._user;
        });
    }
    /**
     * Searchs for a customer stream based on its tag key.
     * @example
     * OlapicCustomersHandler.searchStreamFromCustomer(customerEntity, 'shoes').then((stream) => {
     *     console.log(stream.get('name'));
     * });
     *
     * @param  {OlapicCustomerEntity} customer - The customer owner of the stream.
     * @param  {String}               tag      - The stream tag key.
     * @return {Promise<OlapicStreamEntity, Error>} A promise with the stream entity or an `Error`
     *                                              object if something goes wrong.
     */
    static searchStreamFromCustomer(customer, tag) {
        const url = customer.get('actions/streams/search/action/href');
        return this.DevKit.rest.get(url, {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            tag_key: tag,
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        }).then((response) => {
            return OlapicStreamsHandler.entityFromJSON(response);
        });
    }
    /**
     * Searchs for a customer category based on its tag key.
     * @example
     * OlapicCustomersHandler.searchCategoryFromCustomer(customerEntity, 'shoes')
     * .then((category) => {
     *     console.log(category.get('name'));
     * });
     *
     * @param  {OlapicCustomerEntity} customer - The customer owner of the category.
     * @param  {String}               tag      - The category tag key.
     * @return {Promise<OlapicCategoryEntity, Error>} A promise with the catgory entity or an
     *                                                `Error` object if something goes wrong.
     */
    static searchCategoryFromCustomer(customer, tag) {
        const url = customer.get('actions/categories/search/action/href');
        return this.DevKit.rest.get(url, {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            tag_key: tag,
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        }).then((response) => {
            return OlapicCategoriesHandler.entityFromJSON(response);
        });
    }
    /**
     * Gets an Olapic customer by its API url.
     * @example
     * OlapicCustomersHandler.getCustomerByUrl('http://...')
     * .then((customer) => {
     *     console.log('Customer: ', customer);
     * });
     *
     * @param  {String} url - The Olapic API url for the customer.
     * @return {Promise<OlapicCustomerEntity, Error>} The customer entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getCustomerByUrl(url) {
        return this.DevKit.rest.get(url)
        .then((response) => this.entityFromJSON(response));
    }
    /**
     * Gets an Olapic customer by its unique ID.
     * @example
     * OlapicCustomersHandler.getCustomerByID(12)
     * .then((customer) => {
     *     console.log('Customer: ', customer);
     * });
     *
     * @param  {Number} ID - The customer ID.
     * @return {Promise<OlapicCustomerEntity, Error>} The customer entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getCustomerByID(ID) {
        return this.getCustomerByUrl(this.DevKit.getEndpoint('customerByID', {
            ID: ID,
        }));
    }
}
/**
 * @type {OlapicCustomersHandler}
 * @module OlapicCustomersHandler
 */
export default OlapicCustomersHandler;

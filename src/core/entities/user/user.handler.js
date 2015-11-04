
import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicUserEntity from './user.entity';
import OlapicUtils from '../../../tools/utils';
/**
 * The entities handler for the Olapic users in DevKit.
 * It's basically a set of static methods used to create and obtain users from the API or
 * DevKit itself.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicUsersHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a user entity.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         name: 'Admin',
     *     },
     * };
     * let user = OlapicUsersHandler.entityFromJSON(JSONInfo);
     * // It will log 'Admin'
     * console.log(user.get('name'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicUserEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        if (json.data) {
            json = json.data;
        }

        const user = Object.assign({}, json);
        [
            '_embedded',
            '_fixed',
            '_links',
            '_forms',
            'views',
        ].forEach((remove) => {
            delete user[remove];
        });

        user.link = json._links.self.href;
        user.resources = this.getResourcesFromObject(json._embedded);
        user.actions = this.getFormsFromObject(json._forms);
        return new OlapicUserEntity(user);
    }
    /**
     * Gets a user url to upload content to Olapic.
     * @param {OlapicUserEntity} user - The user from which the url will be created.
     * @return {String} The upload url for the user.
     */
    static getUserUploadUrl(user) {
        const url = '{base}?auth_token={token}&version={version}';
        return OlapicUtils.assignToString(url, {
            base: user.get('actions/media/upload/action/href'),
            token: this.DevKit.APIKey,
            version: this.DevKit.APIVersion,
        });
    }
    /**
     * Gets an Olapic user by its API url.
     * @example
     * OlapicUsersHandler.getUserByUrl('http://...')
     * .then((user) => {
     *     console.log('User: ', user);
     * });
     *
     * @param  {String} url - The Olapic API url for the user.
     * @return {Promise<OlapicUserEntity, Error>} The user entity or an `Error` object if something
     *                                            goes wrong.
     */
    static getUserByUrl(url) {
        return this.DevKit.rest.get(url).then(((response) => {
            return this.entityFromJSON(response);
        }).bind(this));
    }
    /**
     * Gets an Olapic user by its unique ID.
     * @example
     * OlapicUsersHandler.getUserByID(12)
     * .then((user) => {
     *     console.log('User: ', user);
     * });
     *
     * @param  {String} ID - The user ID.
     * @return {Promise<OlapicUserEntity, Error>} The user entity or an `Error` object if something
     *                                            goes wrong.
     */
    static getUserByID(ID) {
        return this.getUserByUrl(this.DevKit.getEndpoint('userByID', {
            ID: ID,
        }));
    }
    /**
     * Gets an Olapic user linked to an Instagram account for an Olapic customer.
     * @example
     * OlapicUsersHandler.getInstagramUserForCustomer(customerEntity, 'olapic')
     * .then((user) => {
     *     console.log('User: ', user);
     * });
     *
     * @param  {OlapicCustomerEntity} customer - The customer owner of the user.
     * @param  {string}               username - The instagram username.
     * @return {Promise<OlapicUserEntity, Error>} The user entity or an `Error` object if something
     *                                            goes wrong.
     */
    static getInstagramUserForCustomer(customer, username) {
        const url = this.DevKit.getEndpoint('instagramUserForCustomer', {
            ID: customer.get('id'),
            username: username,
        });
        return this.getUserByUrl(url);
    }
}
/**
 * @type {OlapicUsersHandler}
 * @module OlapicUsersHandler
 */
export default OlapicUsersHandler;

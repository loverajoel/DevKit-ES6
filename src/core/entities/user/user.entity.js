
import OlapicEntity from '../../interfaces/entity';
import OlapicUsersHandler from './user.handler';
/**
 * This represents the Olapic users in DevKit.
 * This is the type of entities used to upload content to Olapic.
 * @extends {OlapicEntity}
 */
class OlapicUserEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the users handler object.
     * @return {OlapicUsersHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicUsersHandler;
    }
    /**
     * The class constructor that receives the user information.
     * @param  {Object} data All the information for the user.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicUserEntity';
    }
    /**
     * Gets the user url to upload content to Olapic.
     * @return {String} The upload url for the user.
     */
    getUploadUrl() {
        return this.handler.getUserUploadUrl(this);
    }
}
/**
 * @type {OlapicUserEntity}
 * @module OlapicUserEntity
 */
export default OlapicUserEntity;

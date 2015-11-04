
import OlapicEntity from '../../interfaces/entity';
import OlapicMediaHandler from './media.handler';
/**
 * This represents the Olapic media in DevKit.
 * This is one of the most important entities since most of the Olapic contents are based on media.
 * @extends {OlapicEntity}
 */
class OlapicMediaEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the media handler object.
     * @return {OlapicMediaHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicMediaHandler;
    }
    /**
     * The class constructor that receives the media information.
     * @param  {Object} data All the information for the media.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicMediaEntity';
    }
    /**
     * Gets the user that uploaded the media.
     * @example
     * .getUser().then((user) => {
     *     console.log(user.get('name'));
     * });
     *
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    getUser() {
        return this.handler.getMediaUser(this);
    }
    /**
     * Report the media to be removed.
     * @param  {String} email  - The email address of the person reporting the media.
     * @param  {String} reason - The reason the media should be taken down.
     * @return {Promise<Object, Error>} A response object from the API if the media was successfully
     *                                  reported, or an `Error` object if something went wrong.
     * @todo Improve the response for when the media was successfully to something more than just
     *       the API response.
     */
    report(email, reason) {
        return this.handler.reportMedia(this, email, reason);
    }
    /**
     * Gets all the streams related to this media.
     * @example
     * .getRelatedStreams().then((streams) => {
     *     console.log('Streams: ', streams);
     * });
     *
     * @return {Promise<Array, Error>} A list of related streams or an `Error` object if something
     *                                 goes wrong.
     */
    getRelatedStreams() {
        return this.handler.getRelatedStreamsFromMedia(this);
    }
    /**
     * Gets all the categories related to this media.
     * @example
     * .getRelatedCategories().then((categories) => {
     *     console.log('Categories: ', categories);
     * });
     *
     * @return {Promise<Array, Error>} A list of related categories or an `Error` object if
     *                                 something goes wrong.
     */
    getRelatedCategories() {
        return this.handler.getRelatedCategoriesFromMedia(this);
    }
}
/**
 * @type {OlapicMediaEntity}
 * @module OlapicMediaEntity
 */
export default OlapicMediaEntity;


import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicUsersHandler from '../user/user.handler';
import OlapicStreamsHandler from '../stream/stream.handler';
import OlapicCategoriesHandler from '../category/category.handler';
import OlapicMediaEntity from './media.entity';
import OlapicUtils from '../../../tools/utils';
/**
 * The entities handler for the Olapic media in DevKit.
 * It's basically a set of static methods used to create and obtain media from the API or
 * DevKit itself.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicMediaHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a media entity.
     * @example
     * const JSONInfo = {
     *     metadata: {},
     *     data: {
     *         caption: 'My Pic!',
     *     },
     * };
     * const media = OlapicMediaHandler.entityFromJSON(JSONInfo);
     * // It will log 'My Pic!'
     * console.log(media.get('caption'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicMediaEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        if (json.data) {
            json = json.data;
        }

        const media = Object.assign({}, json);
        [
            '_embedded',
            '_fixed',
            '_forms',
            '_links',
            '_analytics',
            'views',
        ].forEach((remove) => {
            delete media[remove];
        });

        media.link = json._links.self.href;
        media.resources = this.getResourcesFromObject(json._embedded);
        media.actions = this.getFormsFromObject(json._forms);
        return new OlapicMediaEntity(media);
    }
    /**
     * When requesting a collection of entities, the API response contains an array instead of an
     * object, so this method will loop the array, create entities using `.entityFromJSON()` and
     * return a new array of entities.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         _embedded: {
     *             media: [
     *                 {
     *                     caption: 'Photo One',
     *                 },
     *                 {
     *                     caption: 'Photo Two',
     *                 }
     *             ],
     *         },
     *     },
     * };
     * let entities = OlapicMediaHandler.extractEntities(JSONInfo);
     * // It will log 'Photo One'
     * console.log(entities[0].get('caption'));
     *
     * @param  {Object} obj - The API response with the array.
     * @return {Array} A list of parsed entities.
     * @override
     */
    static extractEntities(obj) {
        const result = {
            media: [],
            links: {},
        };
        (obj.data._embedded.media || []).forEach((media) => {
            result.media.push(this.entityFromJSON(media));
        }, this);

        if (obj.data._links) {
            Object.keys(obj.data._links).forEach((link) => {
                result.links[link] = obj.data._links[link].href;
            });
        }

        return result;
    }
    /**
     * Gets the user that uploaded a media.
     * @example
     * OlapicMediaHandler.getMediaUser(mediaEntity).then((user) => {
     *     console.log(user.get('name'));
     * });
     *
     * @param  {OlapicMediaEntity} media - The target media entity.
     * @return {Promise<OlapicUserEntity, Error>} A promise with the user entity or an `Error`
     *                                            object if something goes wrong.
     */
    static getMediaUser(media) {
        let result = null;
        if (media._user) {
            result = OlapicUtils.resolvedPromise(media._user);
        } else {
            result = this.DevKit.rest.get(media.get('resources/uploader/link')).then((response) => {
                media._user = OlapicUsersHandler.entityFromJSON(response);
                return media._user;
            });
        }

        return result;
    }
    /**
     * Report a media to be removed.
     * @param  {OlapicMediaEntity} media  - The target media entity.
     * @param  {String}            email  - The email address of the person reporting the media.
     * @param  {String}            reason - The reason the media should be taken down.
     * @return {Promise<Object, Error>} A response object from the API if the media was
     *                                  successfully reported, or an `Error` object if something
     *                                  went wrong.
     * @todo Improve the response for when the media was successfully to something more than just
     *       the API response.
     */
    static reportMedia(media, email, reason) {
        return this.DevKit.rest.post(media.get('actions/report/action/href'), {
            email: email,
            reason: reason,
        });
    }
    /**
     * Gets all the streams related to a media.
     * @example
     * OlapicMediaHandler.getRelatedStreamsFromMedia(mediaEntity).then((streams) => {
     *     console.log('Streams: ', streams);
     * });
     *
     * @param  {OlapicMediaEntity} media  - The target media entity.
     * @return {Promise<Array, Error>} A list of related streams or an `Error` object if something
     *                                 goes wrong.
     */
    static getRelatedStreamsFromMedia(media) {
        return this.DevKit.rest.get(media.get('resources/streams/all/link'))
        .then((response) => {
            return OlapicStreamsHandler.extractEntities(response);
        });
    }
    /**
     * Gets all the categories related to this media.
     * @example
     * OlapicMediaHandler.getRelatedCategoriesFromMedia(mediaEntity).then((categories) => {
     *     console.log('Categories: ', categories);
     * });
     *
     * @param  {OlapicMediaEntity} media  - The target media entity.
     * @return {Promise<Array, Error>} A list of related categories or an `Error` object if
     *                                 something goes wrong.
     */
    static getRelatedCategoriesFromMedia(media) {
        return this.DevKit.rest.get(media.get('resources/categories/all/link'))
        .then((response) => {
            return OlapicCategoriesHandler.extractEntities(response);
        });
    }
    /**
     * Gets an Olapic media by its API url.
     * @example
     * OlapicMediaHandler.getMediaByUrl('http://...')
     * .then((media) => {
     *     console.log('Media: ', media);
     * });
     *
     * @param  {String} url - The Olapic API url for the media.
     * @return {Promise<OlapicMediaEntity, Error>} The media entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getMediaByUrl(url) {
        return this.DevKit.rest.get(url).then(((response) => {
            if (response.data._links.length === 0) {
                response.data = response.data._embedded.media[0];
            }

            return this.entityFromJSON(response.data);
        }).bind(this));
    }
    /**
     * Gets an Olapic media by its unique ID.
     * @example
     * OlapicMediaHandler.getMediaByID(12)
     * .then((media) => {
     *     console.log('Media: ', media);
     * });
     *
     * @param  {Number} ID - The media ID.
     * @return {Promise<OlapicMediaEntity, Error>} The media entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getMediaByID(ID) {
        return this.getMediaByUrl(this.DevKit.getEndpoint('mediaByID', {
            ID: ID,
        }));
    }
}
/**
 * @type {OlapicMediaHandler}
 * @module OlapicMediaHandler
 */
export default OlapicMediaHandler;

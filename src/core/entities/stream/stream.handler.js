
import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicMediaHandler from '../media/media.handler';
import OlapicStreamEntity from './stream.entity';
/**
 * The entities handler for the Olapic streams in DevKit.
 * It's basically a set of static methods used to create and obtain streams entities from the API
 * or DevKit itself. It also allows you to acces streams resources, as the cover and base image,
 * from the API.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicStreamsHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a stream entity.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         name: 'My Stream',
     *     },
     * };
     * let stream = OlapicStreamsHandler.entityFromJSON(JSONInfo);
     * // It will log 'My Stream'
     * console.log(stream.get('name'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicStreamEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        if (json.data) {
            json = json.data;
        }

        const stream = Object.assign({}, json);
        [
            '_embedded',
            '_fixed',
            '_forms',
            '_links',
            '_analytics',
            'views',
        ].forEach((remove) => {
            delete stream[remove];
        });

        stream.link = json._links.self.href;
        stream.resources = this.getResourcesFromObject(json._embedded);
        return new OlapicStreamEntity(stream);
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
     *             stream: [
     *                 {
     *                     name: 'Stream One',
     *                 },
     *                 {
     *                     name: 'Stream Two',
     *                 }
     *             ],
     *         },
     *     },
     * };
     * let entities = OlapicStreamsHandler.extractEntities(JSONInfo);
     * // It will log 'Stream One'
     * console.log(entities[0].get('name'));
     *
     * @param  {Object} obj - The API response with the array.
     * @return {Array} A list of parsed entities.
     * @override
     */
    static extractEntities(obj) {
        const result = [];
        (obj.data._embedded.stream || []).forEach((stream) => {
            result.push(this.entityFromJSON(stream));
        }, this);

        return result;
    }
    /**
     * Gets a stream base image as a media entity.
     * @example
     * OlapicStreamsHandler.getStreamBaseImage(streamEntity).then((media) => {
     *     console.log(media.get('caption'));
     * });
     *
     * @return {Promise<OlapicMediaEntity, Error>} A promise with the media entity or an `Error`
     *                                             object if something goes wrong.
     */
    static getStreamBaseImage(stream) {
        return this.DevKit.rest.get(stream.get('resources/base_image/link'))
        .then((response) => {
            return OlapicMediaHandler.entityFromJSON(response.data);
        });
    }
    /**
     * Gets a stream cover image as a media entity.
     * @example
     * OlapicStreamsHandler.getStreamCoverImage(streamEntity).then((media) => {
     *     console.log(media.get('caption'));
     * });
     *
     * @return {Promise<OlapicMediaEntity, Error>} A promise with the media entity or an `Error`
     *                                             object if something goes wrong.
     */
    static getStreamCoverImage(stream) {
        return this.DevKit.rest.get(stream.get('resources/cover_media/link'))
        .then((response) => {
            return OlapicMediaHandler.entityFromJSON(response.data);
        });
    }
    /**
     * Gets an Olapic stream by its API url.
     * @example
     * OlapicStreamsHandler.getStreamByUrl('http://...')
     * .then((stream) => {
     *     console.log('Stream: ', stream);
     * });
     *
     * @param  {String} url - The Olapic API url for the stream.
     * @return {Promise<OlapicStreamEntity, Error>} The stream entity or an `Error` object if
     *                                              something goes wrong.
     */
    static getStreamByUrl(url) {
        return this.DevKit.rest.get(url).then(((response) => {
            if (response.data._links.length === 0) {
                response.data = response.data._embedded.stream[0];
            }

            return this.entityFromJSON(response.data);
        }).bind(this));
    }
    /**
     * Gets an Olapic stream by its unique ID.
     * @example
     * OlapicStreamsHandler.getStreamByID(12)
     * .then((stream) => {
     *     console.log('Stream: ', stream);
     * });
     *
     * @param  {Number} ID - The stream ID.
     * @return {Promise<OlapicStreamEntity, Error>} The stream entity or an `Error` object if
     *                                              something goes wrong.
     */
    static getStreamByID(ID) {
        return this.getStreamByUrl(this.DevKit.getEndpoint('streamByID', {
            ID: ID,
        }));
    }
}
/**
 * @type {OlapicStreamsHandler}
 * @module OlapicStreamsHandler
 */
export default OlapicStreamsHandler;

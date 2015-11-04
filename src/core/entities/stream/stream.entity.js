
import OlapicEntity from '../../interfaces/entity';
import OlapicStreamsHandler from './stream.handler';
/**
 * This represents the Olapic streams in DevKit.
 * @extends {OlapicEntity}
 */
class OlapicStreamEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the streams handler object.
     * @return {OlapicStreamsHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicStreamsHandler;
    }
    /**
     * The class constructor that receives the stream information.
     * @param  {Object} data All the information for the stream.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicStreamEntity';
    }
    /**
     * Gets the stream base image as a media entity.
     * @example
     * .getBaseImage().then((media) => {
     *     console.log(media.get('caption'));
     * });
     *
     * @return {Promise<OlapicMediaEntity, Error>} A promise with the media entity or an `Error`
     *                                             object if something goes wrong.
     */
    getBaseImage() {
        return this.handler.getStreamBaseImage(this);
    }
    /**
     * Gets the stream cover image as a media entity.
     * @example
     * .getCoverImage().then((media) => {
     *     console.log(media.get('caption'));
     * });
     *
     * @return {Promise<OlapicMediaEntity, Error>} A promise with the media entity or an `Error`
     *                                             object if something goes wrong.
     */
    getCoverImage() {
        return this.handler.getStreamCoverImage(this);
    }
}
/**
 * @type {OlapicStreamEntity}
 * @module OlapicStreamEntity
 */
export default OlapicStreamEntity;

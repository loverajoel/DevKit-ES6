
import OlapicBatch from '../../interfaces/batch';
/**
 * Get a paginated list of media entities.
 * @extends {OlapicBatch}
 */
class OlapicMediaBatch extends OlapicBatch {
    /**
     * Create a new media batch.
     * @param  {OlapicEntity}  entity             - A subclass of OlapicEntity which supports the
     *                                              following property path:
     *                                              'resources/media/[sorting]/link', where sorting
     *                                              may be one of the supported sorting options by
     *                                              the Olapic API: recent, shuffled, photorank or
     *                                              rated.
     * @param  {String}        [sorting='recent'] - One of the four supported sorting options by the
     *                                              Olapic API: recent, shuffled, photorank or
     *                                              rated.
     * @param  {Number}        [limit=20]         - The amount of media per page.
     * @param  {Boolean}       [rightsOnly=false] - If true, the batch will return only media that
     *                                              has its rights approved.
     */
    constructor(entity, sorting = 'recent', limit = 20, rightsOnly = false) {
        const url = entity.get('resources/media/' + sorting + '/link');
        super(url, limit, rightsOnly);
    }
}
/**
 * @type {OlapicMediaBatch}
 * @module OlapicMediaBatch
 */
export default OlapicMediaBatch;

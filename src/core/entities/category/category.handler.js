
import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicCategoryEntity from './category.entity';
/**
 * The entities handler for the Olapic categories in DevKit.
 * It's basically a set of static methods used to create and obtain categories from the API or
 * DevKit itself.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicCategoriesHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a category entity.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         name: 'My Category',
     *     },
     * };
     * let category = OlapicCategoriesHandler.entityFromJSON(JSONInfo);
     * // It will log 'My Category'
     * console.log(category.get('name'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicCategoryEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        if (json.data) {
            json = json.data;
        }

        const category = Object.assign({}, json);
        [
            '_embedded',
            '_forms',
            '_links',
        ].forEach((remove) => {
            delete category[remove];
        });

        category.link = json._links.self.href;
        category.resources = this.getResourcesFromObject(json._embedded);
        return new OlapicCategoryEntity(category);
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
     *             category: [
     *                 {
     *                     name: 'Category One',
     *                 },
     *                 {
     *                     name: 'Category Two',
     *                 }
     *             ],
     *         },
     *     },
     * };
     * let entities = OlapicCategoriesHandler.extractEntities(JSONInfo);
     * // It will log 'Category One'
     * console.log(entities[0].get('name'));
     *
     * @param  {Object} obj - The API response with the array.
     * @return {Array} A list of parsed entities.
     * @override
     */
    static extractEntities(obj) {
        const result = [];
        (obj.data._embedded.category || []).forEach((entity) => {
            result.push(this.entityFromJSON(entity));
        }, this);

        return result;
    }
    /**
     * Gets an Olapic category by its API url.
     * @example
     * OlapicCategoriesHandler.getCategoryByUrl('http://...')
     * .then((category) => {
     *     console.log('Category: ', category);
     * });
     *
     * @param  {String} url - The Olapic API url for the category.
     * @return {Promise<OlapicCategoryEntity, Error>} The category entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getCategoryByUrl(url) {
        return this.DevKit.rest.get(url)
        .then(((response) => {
            if (response.data._links.length === 0) {
                response.data = response.data._embedded.category[0];
            }

            return this.entityFromJSON(response.data);
        }).bind(this));
    }
    /**
     * Gets an Olapic category by its unique ID.
     * @example
     * OlapicCategoriesHandler.getCategoryByID(12)
     * .then((category) => {
     *     console.log('Category: ', category);
     * });
     *
     * @param  {Number} ID - The category ID.
     * @return {Promise<OlapicCategoryEntity, Error>} The category entity or an `Error` object if
     *                                                something goes wrong.
     */
    static getCategoryByID(ID) {
        return this.getCategoryByUrl(this.DevKit.getEndpoint('categoryByID', {
            ID: ID,
        }));
    }
}
/**
 * @type {OlapicCategoriesHandler}
 * @module OlapicCategoriesHandler
 */
export default OlapicCategoriesHandler;

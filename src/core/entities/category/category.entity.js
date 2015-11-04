
import OlapicEntity from '../../interfaces/entity';
import OlapicCategoriesHandler from './category.handler';
/**
 * This represents the Olapic categories in DevKit.
 * This type of entity only stores information and doesn't have related content like users or media.
 * @extends {OlapicEntity}
 */
class OlapicCategoryEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the categories handler object.
     * @return {OlapicCategoriesHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicCategoriesHandler;
    }
    /**
     * The class constructor that receives the category information.
     * @param  {Object} data All the information for the category.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicCategoryEntity';
    }
}
/**
 * @type {OlapicCategoryEntity}
 * @module OlapicCategoryEntity
 */
export default OlapicCategoryEntity;


import OlapicEntity from '../../interfaces/entity';
import OlapicWidgetsHandler from './widget.handler';
/**
 * This represents the Olapic widgets in DevKit.
 * This is the entity that can be used to build custom visualization of the Olapic data.
 * @extends {OlapicEntity}
 */
class OlapicWidgetEntity extends OlapicEntity {
    /**
     * A shortcut method to get access to the widgets handler object.
     * @return {OlapicWidgetsHandler} the handler object for this specific type of entity.
     * @override
     */
    get handler() {
        return OlapicWidgetsHandler;
    }
    /**
     * The class constructor that receives the widget information.
     * @param  {Object} data All the information for the widget.
     * @override
     */
    constructor(data) {
        super(data);
        /**
         * An alias/name for the entity.
         * @type {String}
         */
        this.alias = 'OlapicWidgetEntity';
    }
    /**
     * Gets the widgets settings from the API.
     * @example
     * .getSettings().then((settings) => {
     *     console.log(settings);
     * });
     *
     * @return {Promise<Object, Error>} It will return an object with all the widget settings, or an
     *                                  `Error` object in case something goes wrong.
     */
    getSettings() {
        return this.handler.getWidgetSettings(this);
    }
    /**
     * Gets the widget selected stream.
     * @example
     * .getStream().then((stream) => {
     *     console.log(stream.get('name'));
     * });
     *
     * @return {Promise<OlapicStreamEntity, Error>} It will return an stream entity or an `Error`
     *                                              object if something goes wrong or there's no
     *                                              stream associated to this widget.
     */
    getStream() {
        return this.handler.getWidgetStream(this);
    }
    /**
     * Gets the widget selected category.
     * @example
     * .getCategory().then((category) => {
     *     console.log(category.get('name'));
     * });
     *
     * @return {Promise<OlapicCategoryEntity, Error>} It will return an category entity or
     *                                                an `Error` object if something goes wrong or
     *                                                there's no category associated to this
     *                                                wiget.
     */
    getCategory() {
        return this.handler.getWidgetCategory(this);
    }
}
/**
 * @type {OlapicWidgetEntity}
 * @module OlapicWidgetEntity
 */
export default OlapicWidgetEntity;

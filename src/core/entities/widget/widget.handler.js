
import OlapicEntitiesHandler from '../../interfaces/handler';
import OlapicStreamsHandler from '../stream/stream.handler';
import OlapicCategoriesHandler from '../category/category.handler';
import OlapicWidgetEntity from './widget.entity';
import OlapicUtils from '../../../tools/utils';
/**
 * The entities handler for the Olapic widgets in DevKit.
 * It's basically a set of static methods used to create and obtain widgets from the API or
 * DevKit itself.
 * @extends {OlapicEntitiesHandler}
 */
class OlapicWidgetsHandler extends OlapicEntitiesHandler {
    /**
     * It parses a raw API JSON information and returns a widget entity.
     * @example
     * let JSONInfo = {
     *     metadata: {},
     *     data: {
     *         name: 'My Widget',
     *     },
     * };
     * let widget = OlapicWidgetsHandler.entityFromJSON(JSONInfo);
     * // It will log 'My Widget'
     * console.log(widget.get('name'));
     *
     * @param  {Object} json - The raw API JSON object to parse.
     * @return {OlapicWidgetEntity} The entity created from the JSON information.
     * @override
     */
    static entityFromJSON(json) {
        if (json.data) {
            json = json.data;
        }

        const widget = Object.assign({}, json);
        [
            '_embedded',
            '_fixed',
            '_links',
        ].forEach((remove) => {
            delete widget[remove];
        });

        widget.link = json._links.self.href;
        widget.resources = this.getResourcesFromObject(json._embedded);
        return new OlapicWidgetEntity(widget);
    }
    /**
     * Normalize a set of widget settings in order to remove unnecessary information.
     * @param  {Object} settings - The raw settings from the API.
     * @return {Object} The widget settings.
     * @private
     * @ignore
     */
    static _normalizeSettings(settings) {
        settings = settings.data;
        const result = Object.assign({}, settings);
        [
            '_analytics',
            '_fixed',
            '_links',
        ].forEach((remove) => {
            delete result[remove];
        });

        return result;
    }
    /**
     * Gets the settings for a widget.
     * @param  {OlapicWidgetEntity} widget - The widget entity for which the settings are for.
     * @return {Promise<Object, Error>} It will return an object with all the widget settings, or
     *                                  an `Error` object in case something goes wrong.
     */
    static getWidgetSettings(widget) {
        let result = null;
        if (widget._settings) {
            result = OlapicUtils.resolvedPromise(widget._settings);
        } else {
            result = this.getSettingsByUrl(widget.get('resources/setting/link'))
            .then((settings) => {
                widget._settings = settings;
                return widget._settings;
            });
        }

        return result;
    }
    /**
     * Gets a widget selected stream.
     * @example
     * OlapicWidgetsHandler.getWidgetStream(widgetEntity).then((stream) => {
     *     console.log(stream.get('name'));
     * });
     *
     * @return {Promise<OlapicStreamEntity, Error>} It will return an stream entity or an `Error`
     *                                              object if something goes wrong or there's no
     *                                              stream associated to the widget.
     */
    static getWidgetStream(widget) {
        const url = widget.get('resources/stream');
        let result = null;

        if (url) {
            result = this.DevKit.rest.get(url).then((response) => {
                return OlapicStreamsHandler.entityFromJSON(response.data);
            });
        } else {
            result = OlapicUtils.rejectedPromise({
                code: 400,
                message: 'There\'s no stream associated to the widget instance',
            });
        }

        return result;
    }
    /**
     * Gets the widget selected category.
     * @example
     * OlapicWidgetsHandler.getWidgetCategory(widgetEntity).then((category) => {
     *     console.log(category.get('name'));
     * });
     *
     * @return {Promise<OlapicCategoryEntity, Error>} It will return an category entity or
     *                                                an `Error` object if something goes wrong or
     *                                                there's no category associated to the
     *                                                wiget.
     */
    static getWidgetCategory(widget) {
        const url = widget.get('resources/category');
        let result = null;

        if (url) {
            result = this.DevKit.rest.get(url).then((response) => {
                return OlapicCategoriesHandler.entityFromJSON(response.data);
            });
        } else {
            result = OlapicUtils.rejectedPromise({
                code: 400,
                message: 'There\'s no category associated to the widget instance',
            });
        }

        return result;
    }
    /**
     * Gets an Olapic widget by its API url.
     * @example
     * OlapicWidgetsHandler.getWidgetInstanceByUrl('http://...')
     * .then((widget) => {
     *     console.log('Widget: ', widget);
     * });
     *
     * @param  {String} url - The Olapic API url for the widget.
     * @return {Promise<OlapicWidgetEntity, Error>} The widget entity or an `Error` object if
     *                                              something goes wrong.
     */
    static getWidgetInstanceByUrl(url) {
        return this.DevKit.rest.get(url)
        .then(((response) => {
            return this.entityFromJSON(response.data);
        }).bind(this));
    }
    /**
     * Gets an Olapic widget by its unique hash.
     * @example
     * OlapicWidgetsHandler.getWidgetInstanceByHash('abc')
     * .then((widget) => {
     *     console.log('Widget: ', widget);
     * });
     *
     * @param  {String} hash - The Olapic widget unique hash.
     * @return {Promise<OlapicWidgetEntity, Error>} The widget entity or an `Error` object if
     *                                              something goes wrong.
     */
    static getWidgetInstanceByHash(hash) {
        return this.getWidgetInstanceByUrl(this.DevKit.getEndpoint('widgetByHash', {
            hash: hash,
        }));
    }
    /**
     * Gets an Olapic widget settings by its API url.
     * @example
     * OlapicWidgetsHandler.getSettingsByUrl('http://...')
     * .then((settings) => {
     *     console.log('Settings: ', settings);
     * });
     *
     * @param  {String} url - The Olapic API url for the widget settings.
     * @return {Promise<Object, Error>} The widget settings or an `Error` object if something
     *                                  goes wrong.
     */
    static getSettingsByUrl(url) {
        return this.DevKit.rest.get(url).then((response) => this._normalizeSettings(response));
    }
    /**
     * Gets an Olapic widget settings by its unique ID.
     * @example
     * OlapicWidgetsHandler.getSettingsByID(12)
     * .then((settings) => {
     *     console.log('Settings: ', settings);
     * });
     *
     * @param  {String} ID - The settings ID.
     * @return {Promise<Object, Error>} The widget settings or an `Error` object if something
     *                                  goes wrong.
     */
    static getSettingsByID(ID) {
        return this.getSettingsByUrl(this.DevKit.getEndpoint('widgetSettingsByID', {
            ID: ID,
        }));
    }
}
/**
 * @type {OlapicWidgetsHandler}
 * @module OlapicWidgetsHandler
 */
export default OlapicWidgetsHandler;

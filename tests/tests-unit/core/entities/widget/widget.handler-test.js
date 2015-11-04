// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicWidgetsHandler,
    OlapicWidgetEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/widget/widget.handler');

let dummyWidget = null;

describe('OlapicWidgetsHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyWidget = suite.getEntityFromMock(OlapicWidgetsHandler, 'widget');
    });

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicWidgetsHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        suite.getEntitiesFromSingleMock(OlapicWidgetsHandler, 'widget')
        .forEach((instance) => {
            expect(instance).toEqual(jasmine.any(OlapicWidgetEntity));
            expect(instance.get('name')).toEqual('New Instance');
        });
    });

    pit('should get a widget settings', () => {
        return suite.connectDevKitAndExpect('widgetSettings')
        .then(() => OlapicWidgetsHandler.getWidgetSettings(dummyWidget))
        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
        });
    });

    pit('should get a widget settings and store them in the entity', () => {
        return suite.connectDevKitAndExpect('widgetSettings')
        .then(() => OlapicWidgetsHandler.getWidgetSettings(dummyWidget))
        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
            expect(settings).toEqual(dummyWidget._settings);
            return OlapicWidgetsHandler.getWidgetSettings(dummyWidget);
        })

        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
        });
    });

    pit('should get a widget stream', () => {
        return suite.connectDevKitAndExpect('stream')
        .then(() => OlapicWidgetsHandler.getWidgetStream(dummyWidget))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('Testing stream');
        });
    });

    pit('should fail at getting a widget stream', () => {
        let tmpWidget = OlapicWidgetsHandler.entityFromJSON(suite.getJSON('widget'));
        delete tmpWidget.data.resources.stream;
        return suite.connectDevKitAndExpect()
        .then(() => OlapicWidgetsHandler.getWidgetStream(tmpWidget))
        .catch((e) => {
            expect(e.code).toEqual(400);
        });
    });

    pit('should get a widget category', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => OlapicWidgetsHandler.getWidgetCategory(dummyWidget))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

    pit('should fail at getting a widget category', () => {
        let tmpWidget = OlapicWidgetsHandler.entityFromJSON(suite.getJSON('widget'));
        delete tmpWidget.data.resources.category;
        return suite.connectDevKitAndExpect()
        .then(() => OlapicWidgetsHandler.getWidgetCategory(tmpWidget))
        .catch((e) => {
            expect(e.code).toEqual(400);
        });
    });

    pit('should get a widget by its url', () => {
        return suite.connectDevKitAndExpect('widget')
        .then(() => OlapicWidgetsHandler.getWidgetInstanceByUrl('widgets/abc'))
        .then((widget) => {
            expect(widget).toEqual(jasmine.any(OlapicWidgetEntity));
            expect(widget.get('name')).toEqual('New Instance');
        });
    });

    pit('should get a widget by its hash', () => {
        return suite.connectDevKitAndExpect('widget')
        .then(() => OlapicWidgetsHandler.getWidgetInstanceByHash('abc'))
        .then((widget) => {
            expect(widget).toEqual(jasmine.any(OlapicWidgetEntity));
            expect(widget.get('name')).toEqual('New Instance');
        });
    });

    pit('should get a widget settings by url', () => {
        return suite.connectDevKitAndExpect('widgetSettings')
        .then(() => OlapicWidgetsHandler.getSettingsByUrl('settings/12'))
        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
        });
    });

    pit('should get a widget settings by its widget ID', () => {
        return suite.connectDevKitAndExpect('widgetSettings')
        .then(() => OlapicWidgetsHandler.getSettingsByID(12))
        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicWidgetsHandler,
    OlapicWidgetEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

require('../../../../../src/core/entities/widget/widget.entity');

let dummyWidget = null;

describe('OlapicWidgetEntity', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyWidget = suite.getEntityFromMock(OlapicWidgetsHandler, 'widget');
    });

    afterEach(() => suite.afterEach());

    it('should create a new instance', () => suite.testEntity(OlapicWidgetEntity, {
        id: 'd98ddb4715d04bf5357fa324298f387b',
        name: 'New Instance',
        type: 'best_photos',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicWidgetEntity,
        OlapicWidgetsHandler
    ));

    pit('should get the widget settings', () => {
        return suite.connectDevKitAndExpect('widgetSettings')
        .then(() => dummyWidget.getSettings())
        .then((settings) => {
            expect(settings.id).toEqual('1064513346');
            expect(settings.type).toEqual('olapic_slidev3');
        });
    });

    pit('should get the widget stream', () => {
        return suite.connectDevKitAndExpect('stream')
        .then(() => dummyWidget.getStream())
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('Testing stream');
        });
    });

    pit('should get the widget category', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => dummyWidget.getCategory())
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

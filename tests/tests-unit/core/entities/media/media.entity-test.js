// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicMediaHandler,
    OlapicMediaEntity,
    OlapicUserEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/media/media.entity');

let dummyMedia = null;

describe('OlapicMediaEntity', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyMedia = suite.getEntityFromMock(OlapicMediaHandler, 'media');
    });

    afterEach(() => suite.afterEach());

    it('should create a new instance', () => suite.testEntity(OlapicMediaEntity, {
        id: 12,
        caption: 'Olapic Rocks',
        source: 'instagram',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicMediaEntity,
        OlapicMediaHandler
    ));

    pit('should get the media uploader', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => dummyMedia.getUser())
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should report the media', () => {
        let dummyFields = {
            email: 'info@olapic.com',
            reason: 'This photo sucks!',
            headers: {},
        };

        return suite.connectDevKitAndExpectPost()
        .then(() => dummyMedia.report(dummyFields.email, dummyFields.reason))
        .then((response) => {
            expect(response).toEqual(dummyFields);
        });
    });

    pit('should get the media related streams', () => {
        return suite.connectDevKitAndExpect('streams')
        .then(() => dummyMedia.getRelatedStreams())
        .then((streams) => {
            expect(streams.length).toEqual(1);
            expect(streams[0]).toEqual(jasmine.any(OlapicStreamEntity));
            expect(streams[0].get('name')).toEqual('test');
        });
    });

    pit('should get the media related categories', () => {
        return suite.connectDevKitAndExpect('categories')
        .then(() => dummyMedia.getRelatedCategories())
        .then((categories) => {
            expect(categories.length).toEqual(3);
            expect(categories[0]).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(categories[0].get('name')).toEqual('House & Home');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

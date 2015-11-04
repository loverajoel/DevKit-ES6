// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicStreamsHandler,
    OlapicStreamEntity,
    OlapicMediaEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/stream/stream.entity');

let dummyStream = null;

describe('OlapicStreamEntity', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyStream = suite.getEntityFromMock(OlapicStreamsHandler, 'stream');
    });

    afterEach(() => suite.afterEach());

    it('should create a new instance', () => suite.testEntity(OlapicStreamEntity, {
        id: 12,
        name: 'Shoes',
        key: 'shoes',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicStreamEntity,
        OlapicStreamsHandler
    ));

    pit('should get the stream base image', () => {
        return suite.connectDevKitAndExpect('media')
        .then(() => dummyStream.getBaseImage())
        .then((media) => {
            expect(media).toEqual(jasmine.any(OlapicMediaEntity));
            expect(media.get('caption')).toEqual('The Magic Caption');
        });
    });

    pit('should get the stream cover media', () => {
        return suite.connectDevKitAndExpect('media')
        .then(() => dummyStream.getCoverImage())
        .then((media) => {
            expect(media).toEqual(jasmine.any(OlapicMediaEntity));
            expect(media.get('caption')).toEqual('The Magic Caption');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

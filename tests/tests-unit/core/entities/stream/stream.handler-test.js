// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicStreamsHandler,
    OlapicStreamEntity,
    OlapicMediaEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/stream/stream.handler');

describe('OlapicStreamsHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicStreamsHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        suite.getEntitiesFromSingleMock(OlapicStreamsHandler, 'stream')
        .forEach((instance) => {
            expect(instance).toEqual(jasmine.any(OlapicStreamEntity));
            expect(instance.get('name')).toEqual('Testing stream');
        });
    });

    it('should extract a list of entities from a JSON', () => {
        suite.testEntitiesExtraction(OlapicStreamEntity, OlapicStreamsHandler, 'streams', 1);
    });

    it('should try to extract an empty list of entities from a JSON', () => {
        let mock = suite.getJSON('streams');
        mock.data._embedded.stream = null;
        let streams = OlapicStreamsHandler.extractEntities(mock);
        expect(streams.length).toEqual(0);
    });

    pit('should get a stream base image', () => {
        let dummyStream = suite.getEntityFromMock(OlapicStreamsHandler, 'stream');
        return suite.connectDevKitAndExpect('media')
        .then(() => OlapicStreamsHandler.getStreamBaseImage(dummyStream))
        .then((media) => {
            expect(media).toEqual(jasmine.any(OlapicMediaEntity));
            expect(media.get('caption')).toEqual('The Magic Caption');
        });
    });

    pit('should get a stream cover media', () => {
        let dummyStream = suite.getEntityFromMock(OlapicStreamsHandler, 'stream');
        return suite.connectDevKitAndExpect('media')
        .then(() => OlapicStreamsHandler.getStreamCoverImage(dummyStream))
        .then((media) => {
            expect(media).toEqual(jasmine.any(OlapicMediaEntity));
            expect(media.get('caption')).toEqual('The Magic Caption');
        });
    });

    pit('should get a stream by its url', () => {
        return suite.connectDevKitAndExpect('stream')
        .then(() => OlapicStreamsHandler.getStreamByUrl('streams/12'))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('Testing stream');
        });
    });

    pit('should get a single stream by its url from a list', () => {
        return suite.connectDevKitAndExpect('streams')
        .then(() => OlapicStreamsHandler.getStreamByUrl('streams/12'))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('test');
        });
    });

    pit('should get a stream by its ID', () => {
        return suite.connectDevKitAndExpect('streams')
        .then(() => OlapicStreamsHandler.getStreamByID(12))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('test');
        });;
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

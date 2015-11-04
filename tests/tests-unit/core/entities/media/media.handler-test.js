// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicMediaHandler,
    OlapicMediaEntity,
    OlapicUserEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/media/media.handler');

let dummyMedia = null;

describe('OlapicMediaHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyMedia = suite.getEntityFromMock(OlapicMediaHandler, 'media');
    });

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicMediaHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        expect(dummyMedia).toEqual(jasmine.any(OlapicMediaEntity));
        expect(dummyMedia.get('caption')).toEqual('The Magic Caption');
    });

    it('should extract a list of entities from a JSON', () => {
        let mock = suite.getJSON('mediaBatch');
        let media = OlapicMediaHandler.extractEntities(mock);
        expect(media.media.length).toEqual(20);
        media.media.forEach((item) => expect(item).toEqual(jasmine.any(OlapicMediaEntity)));
    });

    it('should try to extract an empty list of entities from a JSON', () => {
        let mock = suite.getJSON('mediaBatch');
        mock.data._embedded.media = null;
        mock.data._links = null;
        let media = OlapicMediaHandler.extractEntities(mock);
        expect(media.media.length).toEqual(0);
        media.media.forEach((item) => expect(item).toEqual(jasmine.any(OlapicMediaEntity)));
    });

    pit('should get a media uploader', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicMediaHandler.getMediaUser(dummyMedia))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should get a media uploader and store it on the entity', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicMediaHandler.getMediaUser(dummyMedia))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
            expect(dummyMedia._user).toEqual(user);
            return OlapicMediaHandler.getMediaUser(dummyMedia);
        })

        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
        });
    });

    pit('should report a media', () => {
        let dummyFields = {
            email: 'info@olapic.com',
            reason: 'This photo sucks!',
            headers: {},
        };

        return suite.connectDevKitAndExpectPost()
        .then(() => OlapicMediaHandler.reportMedia(dummyMedia,
            dummyFields.email,
            dummyFields.reason
        ))
        .then((response) => {
            expect(response).toEqual(dummyFields);
        });
    });

    pit('should get a media related streams', () => {
        return suite.connectDevKitAndExpect('streams')
        .then(() => OlapicMediaHandler.getRelatedStreamsFromMedia(dummyMedia))
        .then((streams) => {
            expect(streams.length).toEqual(1);
            expect(streams[0]).toEqual(jasmine.any(OlapicStreamEntity));
            expect(streams[0].get('name')).toEqual('test');
        });
    });

    pit('should get a media related categories', () => {
        return suite.connectDevKitAndExpect('categories')
        .then(() => OlapicMediaHandler.getRelatedCategoriesFromMedia(dummyMedia))
        .then((categories) => {
            expect(categories.length).toEqual(3);
            expect(categories[0]).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(categories[0].get('name')).toEqual('House & Home');
        });
    });

    pit('should get a media by its url', () => {
        return suite.connectDevKitAndExpect('media')
        .then(() => OlapicMediaHandler.getMediaByUrl('media/12'))
        .then((media) => {
            expect(media).toEqual(jasmine.any(OlapicMediaEntity));
            expect(media.get('caption')).toEqual('The Magic Caption');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

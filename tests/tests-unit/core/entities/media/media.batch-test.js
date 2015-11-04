// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntitiesHandler,
    OlapicBatch,
    OlapicUsersHandler,
    OlapicCustomersHandler,
    OlapicMediaHandler,
    OlapicMediaBatch,
    OlapicMediaEntity,
} = suite.classes;

let dummyMedia = null;

describe('OlapicMediaBatch', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyMedia = suite.getEntityFromMock(OlapicMediaHandler, 'media');
    });

    afterEach(() => suite.afterEach());

    it('should be instantiated', () => {
        let batch = new OlapicMediaBatch(dummyMedia);
        expect(batch).toEqual(jasmine.any(OlapicMediaBatch));
        expect(batch.fetch).toEqual(jasmine.any(Function));
        expect(batch.hasNextPage).toEqual(jasmine.any(Function));
        expect(batch.next).toEqual(jasmine.any(Function));
        expect(batch.hasPrevPage).toEqual(jasmine.any(Function));
        expect(batch.prev).toEqual(jasmine.any(Function));
    });

    pit('should get a list of media', () => {
        let batch = new OlapicMediaBatch(dummyMedia);
        return suite.connectDevKitAndExpect('mediaBatch')
        .then(() => batch.fetch())
        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

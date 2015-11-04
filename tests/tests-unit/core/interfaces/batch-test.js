// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicUsersHandler,
    OlapicCustomersHandler,
    OlapicMediaEntity,
    OlapicBatch,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../src/core/interfaces/batch');

describe('OlapicBatch', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));

    afterEach(() => suite.afterEach());

    it('should be instantiated', () => {
        let batch = new OlapicBatch('intialUrl');
        expect(batch).toEqual(jasmine.any(OlapicBatch));
        expect(batch.fetch).toEqual(jasmine.any(Function));
        expect(batch.hasNextPage).toEqual(jasmine.any(Function));
        expect(batch.next).toEqual(jasmine.any(Function));
        expect(batch.hasPrevPage).toEqual(jasmine.any(Function));
        expect(batch.prev).toEqual(jasmine.any(Function));
    });

    pit('should get a list of media', () => {
        let batch = new OlapicBatch('intialUrl');
        return suite.connectDevKitAndExpect('mediaBatch')
        .then(() => batch.fetch())
        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
        });
    });

    pit('should return an error when calling fetch() while doing another request', () => {
        let batch = new OlapicBatch('intialUrl', 20, true);
        return suite.connectDevKitAndExpect('mediaBatch')
        .then(() => {
            batch.fetch();
            return batch.fetch();
        })

        .catch((e) => {
            expect(e.message).toEqual('The batch it\'s already fetching');
        });
    });

    pit('should move backward and forward', () => {
        let batch = new OlapicBatch('intialUrl');
        return suite.connectDevKitAndExpect('mediaBatch')
        .then(() => batch.fetch())
        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
            let result = null;
            if (batch.hasNextPage()) {
                suite.expect('mediaBatch');
                result = batch.next();
            }

            return result;
        })

        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
            let result = null;
            if (batch.hasPrevPage()) {
                suite.expect('mediaBatch');
                result = batch.prev();
            }

            return result;
        })

        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
        });
    });

    pit('shouldnt be able to move without pagination links', () => {
        let batch = new OlapicBatch('intialUrl');
        return suite.connectDevKitAndExpect('mediaBatch')
        .then(() => batch.fetch())
        .then(() => {
            let mock = suite.getJSON('mediaBatch');
            delete mock.data._links.next;
            delete mock.data._links.prev;
            suite.expect(mock);
            return batch.fetch();
        })

        .then((list) => {
            expect(list.length).toEqual(20);
            expect(list[0]).toEqual(jasmine.any(OlapicMediaEntity));
            expect(batch.hasPrevPage()).toBeFalsy();
            expect(batch.hasNextPage()).toBeFalsy();
        });
    });

});

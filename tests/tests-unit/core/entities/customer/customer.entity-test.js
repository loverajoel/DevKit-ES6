// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicCustomersHandler,
    OlapicCustomerEntity,
    OlapicUserEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/customer/customer.entity');

let dummyCustomer = null;

describe('OlapicCustomerEntity', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyCustomer = suite.getEntityFromMock(OlapicCustomersHandler, 'customer');
    });

    afterEach(() => suite.afterEach());

    it('should create a new instance', () => suite.testEntity(OlapicCustomerEntity, {
        id: 12,
        name: 'The Customer',
        link: 'api/customers/12',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicCustomerEntity,
        OlapicCustomersHandler
    ));

    pit('should get the customer user', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => dummyCustomer.getUser())
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should create a user for the customer', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => dummyCustomer.createUser('olapic', 'info@olapic.com'))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should search for a customer stream', () => {
        return suite.connectDevKitAndExpect('stream')
        .then(() => dummyCustomer.searchStream('shoe'))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('Testing stream');
        });
    });

    pit('should search for a customer category', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => dummyCustomer.searchCategory('shoe'))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

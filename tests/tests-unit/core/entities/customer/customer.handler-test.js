// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicCustomersHandler,
    OlapicCustomerEntity,
    OlapicUserEntity,
    OlapicStreamEntity,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/customer/customer.handler');

let dummyCustomer = null;

describe('OlapicCustomersHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyCustomer = suite.getEntityFromMock(OlapicCustomersHandler, 'customer');
    });

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicCustomersHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        expect(dummyCustomer).toEqual(jasmine.any(OlapicCustomerEntity));
        expect(dummyCustomer.get('name')).toEqual('The Amazing Online Store');
    });

    pit('should get a customer user', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicCustomersHandler.getUserFromCustomer(dummyCustomer))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should get a customer user and store it on the entity', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicCustomersHandler.getUserFromCustomer(dummyCustomer))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
            expect(dummyCustomer._user).toEqual(user);
            return OlapicCustomersHandler.getUserFromCustomer(dummyCustomer);
        })

        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should create a user for a customer', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicCustomersHandler.createUserForCustomer(dummyCustomer,
            'olapic',
            'info@olapic.com'
        ))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should search for a customer stream', () => {
        return suite.connectDevKitAndExpect('stream')
        .then(() => OlapicCustomersHandler.searchStreamFromCustomer(dummyCustomer, 'shoe'))
        .then((stream) => {
            expect(stream).toEqual(jasmine.any(OlapicStreamEntity));
            expect(stream.get('name')).toEqual('Testing stream');
        });
    });

    pit('should search for a customer category', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => OlapicCustomersHandler.searchCategoryFromCustomer(dummyCustomer, 'shoe'))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

    pit('should get a customer by its url', () => {
        return suite.connectDevKitAndExpect('customer')
        .then(() => OlapicCustomersHandler.getCustomerByUrl('customers/12'))
        .then((customer) => {
            expect(customer).toEqual(jasmine.any(OlapicCustomerEntity));
            expect(customer.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should get a customer by its ID', () => {
        return suite.connectDevKitAndExpect('customer')
        .then(() => OlapicCustomersHandler.getCustomerByID(12))
        .then((customer) => {
            expect(customer).toEqual(jasmine.any(OlapicCustomerEntity));
            expect(customer.get('name')).toEqual('The Amazing Online Store');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

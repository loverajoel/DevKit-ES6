// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
jest.autoMockOff();

const {
    suite,
    FetchStub,
} = require('../../' + OLAPIC_TEST_UTILS);

const {OlapicDevKit} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../src/core/devkit');

// Dummy data for the singleton configuration
const dummyData = {
    APIKeyOne: '<RANDOM-KEY>',
    APIKeyTwo: '<ANOTHER-RANDOM-KEY>',
    APIUrl: 'test.api.olapic.com',
    APIVersionOne: 'v2.2',
    APIVersionTwo: 'v2.3',
    widgetID: '<WIDGET>',
};

// Dummmy urls to test the endpoint generation
const dummyUrls = {
    categoryByID: {
        url: '/category/12',
        args: {
            ID: 12,
        },
    },
    widgetByHash: {
        url: '/widgets/abc',
        args: {
            hash: 'abc',
        },
    },
    widgetSettingsByID: {
        url: '/widgets/settings/12',
        args: {
            ID: 12,
        },
    },
    customerByID: {
        url: '/customers/12',
        args: {
            ID: 12,
        },
    },
    mediaByID: {
        url: '/media/12',
        args: {
            ID: 12,
        },
    },
    streamByID: {
        url: '/streams/12',
        args: {
            ID: 12,
        },
    },
    userByID: {
        url: '/users/12',
        args: {
            ID: 12,
        },
    },
    instagramUserForCustomer: {
        url: '/customers/12/instagram_users/olapic',
        args: {
            ID: 12,
            username: 'olapic',
        },
    },
};

describe('OlapicDevKit', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));

    afterEach(() => suite.afterEach());

    it('should work as a singleton', () => {
        let tmpInstance = OlapicDevKit.getInstance();
        expect(tmpInstance.APIKey).toEqual(suite.DevKit.APIKey);
    });

    it('should throw an error when the constructor is called', () => {
        let msg = 'OlapicDevKit is a singleton, use .getInstance() instead';
        expect(() => { new OlapicDevKit(); }).toThrow(new Error(msg));
    });

    pit('should connect and return the customer', () => {
        suite.expect('customer');
        return suite.DevKit.connect().then((customer) => {
            expect(customer.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should connect with a customer and a widget instance', () => {
        suite.expect('widget');
        return suite.DevKit.connect(dummyData.widgetID)
        .then((response) => {
            let {
                customer,
                widget
            } = response;
            expect(customer.get('name')).toEqual('The Amazing Online Store');
            expect(widget.get('resources/setting').link).toMatch(/settings\/1183078077/ig);
        });
    });

    pit('should connect, stay connected and then disconnect', () => {
        suite.expect('customer');
        return suite.DevKit.connect().then((customer) => {
            expect(customer.get('name')).toEqual('The Amazing Online Store');
            expect(suite.DevKit.connected).toBeTruthy();
            return suite.DevKit.connect();
        })

        .then((customer) => {
            expect(customer.get('name')).toEqual('The Amazing Online Store');
            expect(suite.DevKit.customer.get('name')).toEqual('The Amazing Online Store');
            expect(suite.DevKit.connected).toBeTruthy();
            suite.DevKit.disconnect();
            suite.expect('customer');
            expect(suite.DevKit.connected).toBeFalsy();
            expect(suite.DevKit.customer).toBeNull();
            return suite.DevKit.connect();
        })

        .then((customer) => {
            expect(customer.get('name')).toEqual('The Amazing Online Store');
            expect(suite.DevKit.connected).toBeTruthy();
        });
    });

    it('should update the rest client base settings when the API key changes', () => {
        let restRef = suite.DevKit.rest;
        expect(restRef._baseQuery.auth_token).toEqual(dummyData.APIKeyOne);
        suite.DevKit.APIKey = dummyData.APIKeyTwo;
        expect(restRef._baseQuery.auth_token).toEqual(dummyData.APIKeyTwo);

        expect(restRef._baseQuery.version).toEqual(dummyData.APIVersionOne);
        suite.DevKit.APIVersion = dummyData.APIVersionTwo;
        expect(restRef._baseQuery.version).toEqual(dummyData.APIVersionTwo);
        suite.DevKit.APIVersion = dummyData.APIVersionOne;
        expect(restRef._baseQuery.version).toEqual(dummyData.APIVersionOne);

        expect(suite.DevKit.APIKey).toEqual(dummyData.APIKeyTwo);
        expect(suite.DevKit.APIVersion).toEqual(dummyData.APIVersionOne);
    });

    it('should parse and retrieve the known endpoints', () => {
        Object.keys(dummyUrls).forEach((name) => {
            let properties = dummyUrls[name];
            let url = suite.DevKit.getEndpoint(name, properties.args);
            expect(suite.DevKit.APIUrl + properties.url).toEqual(url);
        });

        expect(suite.DevKit.getEndpoint('random')).toBeNull();
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicUtils,
    OlapicUsersHandler,
    OlapicUserEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/user/user.handler');

describe('OlapicUsersHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicUsersHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        suite.getEntitiesFromSingleMock(OlapicUsersHandler, 'uploader')
        .forEach((instance) => {
            expect(instance).toEqual(jasmine.any(OlapicUserEntity));
            expect(instance.get('name')).toEqual('The Amazing Online Store');
        });
    });

    it('should get a user upload url', () => {
        let dummyUser = suite.getEntityFromMock(OlapicUsersHandler, 'uploader');
        let url = '{base}?auth_token={token}&version={version}';
        let userUrl = OlapicUsersHandler.getUserUploadUrl(dummyUser);
        expect(userUrl).toEqual(OlapicUtils.assignToString(url, {
            base: dummyUser.get('actions/media/upload/action/href'),
            token: suite.DevKit.APIKey,
            version: suite.DevKit.APIVersion,
        }));
    });

    pit('should get a user by its url', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicUsersHandler.getUserByUrl('users/12'))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should get a user by its ID', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then(() => OlapicUsersHandler.getUserByID(12))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

    pit('should get an Instagram account for a customer', () => {
        return suite.connectDevKitAndExpect('uploader')
        .then((customer) => OlapicUsersHandler.getInstagramUserForCustomer(customer, 'olapic'))
        .then((user) => {
            expect(user).toEqual(jasmine.any(OlapicUserEntity));
            expect(user.get('name')).toEqual('The Amazing Online Store');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicUtils,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicUsersHandler,
    OlapicUserEntity,
    OlapicMediaEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/user/user.entity');

let dummyUser = null;

describe('OlapicUserEntity', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));
    beforeEach(() => {
        dummyUser = suite.getEntityFromMock(OlapicUsersHandler, 'uploader');
    });

    afterEach(() => suite.afterEach());

    it('should create a new instance', () => suite.testEntity(OlapicUserEntity, {
        id: 12,
        username: 'olapicAdmin',
        name: 'admin',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicUserEntity,
        OlapicUsersHandler
    ));

    it('should get the user upload url', () => {
        let url = '{base}?auth_token={token}&version={version}';
        expect(dummyUser.getUploadUrl()).toEqual(OlapicUtils.assignToString(url, {
            base: dummyUser.get('actions/media/upload/action/href'),
            token: suite.DevKit.APIKey,
            version: suite.DevKit.APIVersion,
        }));
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntitiesHandler,
    OlapicUsersHandler,
    OlapicCustomersHandler,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../src/core/interfaces/handler');

describe('OlapicEntitiesHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicEntitiesHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should return null on the methods that need to be overwritten', () => {
        expect(OlapicEntitiesHandler.entityFromJSON()).toBeNull();
        expect(OlapicEntitiesHandler.extractEntities()).toBeNull();
    });

    it('should parse a list of resources from an object', () => {
        let mock = suite.getJSON('customer').data._embedded.customer._embedded;
        let resources = OlapicEntitiesHandler.getResourcesFromObject(mock);
        expect(resources.user.link).toMatch(/\/users\/350829/i);
        expect(resources.media.rated.link).toMatch(/customers\/1\/media\/rated/i);
    });

    it('should parse a list of forms from an object', () => {
        let mock = suite.getJSON('customer').data._embedded.customer._forms;
        mock.media = {};
        mock.medium = {};
        let forms = OlapicEntitiesHandler.getFormsFromObject(mock);
        expect(forms.streams).toEqual(jasmine.any(Object));
        expect(forms.streams.search.title).toEqual('Search streams');
        expect(forms.categories).toEqual(jasmine.any(Object));
        expect(forms.categories.search.title).toEqual('Search categories');
        expect(forms.stashes).toEqual(jasmine.any(Object));
        expect(forms.stashes.create.title).toEqual('Create stash');
        expect(forms.users).toEqual(jasmine.any(Object));
        expect(forms.users.create.title).toEqual('Create user');
    });

    it('should be able to access DevKit using the static getter', () => {
        expect(OlapicEntitiesHandler.DevKit).toEqual(jasmine.any(OlapicDevKit));
    });

});

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicCategoriesHandler,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/category/category.handler');

describe('OlapicCategoriesHandler', () => {

    beforeEach(() => suite.beforeEach(OlapicDevKit));

    afterEach(() => suite.afterEach());

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicCategoriesHandler();
        expect(Object.keys(instance).length).toEqual(0);
    });

    it('should create an entity from a JSON', () => {
        let mock = suite.getJSON('category');
        [
            OlapicCategoriesHandler.entityFromJSON(mock.data),
            OlapicCategoriesHandler.entityFromJSON(mock),
        ].forEach((instance) => {
            expect(instance).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(instance.get('name')).toEqual('Shoes');
        });
    });

    it('should extract a list of entities from a JSON', () => {
        let mock = suite.getJSON('categories');
        let categories = OlapicCategoriesHandler.extractEntities(mock);
        expect(categories.length).toEqual(3);
        categories.forEach((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
        });
    });

    it('should try to extract an empty list of entities from a JSON', () => {
        let mock = suite.getJSON('categories');
        mock.data._embedded.category = null;
        let categories = OlapicCategoriesHandler.extractEntities(mock);
        expect(categories.length).toEqual(0);
    });

    pit('should get a category by its url', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => OlapicCategoriesHandler.getCategoryByUrl('categories/12'))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

    pit('should get a single category by its url from a list', () => {
        return suite.connectDevKitAndExpect('categories')
        .then(() => OlapicCategoriesHandler.getCategoryByUrl('categories/12'))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('House & Home');
        });
    });

    pit('should get a category by its ID', () => {
        return suite.connectDevKitAndExpect('category')
        .then(() => OlapicCategoriesHandler.getCategoryByID(12))
        .then((category) => {
            expect(category).toEqual(jasmine.any(OlapicCategoryEntity));
            expect(category.get('name')).toEqual('Shoes');
        });
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

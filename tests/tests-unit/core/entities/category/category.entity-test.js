// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicDevKit,
    OlapicEntity,
    OlapicEntitiesHandler,
    OlapicCategoriesHandler,
    OlapicCategoryEntity,
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../../src/core/entities/category/category.entity');

describe('OlapicCategoryEntity', () => {

    it('should create a new instance', () => suite.testEntity(OlapicCategoryEntity, {
        id: 12,
        name: 'Shoes',
        key: 'shoes',
        link: 'api/categories/12',
    }));

    it('should access the entity handler using the class getter', () => suite.testEntityHandler(
        OlapicCategoryEntity,
        OlapicCategoriesHandler
    ));

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

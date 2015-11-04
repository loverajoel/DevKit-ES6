// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Disable autoMock for coverage.
jest.autoMockOff();

const {suite} = require('../../../' + OLAPIC_TEST_UTILS);

const {
    OlapicEntity
} = suite.classes;

// For coverage reasons, this line needs to be here, and the path can't be generated.
require('../../../../src/core/interfaces/entity');

describe('OlapicEntity', () => {

    it('should create a new instance', () => suite.testEntity(OlapicEntity, {
        id: 12,
        name: 'entity',
        key: 'entityKey',
        link: 'api/entity/12',
    }));

    it('should be able to access a property using the get method', () => {
        const data = {
            id: 12,
            name: 'entity',
            links: {
                self: {
                    href: 'api/entity/12',
                },
            },
        };
        const entity = new OlapicEntity(data);
        expect(entity.get('id')).toEqual(data.id);
        expect(entity.get('links/self/href')).toEqual(data.links.self.href);
        expect(entity.get('random/property')).toBeNull();
    });

    it('should have access to the entity handler using the class getter', () => {
        expect(new OlapicEntity({}).handler).toBeNull();
    });

    it('should return the entity alias using toString', () => {
        expect(new OlapicEntity({}).toString()).toEqual('<OlapicEntity>');
    });

});

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

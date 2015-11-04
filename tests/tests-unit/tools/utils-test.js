
jest.autoMockOff();

const OlapicUtils = require('../../../src/tools/utils');

describe('OlapicUtils', () => {

    it('shouldn\'t have any instance method', () => {
        const instance = new OlapicUtils();
        expect(Object.keys(instance).length).toEqual(0);
    });

    pit('rejectedPromise: It should return an already rejected promise', () => {
        return OlapicUtils.rejectedPromise('olapic').catch((e) => {
            expect(e).toEqual('olapic');
        });
    });

    pit('resolvedPromise: It should return an already resolved promise', () => {
        return OlapicUtils.resolvedPromise('olapic').then((msg) => {
            expect(msg).toEqual('olapic');
        });
    });

    it('assignToString: It should successfully inject string assigments', () => {
        expect(OlapicUtils.assignToString('{brand} rocks!', {
            brand: 'Olapic',
        })).toEqual('Olapic rocks!');

        let tmp = {
            hello: 'world',
        };
        expect(OlapicUtils.assignToString(tmp)).toEqual(tmp);
    });

});

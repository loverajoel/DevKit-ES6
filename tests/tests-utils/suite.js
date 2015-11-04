
const FetchSub = require('./fetchStub');

class OlapicUnitTestSuite {

    constructor() {
        this.DevKit = null;
        this.fetchObj = null;
    }

    get classes() {
        return require('../../src/index');
    }

    beforeEach(singleton = null, injectFetchOject = true, APIKey = '<RANDOM-KEY>') {
        this.DevKit = singleton ? singleton.getInstance(APIKey) : null;
        this.fetchObj = new FetchSub();
        if (singleton && injectFetchOject) {
            this.DevKit.rest.setFetchObject(this.fetchObj.fetch.bind(this.fetchObj));
        }

    }

    afterEach() {
        if (this.DevKit && this.DevKit.connected) {
            this.DevKit.disconnect();
        }

        this.DevKit = null;
        this.fetchObj.verifyExpectations();
        this.fetchObj = null;
    }

    getJSON(mockName) {
        return this.fetchObj.getMock(mockName, true);
    }

    expect(mock = null) {
        if (typeof mock === 'string' || !mock) {
            this.fetchObj.expectResponseFromMock(mock);
        } else {
            this.fetchObj.expectResponse(JSON.stringify(mock));
        }
    }

    expectPost() {
        this.fetchObj.expectPost();
    }

    connectDevKit(mockName = 'customer') {
        this.expect(mockName);
        return this.DevKit.connect();
    }

    connectDevKitAndExpect(mockName = null) {
        return this.connectDevKit().then((customer) => {
            if (mockName) {
                this.expect(mockName);
            }

            return customer;
        }.bind(this));
    }

    connectDevKitAndExpectPost() {
        return this.connectDevKit().then(() => {
            this.expectPost();
        }.bind(this));
    }

    getEntityFromMock(HandlerClass, mockName) {
        return HandlerClass.entityFromJSON(this.getJSON(mockName));
    }

    getEntitiesFromSingleMock(HandlerClass, mockName) {
        let mock = this.getJSON(mockName);
        return [
            HandlerClass.entityFromJSON(mock.data),
            HandlerClass.entityFromJSON(mock),
        ];
    }

    testEntity(EntityClass, data) {
        let entity = new EntityClass(data);
        expect(entity).toEqual(jasmine.any(EntityClass));
        Object.keys(data).forEach((key) => {
            expect(entity.get(key)).toEqual(data[key]);
        });
    }

    testEntitiesExtraction(EntityClass, HandlerClass, mockName, length) {
        let mock = this.getJSON(mockName);
        let entities = HandlerClass.extractEntities(mock);
        expect(entities.length).toEqual(length);
        entities.forEach((entity) => {
            expect(entity).toEqual(jasmine.any(EntityClass));
        });
    }

    testEntityHandler(EntityClass, HandlerClass) {
        expect((new EntityClass({}).handler)).toEqual(HandlerClass);
    }

}

export default (new OlapicUnitTestSuite);

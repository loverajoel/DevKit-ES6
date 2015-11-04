class FetchStub {

    constructor() {
        this.noResponseMessage = '<NO-RESPONSE>';

        this._response = null;
        this._expecting = false;
        this._expectingPost = false;
        this._mockName = null;
    }

    expectResponse(response = null) {
        this._response = response;
        this._expecting = true;
    }

    expectResponseFromMock(mockName) {
        var mockContent = this.getMock(mockName);
        this._mockName = mockName;
        this.expectResponse(mockContent);
    }

    expectPost() {
        this._expectingPost = true;
    }

    getMock(mockName, json = false) {
        var mockContent = require('./mocks/' + mockName);
        if (!mockContent) {
            throw new Error('There\'s no mock file named \'' + mockName + '\'');
        } else if (json) {
            mockContent = JSON.parse(mockContent);
        }

        return mockContent;
    }

    fetch(url, properties) {
        return new Promise((resolve, reject) => {
            if (this._expecting) {
                this._expecting = false;
                if (this._response !== null) {
                    resolve(new FetchStubResponse(this._response, properties));
                } else {
                    reject(new Error(this.noResponseMessage));
                }
            } else if (this._expectingPost) {
                this._expectingPost = false;
                resolve(new FetchStubResponse(properties.body, properties));
            } else {
                reject(new Error('Unexpected request to ' + url));
            }

        }.bind(this));
    }

    verifyExpectations() {
        if (this._expecting) {
            var errorMessage = '';
            if (this._mockName) {
                errorMessage = 'Expect request for the following mock was never made: ';
                errorMessage += this._mockName;
            } else if (this._response === null) {
                errorMessage = 'Expected request was never made';
            } else {
                errorMessage = 'Expected request for custom response was never made: ';
                errorMessage += JSON.stringify(this._response);
            }

            throw new Error(errorMessage);
        } else if (this._expectingPost) {
            throw new Error('Expected POST request was never made');
        }
    }

}

class FetchStubResponse {

    constructor(data, properties) {
        this.data = data;
        this.properties = properties;
    }

    json() {
        var result = JSON.parse(this.data);
        if (this.properties.headers) {
            result.headers = this.properties.headers;
        }

        return result;
    }

}

export default FetchStub;

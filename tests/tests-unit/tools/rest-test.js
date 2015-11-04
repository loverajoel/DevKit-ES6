// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
jest.autoMockOff();

const OlapicRestClient = require('../../../src/tools/rest');
const {FetchStub} = require('../../' + OLAPIC_TEST_UTILS);

var dummyClient = null;
var dummyHeaders = {
    DevKitHeader: 'DevKitHeaderValue',
};
let dummyOption = null;
let fetchbObj = new FetchStub();
let dummySettings = {
    auth_token: 'SOME_TOKEN',
    version: 'v2.2',
};

describe('OlapicRestClient', () => {

    beforeEach(() => {
        dummyClient = new OlapicRestClient();
        dummyClient.setRequestBaseQuery(dummySettings);
        dummyClient.setFetchObject(fetchbObj.fetch.bind(fetchbObj));
    });

    afterEach(() => {
        dummyClient = null;
        fetchbObj.verifyExpectations();
    });

    it('should be a class function', () => {
        expect(OlapicRestClient).toEqual(jasmine.any(Function));
    });

    it('should access the original Fetch object by default', () => {
        const dummyFetch = { hello: 'world' };
        window.fetch = dummyFetch;
        dummyClient.setFetchObject(null);
        expect(dummyClient.getFetchObject()).toEqual(dummyFetch);
    });

    it('should be instantiated and have public methods', () => {
        expect(dummyClient).toEqual(jasmine.any(OlapicRestClient));
        expect(dummyClient.get).toEqual(jasmine.any(Function));
        expect(dummyClient.post).toEqual(jasmine.any(Function));
        expect(dummyClient.setRequestBaseQuery).toEqual(jasmine.any(Function));
        expect(dummyClient.getRequestBaseQuery).toEqual(jasmine.any(Function));
        expect(dummyClient.setRequestBaseHeaders).toEqual(jasmine.any(Function));
        expect(dummyClient.getRequestBaseHeaders).toEqual(jasmine.any(Function));
        expect(dummyClient.setOption).toEqual(jasmine.any(Function));
        expect(dummyClient.getOption).toEqual(jasmine.any(Function));
    });

    pit('should use the pre cache to get a media uploader', () => {
        fetchbObj.expectResponseFromMock('media');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: ['uploader'],
            preCacheEndpoints: /\/media\//g,
        });
        console.log = jasmine.createSpy('log');
        dummyClient.setOption('debug', true);
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            const logMessage = 'OlapicRestClient: Add resource: uploader';
            expect(console.log).toHaveBeenCalledWith(logMessage);
            expect(response.metadata.cached).toBeUndefined();
            return dummyClient.get(response.data._embedded.uploader._links.self.href);
        })

        .then((response) => {
            expect(response.metadata.cached).not.toBeUndefined();
        });
    });

    pit('should use the pre cache without the sharding setting', () => {
        fetchbObj.expectResponseFromMock('media');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: ['uploader'],
            preCacheEndpoints: /\/media\//g,
            filterSharding: false,
        });
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            return dummyClient.get(response.data._embedded.uploader._links.self.href);
        })

        .then((response) => {
            expect(response.metadata.cached).not.toBeUndefined();
        });
    });

    pit('shouldn\'t pre cache if the entity doesn\'t have links', () => {
        fetchbObj.expectResponseFromMock('invalidMedia');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: ['uploader'],
            preCacheEndpoints: /\/media\//g,
        });
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            expect(Object.keys(dummyClient.preCache).length).toEqual(0);
        });
    });

    pit('shouldn\'t pre cache if the entity _embedded property is empty', () => {
        fetchbObj.expectResponseFromMock('mediaWithEmptyEmbedded');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: ['uploader'],
            preCacheEndpoints: /\/media\//g,
        });
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            expect(Object.keys(dummyClient.preCache).length).toEqual(0);
        });
    });

    pit('shouldn\'t pre cache if the endpoint doesnt match the setting', () => {
        fetchbObj.expectResponseFromMock('media');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: ['uploader'],
            preCacheEndpoints: /\/media\//g,
            preCacheEmbeddedPropertiesPerEndpoint: {
                uploader: /\/stream\//g,
            },
        });
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            expect(Object.keys(dummyClient.preCache).length).toEqual(0);
        });
    });

    pit('should use the pre cache on a media batch for a streams array', () => {
        fetchbObj.expectResponseFromMock('mediaBatchWithStreams');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: [
                'streams:all',
                'media',
            ],
            preCacheEndpoints: /\/media\//g,
        });
        return dummyClient.get('api.olapic.com/media/recent')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            var url = response.data._embedded.media[0]._embedded['streams:all']._links.self.href;
            return dummyClient.get(url);
        })

        .then((response) => {
            expect(response.data._embedded.stream[0].id).toBe('1975619675');
            expect(response.metadata.cached).not.toBeUndefined();
        });
    });

    pit('should use the pre cache on a list of streams without links', () => {
        fetchbObj.expectResponseFromMock('streamsWithoutLinks');
        var regex = /\/(media|stream|streams|users)\/([0-9]+|recent)(\/streams|)(\?|)/g;
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: [
                'cover_media',
            ],
            preCacheEndpoints: regex,
        });
        return dummyClient.get('api.olapic.com/media/42/streams')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            expect(Object.keys(dummyClient.getOption('preCache')).length).toBe(2);
            var url = response.data._embedded.stream[0]._embedded.cover_media._links.self.href;
            return dummyClient.get(url);
        })

        .then((response) => {
            expect(response.metadata.cached).not.toBeUndefined();
        });
    });

    pit('should use the pre cache on a stream cover media and fix the entity name', () => {
        fetchbObj.expectResponseFromMock('stream');
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: [
                'cover_media',
            ],
            preCacheEndpoints: /\/(media|stream|streams|users)\/([0-9]+|recent)(\/streams|)(\?|)/g,
            preCacheEntityNamesReplacement: {
                cover_media: 'media',
            },
        });
        var coverMediaLink = null;
        return dummyClient.get('api.olapic.com/stream/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            coverMediaLink = response.data._embedded.cover_media._links.self.href;
            return dummyClient.get(response.data._embedded.cover_media._links.self.href);
        })

        .then((response) => {
            expect(response.metadata.cached).not.toBeUndefined();
            expect(response.data._links.self.href).toEqual(coverMediaLink);
        });
    });

    pit('should use the needed property to correctly remove entries from the pre cache', () => {
        fetchbObj.expectResponseFromMock('mediaBatch');
        var regex = /\/(media|customers|users)\/([0-9]+|latest)(\/media\/recent\/|)(\?|)/g;
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: [
                'uploader',
                'media',
            ],
            preCacheEndpoints: regex,
        });
        var uploaderURL = null;
        var preCacheRef = dummyClient.getOption('preCache');
        return dummyClient.get('api.olapic.com/media/latest')
        .then((response) => {
            uploaderURL = response.data._embedded.media[17]._embedded.uploader._links.self.href;
            uploaderURL = uploaderURL.replace(dummyClient.getOption('shardingPattern'), '');
            expect(preCacheRef[uploaderURL].needed).toBe(3);
            expect(preCacheRef[uploaderURL].used).toBe(0);
            return dummyClient.get(uploaderURL);
        })

        .then((response) => {
            expect(response.metadata.cached).not.toBeUndefined();
            expect(preCacheRef[uploaderURL].used).toBe(1);
            dummyClient.useCache(uploaderURL);
            expect(preCacheRef[uploaderURL].used).toBe(2);
            return dummyClient.get(uploaderURL);
        })

        .then((response) => {
            expect(preCacheRef[uploaderURL]).toBeUndefined();
            expect(response.needed).toBe(3);
            expect(response.used).toBe(3);
            expect(dummyClient.useCache(uploaderURL)).toBeFalsy();
        });
    });

    pit('should successfully clean the pre cache', () => {
        fetchbObj.expectResponseFromMock('mediaBatch');
        var regex = /\/(media|customers|users)\/([0-9]+|latest)(\/media\/recent\/|)(\?|)/g;
        dummyClient.setOptions({
            preCacheEnabled: true,
            preCacheEmbeddedProperties: [
                'uploader',
                'media',
            ],
            preCacheEndpoints: regex,
        });
        var preCacheRef = dummyClient.getOption('preCache');
        return dummyClient.get('api.olapic.com/media/latest')
        .then(() => {
            expect(Object.keys(preCacheRef).length).toBe(15);
            dummyClient.cleanCache();
            expect(Object.keys(preCacheRef).length).toBe(0);
        });
    });

    pit('should request for a media uploader without pre cache', () => {
        fetchbObj.expectResponseFromMock('media');
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
            fetchbObj.expectResponseFromMock('uploader');
            return dummyClient.get(response.data._embedded.uploader._links.self.href);
        })

        .then((response) => {
            expect(response.metadata.cached).toBeUndefined();
        });
    });

    it('should be able to change the value of the editable options', () => {
        expect(dummyClient.setOption('preCacheEnabled', false)).toBe(dummyClient);
        expect(dummyClient.getOption('preCacheEmbeddedProperties')).toEqual(jasmine.any(Array));
        expect(dummyClient.getOption('someOption')).toBeNull();
        expect(dummyClient.setOption('preCacheEntityNamesReplacement', {
            'streams:all': 'stream',
            'categories:all': 'category',
        })).toBe(dummyClient);
        expect(dummyClient.setOption('preCacheEntityNamesReplacement', {
            'media:recent': 'media',
        }, true)).toBe(dummyClient);
        dummyOption = dummyClient.getOption('preCacheEntityNamesReplacement');
        expect(dummyOption['streams:all']).toBe('stream');
        expect(dummyOption['categories:all']).toBe('category');
        expect(dummyOption['media:recent']).toBe('media');
        expect(Object.keys(dummyOption).length).toBe(3);
        dummyClient.setOptions({
            preCacheEntityNamesReplacement: {
                random: 'value',
            },
            preCacheEnabled: true,
        });
        expect(dummyClient.getOption('preCacheEnabled')).toBeTruthy();
        dummyOption = dummyClient.getOption('preCacheEntityNamesReplacement');
        expect(dummyOption.random).toBe('value');
        dummyClient.setOption('randomProperty', 'randomValue');
        expect(dummyClient.getOption('randomProperty')).toBeNull();
    });

    pit('should be able to set base headers and keep them on multiple requests', () => {
        fetchbObj.expectResponseFromMock('media');
        dummyClient.setRequestBaseHeaders(dummyHeaders);
        return dummyClient.get('api.olapic.com/media/42')
        .then((response) => {
            expect(response.headers).toEqual(dummyHeaders);
            fetchbObj.expectResponseFromMock('uploader');
            return dummyClient.get(response.data._embedded.uploader._links.self.href);
        })

        .then((response) => {
            expect(response.headers).toEqual(dummyHeaders);
        });
    });

    pit('should be able to merge base headers with custom headers', () => {
        fetchbObj.expectResponseFromMock('media');
        dummyClient.setRequestBaseHeaders(dummyHeaders);
        return dummyClient.get('api.olapic.com/media/42', {}, {a: 'b'})
        .then((response) => {
            expect(response.headers).toEqual(Object.assign(dummyHeaders, {a: 'b'}));
            fetchbObj.expectResponseFromMock('uploader');
            return dummyClient.get(response.data._embedded.uploader._links.self.href);
        })

        .then((response) => {
            expect(response.headers).toEqual(dummyHeaders);
        });
    });

    pit('should successfully send a POST request', () => {
        fetchbObj.expectPost();
        let dummyFields = {
            fieldOne: 'valueOne',
            fieldTwo: 'valueTwo',
            headers: {},
        };
        return dummyClient.post('post.api.olapic.com', dummyFields)
        .then((response) => {
            expect(response).toEqual(dummyFields);
        });
    });

    pit('should fail while doing a request', () => {
        fetchbObj.expectResponse();
        return dummyClient.get('olapic')
        .catch((e) => {
            expect(e.message).toEqual(fetchbObj.noResponseMessage);
        });
    });

    pit('should reject a request promise when the metadata returns 404', () => {
        fetchbObj.expectResponseFromMock('404');
        return dummyClient.get('404')
        .catch((e) => {
            expect(e.data.message).toEqual('hello world');
        });
    });

    it('should return the base query string and headers using the class getters', () => {
        expect(dummyClient.getRequestBaseQuery()).toEqual(dummySettings);
        dummyClient.setRequestBaseHeaders(dummyHeaders);
        expect(dummyClient.getRequestBaseHeaders()).toEqual(Object.assign(dummyHeaders, {a: 'b'}));
    });

});
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

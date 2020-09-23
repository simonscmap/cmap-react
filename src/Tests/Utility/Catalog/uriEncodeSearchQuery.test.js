import uriEncodeSearchQuery from '../../../Utility/Catalog/uriEncodeSearchQuery';

let testObject = {
    keywords: ['hello', 'there'],
    hasDepth: 'yes',
    startTime: '2020-01-01',
    endTime: '2020-01-02'
}

describe('correctly generates a valid url querstring from an object', () => {
    test('encoding the produced string results in no changes', () => {
        let encoded = uriEncodeSearchQuery(testObject);
        expect(encoded).toEqual(encodeURI(encoded));
    })
});
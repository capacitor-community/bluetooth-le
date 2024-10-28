import {
  dataViewToHexString,
  hexStringToDataView,
  numberToUUID,
  numbersToDataView,
  dataViewToNumbers,
  dataViewToText,
  textToDataView,
  webUUIDToString,
  mapToObject,
} from './conversion';

describe('numbersToDataView', () => {
  it('should convert an array of numbers to a DataView', () => {
    const value = [0, 5, 200];
    const result = numbersToDataView(value);
    expect(result.byteLength).toEqual(3);
    expect(result.byteOffset).toEqual(0);
    expect(result.getUint8(0)).toEqual(0);
    expect(result.getUint8(1)).toEqual(5);
    expect(result.getUint8(2)).toEqual(200);
  });

  it('should convert an empty array to a DataView', () => {
    const value: number[] = [];
    const result = numbersToDataView(value);
    expect(result.byteLength).toEqual(0);
    expect(result.byteOffset).toEqual(0);
  });
});

describe('dataViewToNumbers', () => {
  it('should convert a DataView to an array of numbers', () => {
    const array = [0, 5, 200];
    const value = new DataView(Uint8Array.from(array).buffer);
    const result = dataViewToNumbers(value);
    expect(result).toEqual(array);
  });

  it('should convert an empty DataView to an array of numbers', () => {
    const value = new DataView(new ArrayBuffer(0));
    const result = dataViewToNumbers(value);
    expect(result).toEqual([]);
  });

  it('should respect the offset and length', () => {
    const array = [0, 5, 200];
    const value = new DataView(Uint8Array.from([1, 2, ...array, 10, 11]).buffer, 2, 3);
    const result = dataViewToNumbers(value);
    expect(result).toEqual(array);
  });
});

describe('textToDataView', () => {
  it('should convert a text to a DataView', () => {
    const result = textToDataView('Hello world');
    expect(result.byteLength).toEqual(11);
    expect(result.byteOffset).toEqual(0);
    expect(dataViewToHexString(result)).toEqual('48 65 6c 6c 6f 20 77 6f 72 6c 64');
  });

  it('should convert an empty text to a DataView', () => {
    const result = textToDataView('');
    expect(result.byteLength).toEqual(0);
    expect(result.byteOffset).toEqual(0);
    expect(dataViewToHexString(result)).toEqual('');
  });
});

describe('dataViewToText', () => {
  it('should convert a DataView to text', () => {
    const value = hexStringToDataView('48 65 6c 6c 6f 20 77 6f 72 6c 64');
    const result = dataViewToText(value);
    expect(result).toEqual('Hello world');
  });

  it('should convert an empty DataView to text', () => {
    const result = dataViewToText(new DataView(new ArrayBuffer(0)));
    expect(result).toEqual('');
  });
});

describe('numberToUUID', () => {
  it('should convert a 16 bit UUID to a 128 bit UUID string', () => {
    const value = 0x180d;
    const result = numberToUUID(value);
    expect(result).toEqual('0000180d-0000-1000-8000-00805f9b34fb');
  });

  it('should also work with leading zeroes', () => {
    const value = 0x0042;
    const result = numberToUUID(value);
    expect(result).toEqual('00000042-0000-1000-8000-00805f9b34fb');
  });
});

describe('hexStringToDataView', () => {
  it('should convert a hex string to a DataView', () => {
    const value = '00 05 c8';
    const result = hexStringToDataView(value);
    expect(result.byteLength).toEqual(3);
    expect(result.byteOffset).toEqual(0);
    expect(result.getUint8(0)).toEqual(0);
    expect(result.getUint8(1)).toEqual(5);
    expect(result.getUint8(2)).toEqual(200);
  });

  it('should ignore leading and trailing white space and work with upper case', () => {
    const value = ' 00 05 C8 ';
    const result = hexStringToDataView(value);
    expect(result.byteLength).toEqual(3);
    expect(result.getUint8(0)).toEqual(0);
    expect(result.getUint8(1)).toEqual(5);
    expect(result.getUint8(2)).toEqual(200);
  });

  it('should work without spaces', () => {
    const value = '0005C8';
    const result = hexStringToDataView(value);
    expect(result.byteLength).toEqual(3);
    expect(result.getUint8(0)).toEqual(0);
    expect(result.getUint8(1)).toEqual(5);
    expect(result.getUint8(2)).toEqual(200);
  });

  it('should convert an empty hex string to a DataView', () => {
    const value = '';
    const result = hexStringToDataView(value);
    expect(result.byteLength).toEqual(0);
    expect(result.byteOffset).toEqual(0);
  });
});

describe('dataViewToHexString', () => {
  it('should convert a DataView to a hex string', () => {
    const value = new DataView(Uint8Array.from([0, 5, 200]).buffer);
    const result = dataViewToHexString(value);
    expect(result).toEqual('00 05 c8');
  });

  it('should convert an empty DataView to a hex string', () => {
    const value = new DataView(new ArrayBuffer(0));
    const result = dataViewToHexString(value);
    expect(result).toEqual('');
  });
});

describe('webUUIDToString', () => {
  it('should convert a number to string UUID', () => {
    const value = 0x180d;
    const result = webUUIDToString(value);
    expect(result).toEqual('0000180d-0000-1000-8000-00805f9b34fb');
  });

  it('should keep a string UUID', () => {
    const value = '0000180d-0000-1000-8000-00805f9b34fb';
    const result = webUUIDToString(value);
    expect(result).toEqual('0000180d-0000-1000-8000-00805f9b34fb');
  });

  it('should throw an error on undefined', () => {
    const value = undefined;
    expect(() => webUUIDToString(value as any)).toThrowError('Invalid');
  });
});

describe('mapToObject', () => {
  it('should convert a map to an object with sting keys', () => {
    const map = new Map();
    map.set(1, 1);
    map.set('a', 'a');
    const result = mapToObject(map);
    expect(result).toEqual({ '1': 1, a: 'a' });
  });

  it('should return undefined for undefined input', () => {
    expect(mapToObject()).toBeUndefined();
    expect(mapToObject(undefined)).toBeUndefined();
  });
});

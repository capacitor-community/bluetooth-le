import {
  dataViewToHexString,
  hexStringToDataView,
  numberToUUID,
  numbersToDataView,
  dataViewToNumbers,
  dataViewToText,
  textToDataView,
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
});

describe('dataViewToNumbers', () => {
  it('should convert a DataView to an array of numbers', () => {
    const array = [0, 5, 200];
    const value = new DataView(Uint8Array.from(array).buffer);
    const result = dataViewToNumbers(value);
    expect(result).toEqual(array);
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
});

describe('dataViewToHexString', () => {
  it('should convert a DataView to a hex string', () => {
    const value = new DataView(Uint8Array.from([0, 5, 200]).buffer);
    const result = dataViewToHexString(value);
    expect(result).toEqual('00 05 c8');
  });
});

describe('textToDataView', () => {
  it('should convert a text to a DataView', () => {
    const result = textToDataView('Hello world');
    expect(result.byteLength).toEqual(11);
    expect(result.byteOffset).toEqual(0);
    expect(dataViewToHexString(result)).toEqual(
      '48 65 6c 6c 6f 20 77 6f 72 6c 64',
    );
    console.log(result);
  });
});

describe('dataViewToText', () => {
  it('should convert a DataView to text', () => {
    const value = hexStringToDataView('48 65 6c 6c 6f 20 77 6f 72 6c 64');
    const result = dataViewToText(value);
    expect(result).toEqual('Hello world');
  });
});

describe('numberToUUID', () => {
  it('should convert a 16 bit UUID to a 128 bit UUID string', () => {
    const value = 0x180d;
    const result = numberToUUID(value);
    expect(result).toEqual('0000180d-0000-1000-8000-00805f9b34fb');
  });
});

/**
 * Convert an array of numbers into a DataView.
 */
export function numbersToDataView(value: number[]): DataView {
  return new DataView(Uint8Array.from(value).buffer);
}

/**
 * Convert a DataView into an array of numbers.
 */
export function dataViewToNumbers(value: DataView): number[] {
  return Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
}

/**
 * Convert a string into a DataView.
 */
export function textToDataView(value: string): DataView {
  return numbersToDataView(value.split('').map((s) => s.charCodeAt(0)));
}

/**
 * Convert a DataView into a string.
 */
export function dataViewToText(value: DataView): string {
  return String.fromCharCode(...dataViewToNumbers(value));
}

/**
 * Convert a 16 bit UUID into a 128 bit UUID string
 * @param value number, e.g. 0x180d
 * @return string, e.g. '0000180d-0000-1000-8000-00805f9b34fb'
 */
export function numberToUUID(value: number): string {
  return `0000${value.toString(16).padStart(4, '0')}-0000-1000-8000-00805f9b34fb`;
}

/**
 * Convert a string of hex into a DataView of raw bytes.
 * Note: characters other than [0-9a-fA-F] are ignored
 * @param hex string of values, e.g. "00 01 02" or "000102"
 * @return DataView of raw bytes
 */
export function hexStringToDataView(hex: string): DataView {
  const bin = [];
  let i,
    c,
    isEmpty = 1,
    buffer = 0;
  for (i = 0; i < hex.length; i++) {
    c = hex.charCodeAt(i);
    if ((c > 47 && c < 58) || (c > 64 && c < 71) || (c > 96 && c < 103)) {
      buffer = (buffer << 4) ^ ((c > 64 ? c + 9 : c) & 15);
      if ((isEmpty ^= 1)) {
        bin.push(buffer & 0xff);
      }
    }
  }
  return numbersToDataView(bin);
}

export function dataViewToHexString(value: DataView): string {
  return dataViewToNumbers(value)
    .map((n) => {
      let s = n.toString(16);
      if (s.length == 1) {
        s = '0' + s;
      }
      return s;
    })
    .join(' ');
}

export function webUUIDToString(uuid: string | number): string {
  if (typeof uuid === 'string') {
    return uuid;
  } else if (typeof uuid === 'number') {
    return numberToUUID(uuid);
  } else {
    throw new Error('Invalid UUID');
  }
}

export function mapToObject<V>(map?: Map<string | number, V>): { [key: string]: V } | undefined {
  const obj: { [key: string]: V } = {};
  if (!map) {
    return undefined;
  }
  map.forEach((value, key) => {
    obj[key.toString()] = value;
  });
  return obj;
}

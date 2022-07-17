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
  return Array.from(new Uint8Array(value.buffer));
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

export function hexStringToDataView(value: string): DataView {
  const numbers: number[] = value
    .trim()
    .split(' ')
    .filter((e) => e !== '')
    .map((s) => parseInt(s, 16));
  return numbersToDataView(numbers);
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

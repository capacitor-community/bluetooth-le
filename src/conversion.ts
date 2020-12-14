export function numbersToDataView(value: number[]): DataView {
  return new DataView(Uint8Array.from(value).buffer);
}

export function dataViewToNumbers(value: DataView): number[] {
  return Array.from(new Uint8Array(value.buffer));
}

export function hexStringToDataView(value: string): DataView {
  const numbers: number[] = value
    .trim()
    .split(' ')
    .map(s => parseInt(s, 16));
  return numbersToDataView(numbers);
}

export function dataViewToHexString(value: DataView): string {
  return dataViewToNumbers(value)
    .map(n => {
      let s = n.toString(16);
      if (s.length == 1) {
        s = '0' + s;
      }
      return s;
    })
    .join(' ');
}

export function textToDataView(value: string): DataView {
  return numbersToDataView(value.split('').map(s => s.charCodeAt(0)));
}

export function dataViewToText(value: DataView): string {
  return String.fromCharCode(...dataViewToNumbers(value));
}

/**
 * Convert a 16 bit UUID to a 128 bit UUID string
 * @param value number, e.g. 0x180d
 * @return string, e.g. '0000180d-0000-1000-8000-00805f9b34fb'
 */
export function numberToUUID(value: number): string {
  return `0000${value.toString(16)}-0000-1000-8000-00805f9b34fb`;
}

import { dataViewToNumbers } from '@capacitor-community/bluetooth-le';

export enum Target {
  RESULT = 0,
  NOTIFICATION_1 = 1,
  NOTIFICATION_2 = 2,
}

export function resultToString(result: any): string {
  let resultString = '' + result;
  if (result?.toString && result.toString().includes('DataView')) {
    resultString += ' ' + dataViewToNumbers(result);
  }
  return resultString;
}

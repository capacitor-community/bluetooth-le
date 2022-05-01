import { registerPlugin } from '@capacitor/core';

import type { BluetoothLePlugin } from './definitions';

export const BluetoothLe = registerPlugin<BluetoothLePlugin>('BluetoothLe', {
  web: () => import('./web').then((m) => new m.BluetoothLeWeb()),
});

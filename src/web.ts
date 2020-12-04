import { WebPlugin } from '@capacitor/core';
import { BluetoothLePlugin } from './definitions';

export class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
  constructor() {
    super({
      name: 'BluetoothLe',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const BluetoothLe = new BluetoothLeWeb();

export { BluetoothLe };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(BluetoothLe);

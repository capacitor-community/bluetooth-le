import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = numberToUUID(0x180d);

export async function scan() {
  try {
    await BleClient.initialize();

    await BleClient.requestLEScan(
      {
        services: [HEART_RATE_SERVICE],
      },
      result => {
        console.log('received new scan result', result);
      },
    );

    setTimeout(async () => {
      await BleClient.stopLEScan();
      console.log('stopped scanning');
    }, 5000);
  } catch (error) {
    console.error(error);
  }
}

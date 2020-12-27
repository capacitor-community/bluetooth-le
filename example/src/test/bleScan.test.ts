import { Capacitor } from '@capacitor/core';
import { BleClient, ScanResult } from '../../../dist/esm';
import { HEART_RATE_SERVICE } from '../helpers/ble';
import { assert, describe, it, showAlert, sleep } from './testRunner';

export async function testBleScan() {
  await describe('Ble Scan', async () => {
    await it('should find test device with correct adv. data', async () => {
      const results: ScanResult[] = [];
      if (Capacitor.platform === 'web') {
        // web requires user interaction
        await showAlert('requestLEScan');
      }
      await BleClient.requestLEScan(
        {
          services: [HEART_RATE_SERVICE],
        },
        result => {
          if (result) {
            results.push(result);
          }
        },
      );
      await sleep(3000);
      await BleClient.stopLEScan();
      console.log('results', results);
      assert(results.length >= 1);
      const scanResult = results.find(r => r.device?.name === 'zyx');
      assert(!!scanResult);
      assert(scanResult.device.deviceId.length > 0);
      assert(scanResult.rssi > -100 && scanResult.rssi < -10);
      assert(scanResult.txPower >= -127 && scanResult.txPower <= 127);
      const manufacturerData = scanResult.manufacturerData['1281'];
      assert(manufacturerData.getUint8(0) === 238);
      assert(manufacturerData.getUint8(1) === 0);
      assert(manufacturerData.getUint8(2) === 255);
      const serviceData =
        scanResult.serviceData['0000180d-0000-1000-8000-00805f9b34fb'];
      assert(serviceData.getUint8(0) === 255);
      assert(serviceData.getUint8(1) === 0);
      assert(serviceData.getUint8(2) === 238);
      assert(scanResult.uuids[0] === '0000180d-0000-1000-8000-00805f9b34fb');
      if (Capacitor.platform === 'android') {
        assert(scanResult.rawAdvertisement.byteLength > 10);
      }
    });
  });
}

import {
  BleClient,
  BleDevice,
  numbersToDataView,
  ScanMode,
} from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import {
  BATTERY_CHARACTERISTIC,
  BATTERY_SERVICE,
  BODY_SENSOR_LOCATION_CHARACTERISTIC,
  DEVICE_INFORMATION_SERVICE,
  GENERIC_SERVICE,
  HEART_RATE_MEASUREMENT_CHARACTERISTIC,
  HEART_RATE_SERVICE,
  HUMIDITY_SERVICE,
  POLAR_PMD_CONTROL_POINT,
  POLAR_PMD_SERVICE,
  TEMPERATURE_CHARACTERISTIC,
  TEMPERATURE_SERVICE,
} from '../helpers/ble';
import { assert, describe, it, showAlert, sleep } from './testRunner';

export async function testMultipleDevices() {
  await describe('Multiple Devices', async () => {
    let device1: BleDevice | null = null;
    let device2: BleDevice | null = null;

    await it('should initialize', async () => {
      await BleClient.initialize();
      assert(!!BleClient);
    });

    await it('should request two devices', async () => {
      if (Capacitor.platform === 'web') {
        // web requires user interaction for requestDevice
        await showAlert('requestDevice');
      }
      device1 = await BleClient.requestDevice({
        services: [HEART_RATE_SERVICE],
        optionalServices: [BATTERY_SERVICE],
      });

      assert(!!device1);
      assert(device1.name.includes('Polar'));
      assert(device1.deviceId.length > 0);

      if (Capacitor.platform === 'web') {
        // web requires user interaction for requestDevice
        await showAlert('requestDevice');
      }
      device2 = await BleClient.requestDevice({
        name: 'Smart Humigadget',
        optionalServices: [
          GENERIC_SERVICE,
          DEVICE_INFORMATION_SERVICE,
          BATTERY_SERVICE,
          TEMPERATURE_SERVICE,
          HUMIDITY_SERVICE,
        ],
        scanMode: ScanMode.SCAN_MODE_LOW_LATENCY,
      });

      assert(!!device2);
      assert(device2.name.includes('Smart'));
      assert(device2.deviceId.length > 0);
    });

    await it('should connect', async () => {
      await BleClient.connect(device1.deviceId);
      await BleClient.connect(device2.deviceId);
      assert(true);
    });

    await it('should read body sensor location and read battery level', async () => {
      const result1 = await BleClient.read(
        device1.deviceId,
        HEART_RATE_SERVICE,
        BODY_SENSOR_LOCATION_CHARACTERISTIC,
      );
      const result2 = await BleClient.read(
        device2.deviceId,
        BATTERY_SERVICE,
        BATTERY_CHARACTERISTIC,
      );

      assert(result1.getUint8(0) === 1);
      assert(result2.getUint8(0) > 10 && result2.getUint8(0) <= 100);
    });

    await it('should write to control point', async () => {
      await BleClient.write(
        device1.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        numbersToDataView([1, 0]),
      );
      assert(true);
    });

    await it('should handle notifications', async () => {
      let hrCount = 0;
      let tCount = 0;
      await BleClient.startNotifications(
        device1.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        value => {
          const hr = value.getUint8(1);
          hrCount += 1;
          console.log('hr', hr);
          assert(hr > 50 && hr < 100);
        },
      );
      await BleClient.startNotifications(
        device2.deviceId,
        TEMPERATURE_SERVICE,
        TEMPERATURE_CHARACTERISTIC,
        value => {
          const t = value.getFloat32(0, true);
          tCount += 1;
          console.log('temp', t);
          assert(t > 19 && t < 25);
        },
      );

      await sleep(7000);
      console.log('stop');
      await BleClient.stopNotifications(
        device1.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      );
      await BleClient.stopNotifications(
        device2.deviceId,
        TEMPERATURE_SERVICE,
        TEMPERATURE_CHARACTERISTIC,
      );
      console.log('hrCount', hrCount);
      console.log('tCount', tCount);
      assert(hrCount > 6 && hrCount <= 8);
      assert(tCount > 6 && tCount <= 8);
    });

    await it('should disconnect', async () => {
      await BleClient.disconnect(device1.deviceId);
      await BleClient.disconnect(device2.deviceId);
      await assert(true);
    });
  });
}

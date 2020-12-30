import { Capacitor } from '@capacitor/core';
import {
  BleClient,
  BleDevice,
  dataViewToNumbers,
  numbersToDataView,
} from '@capacitor-community/bluetooth-le';
import {
  BATTERY_CHARACTERISTIC,
  BATTERY_SERVICE,
  BODY_SENSOR_LOCATION_CHARACTERISTIC,
  HEART_RATE_MEASUREMENT_CHARACTERISTIC,
  HEART_RATE_SERVICE,
  POLAR_PMD_CONTROL_POINT,
  POLAR_PMD_DATA,
  POLAR_PMD_SERVICE,
} from '../helpers/ble';
import {
  assert,
  assertEqualArray,
  describe,
  expectError,
  it,
  showAlert,
  sleep,
} from './testRunner';

export async function testInit() {
  await describe('BleClient', async () => {
    await it('should throw an error if not initialized on android or ios', async () => {
      if (Capacitor.platform !== 'web') {
        const test = async () => {
          await BleClient.connect('');
        };
        await expectError(test, 'not initialized');
      }
      assert(!!BleClient);
    });
  });
}

export async function testBleClient() {
  await describe('BleClient', async () => {
    let device: BleDevice | null = null;

    await it('should initialize', async () => {
      await BleClient.initialize();
      assert(!!BleClient);
    });

    await it('should request a device', async () => {
      if (Capacitor.platform === 'web') {
        // web requires user interaction for requestDevice
        await showAlert('requestDevice');
      }
      device = await BleClient.requestDevice({
        services: [HEART_RATE_SERVICE],
        optionalServices: [BATTERY_SERVICE, POLAR_PMD_SERVICE],
      });
      assert(!!device);
      assert(device.name.includes('Polar'));
      assert(device.deviceId.length > 0);
    });

    await it('should connect', async () => {
      await BleClient.connect(device.deviceId);
      assert(!!device);
    });

    await it('should read body sensor location', async () => {
      const result = await BleClient.read(
        device.deviceId,
        HEART_RATE_SERVICE,
        BODY_SENSOR_LOCATION_CHARACTERISTIC,
      );
      assert(result.getUint8(0) === 1);
    });

    await it('should read battery level', async () => {
      const result = await BleClient.read(
        device.deviceId,
        BATTERY_SERVICE,
        BATTERY_CHARACTERISTIC,
      );
      const batteryLevel = result.getUint8(0);
      assert(batteryLevel > 10 && batteryLevel <= 100);
    });

    await it('should write to control point', async () => {
      await BleClient.write(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        numbersToDataView([1, 0]),
      );
      assert(true);
    });

    await it('should handle notifications', async () => {
      await BleClient.startNotifications(
        device.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        value => {
          const hr = value.getUint8(1);
          assert(hr > 50 && hr < 100);
        },
      );
      await sleep(5000);
      await BleClient.stopNotifications(
        device.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      );
      assert(true);
    });

    await it('should read ECG', async () => {
      const ecg: DataView[] = [];
      let control: DataView | null = null;

      await sleep(100);

      // listen to control
      await BleClient.startNotifications(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        value => (control = value),
      );

      await sleep(100);

      // get ecg settings
      await BleClient.write(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        numbersToDataView([1, 0]),
      );
      await sleep(300);
      assert(control !== null);
      assertEqualArray(dataViewToNumbers(control), [
        240,
        1,
        0,
        0,
        0,
        0,
        1,
        130,
        0,
        1,
        1,
        14,
        0,
      ]);

      // listen to data
      await BleClient.startNotifications(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_DATA,
        value => ecg.push(value),
      );

      // should not receive data before start command
      await sleep(1500);
      assert(ecg.length === 0);

      // start stream
      await BleClient.write(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        numbersToDataView([2, 0, 0, 1, 130, 0, 1, 1, 14, 0]),
      );
      await sleep(300);
      assertEqualArray(dataViewToNumbers(control), [240, 2, 0, 0, 0, 0]);

      await sleep(10000);
      if (Capacitor.platform === 'web') {
        await sleep(30000);
      }
      const length = ecg.length;
      assert(length >= 5);
      console.log('length', ecg.length);
      assert(ecg[length - 1].byteLength > 100);
      console.log('bytelength', ecg[length - 1].byteLength);

      // stop stream
      await BleClient.write(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_CONTROL_POINT,
        numbersToDataView([3, 0]),
      );
      await sleep(300);
      assertEqualArray(dataViewToNumbers(control), [240, 3, 0, 0, 0]);

      // should not receive any further values
      await sleep(3000);
      assert(ecg.length === length);

      await BleClient.stopNotifications(
        device.deviceId,
        POLAR_PMD_SERVICE,
        POLAR_PMD_DATA,
      );
    });

    await it('should disconnect', async () => {
      await BleClient.disconnect(device.deviceId);
      assert(true);
    });
  });
}

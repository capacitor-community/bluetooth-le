import {
  BleClient,
  numbersToDataView,
  numberToUUID,
} from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_CHARACTERISTIC =
  '00002a37-0000-1000-8000-00805f9b34fb';
const BODY_SENSOR_LOCATION_CHARACTERISTIC =
  '00002a38-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
const POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
const POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';

export async function main() {
  try {
    await BleClient.initialize();

    const device = await BleClient.requestDevice({
      services: [HEART_RATE_SERVICE],
      optionalServices: [BATTERY_SERVICE, POLAR_PMD_SERVICE],
    });

    await BleClient.connect(device.deviceId);
    console.log('connected to device', device);

    const result = await BleClient.read(
      device.deviceId,
      HEART_RATE_SERVICE,
      BODY_SENSOR_LOCATION_CHARACTERISTIC,
    );
    console.log('body sensor location', result.getUint8(0));

    const battery = await BleClient.read(
      device.deviceId,
      BATTERY_SERVICE,
      BATTERY_CHARACTERISTIC,
    );
    console.log('battery level', battery.getUint8(0));

    await BleClient.write(
      device.deviceId,
      POLAR_PMD_SERVICE,
      POLAR_PMD_CONTROL_POINT,
      numbersToDataView([1, 0]),
    );
    console.log('written [1, 0] to control point');

    await BleClient.startNotifications(
      device.deviceId,
      HEART_RATE_SERVICE,
      HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      value => {
        console.log('current heart rate', parseHeartRate(value));
      },
    );

    setTimeout(async () => {
      await BleClient.stopNotifications(
        device.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      );
      await BleClient.disconnect(device.deviceId);
      console.log('disconnected from device', device);
    }, 10000);
  } catch (error) {
    console.error(error);
  }
}

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  let heartRate: number;
  if (rate16Bits) {
    heartRate = value.getUint16(1, true);
  } else {
    heartRate = value.getUint8(1);
  }
  return heartRate;
}

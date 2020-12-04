import { WebPlugin } from '@capacitor/core';
import {
  BleDevice,
  BluetoothLePlugin,
  ConnectOptions,
  ReadOptions,
  ReadResult,
  RequestBleDeviceOptions,
  WriteOptions,
} from './definitions';
import { hexStringToDataView } from './conversion';

export class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
  private deviceMap = new Map<string, BluetoothDevice>();

  constructor() {
    super({
      name: 'BluetoothLe',
      platforms: ['web'],
    });
  }

  async initialize() {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw new Error('Web Bluetooth API not available in this browser.');
    }
    if (!navigator.bluetooth.getAvailability()) {
      throw new Error('No Bluetooth radio available.');
    }
  }

  async requestDevice(options: RequestBleDeviceOptions): Promise<BleDevice> {
    let filters: BluetoothRequestDeviceFilter[] | undefined = undefined;
    if (options?.name || options?.services?.length) {
      filters = [
        {
          services: options?.services,
          name: options?.name,
        },
      ];
    }
    const device = await navigator.bluetooth.requestDevice({
      filters,
      optionalServices: options?.optionalServices,
      acceptAllDevices: filters === undefined,
    });
    const { id, name, uuids } = device;
    this.deviceMap.set(id, device);
    return { deviceId: id, name, uuids };
  }

  private getDevice(deviceId: string): BluetoothDevice {
    const device = this.deviceMap.get(deviceId);
    if (device === undefined) {
      throw new Error('Device not found. Call "requestDevice" first.');
    }
    return device;
  }

  async connect(options: ConnectOptions): Promise<void> {
    await this.getDevice(options.deviceId).gatt?.connect();
  }

  async disconnect(options: ConnectOptions): Promise<void> {
    this.getDevice(options.deviceId).gatt?.disconnect();
  }

  async getCharacteristic(
    options: ReadOptions | WriteOptions,
  ): Promise<BluetoothRemoteGATTCharacteristic | undefined> {
    const service = await this.getDevice(
      options.deviceId,
    ).gatt?.getPrimaryService(options?.service);
    return service?.getCharacteristic(options?.characteristic);
  }

  async read(options: ReadOptions): Promise<ReadResult> {
    const characteristic = await this.getCharacteristic(options);
    const value = await characteristic?.readValue();
    return { value };
  }

  async write(options: WriteOptions): Promise<void> {
    const characteristic = await this.getCharacteristic(options);
    let dataView: DataView;
    if (typeof options.value === 'string') {
      dataView = hexStringToDataView(options.value);
    } else {
      dataView = options.value;
    }
    await characteristic?.writeValue(dataView);
  }

  async startNotifications(options: ReadOptions): Promise<void> {
    const characteristic = await this.getCharacteristic(options);
    characteristic?.addEventListener(
      'characteristicvaluechanged',
      (event: Event) => {
        const key = `notification|${options.deviceId}|${options.service}|${options.characteristic}`;
        this.notifyListeners(key, {
          value: (event.target as BluetoothRemoteGATTCharacteristic).value,
        });
      },
    );
    await characteristic?.startNotifications();
  }

  async stopNotifications(options: ReadOptions): Promise<void> {
    const characteristic = await this.getCharacteristic(options);
    await characteristic?.stopNotifications();
  }
}

const BluetoothLe = new BluetoothLeWeb();

export { BluetoothLe };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(BluetoothLe);

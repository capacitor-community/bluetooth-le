import { WebPlugin } from '@capacitor/core';

import {
  hexStringToDataView,
  mapToObject,
  webUUIDToString,
} from './conversion';
import type {
  BleDevice,
  BluetoothLePlugin,
  ConnectOptions,
  ReadOptions,
  ReadResult,
  RequestBleDeviceOptions,
  ScanResultInternal,
  WriteOptions,
} from './definitions';

export class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
  private deviceMap = new Map<string, BluetoothDevice>();
  private scan: BluetoothLEScan | null = null;

  constructor() {
    super({
      name: 'BluetoothLe',
      platforms: ['web'],
    });
  }

  async initialize(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw new Error('Web Bluetooth API not available in this browser.');
    }
    if (!navigator.bluetooth.getAvailability()) {
      throw new Error('No Bluetooth radio available.');
    }
  }

  async requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
    const filters = this.getFilters(options);
    const device = await navigator.bluetooth.requestDevice({
      filters: filters.length ? filters : undefined,
      optionalServices: options?.optionalServices,
      acceptAllDevices: filters.length === 0,
    });
    const { id, name, uuids } = device;
    this.deviceMap.set(id, device);
    return { deviceId: id, name, uuids };
  }

  async requestLEScan(options?: RequestBleDeviceOptions): Promise<void> {
    const filters = this.getFilters(options);
    await this.stopLEScan();
    navigator.bluetooth.addEventListener(
      'advertisementreceived',
      (event: BluetoothAdvertisementEvent) => {
        const isNew = !this.deviceMap.has(event.device.id);
        this.deviceMap.set(event.device.id, event.device);
        if (isNew || options?.allowDuplicates) {
          const device: BleDevice = {
            deviceId: event.device.id,
            name: event.device.name,
          };
          const result: ScanResultInternal = {
            device,
            rssi: event.rssi,
            txPower: event.txPower,
            manufacturerData: mapToObject(event.manufacturerData),
            serviceData: mapToObject(event.serviceData),
            uuids: event.uuids?.map(webUUIDToString),
          };
          this.notifyListeners('onScanResult', result);
        }
      },
    );
    this.scan = await navigator.bluetooth.requestLEScan({
      filters: filters.length ? filters : undefined,
      acceptAllAdvertisements: filters.length === 0,
      keepRepeatedDevices: options?.allowDuplicates,
    });
  }

  async stopLEScan(): Promise<void> {
    if (this.scan?.active) {
      this.scan.stop();
    }
    this.scan = null;
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

  private getFilters(
    options?: RequestBleDeviceOptions,
  ): BluetoothRequestDeviceFilter[] {
    const filters: BluetoothRequestDeviceFilter[] = [];
    for (const service of options?.services ?? []) {
      filters.push({
        services: [service],
        name: options?.name,
        namePrefix: options?.namePrefix,
      });
    }
    if ((options?.name || options?.namePrefix) && filters.length === 0) {
      filters.push({
        name: options.name,
        namePrefix: options.namePrefix,
      });
    }
    return filters;
  }

  private getDevice(deviceId: string): BluetoothDevice {
    const device = this.deviceMap.get(deviceId);
    if (device === undefined) {
      throw new Error(
        'Device not found. Call "requestDevice" or "requestLEScan" first.',
      );
    }
    return device;
  }
}

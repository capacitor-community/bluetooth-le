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
import { runWithTimeout } from './timeout';

export class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
  private deviceMap = new Map<string, BluetoothDevice>();
  private discoverdDevices = new Map<string, boolean>();
  private scan: BluetoothLEScan | null = null;
  private requestBleDeviceOptions: RequestBleDeviceOptions | undefined;
  private CONNECTION_TIMEOUT = 10000;

  async initialize(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw new Error('Web Bluetooth API not available in this browser.');
    }
    if (!navigator.bluetooth.getAvailability()) {
      throw new Error('No Bluetooth radio available.');
    }
  }

  async getEnabled(): Promise<{ value: true }> {
    // not available on web
    return { value: true };
  }

  async startEnabledNotifications(): Promise<void> {
    // not available on web
  }

  async stopEnabledNotifications(): Promise<void> {
    // not available on web
  }

  async requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
    const filters = this.getFilters(options);
    const device = await navigator.bluetooth.requestDevice({
      filters: filters.length ? filters : undefined,
      optionalServices: options?.optionalServices,
      acceptAllDevices: filters.length === 0,
    });
    this.deviceMap.set(device.id, device);
    const bleDevice = this.getBleDevice(device);
    return bleDevice;
  }

  async requestLEScan(options?: RequestBleDeviceOptions): Promise<void> {
    this.requestBleDeviceOptions = options;
    const filters = this.getFilters(options);
    await this.stopLEScan();
    this.discoverdDevices = new Map<string, boolean>();
    navigator.bluetooth.removeEventListener(
      'advertisementreceived',
      this.onAdvertisemendReceived as EventListener,
    );
    navigator.bluetooth.addEventListener(
      'advertisementreceived',
      this.onAdvertisemendReceived,
    );
    this.scan = await navigator.bluetooth.requestLEScan({
      filters: filters.length ? filters : undefined,
      acceptAllAdvertisements: filters.length === 0,
      keepRepeatedDevices: options?.allowDuplicates,
    });
  }

  private onAdvertisemendReceived(event: BluetoothAdvertisementEvent) {
    // do not use `this` in event listener
    const deviceId = event.device.id;
    BluetoothLe.deviceMap.set(deviceId, event.device);
    const isNew = !BluetoothLe.discoverdDevices.has(deviceId);
    if (isNew || BluetoothLe.requestBleDeviceOptions?.allowDuplicates) {
      BluetoothLe.discoverdDevices.set(deviceId, true);
      const device = BluetoothLe.getBleDevice(event.device);
      const result: ScanResultInternal = {
        device,
        localName: device.name,
        rssi: event.rssi,
        txPower: event.txPower,
        manufacturerData: mapToObject(event.manufacturerData),
        serviceData: mapToObject(event.serviceData),
        uuids: event.uuids?.map(webUUIDToString),
      };
      BluetoothLe.notifyListeners('onScanResult', result);
    }
  }

  async stopLEScan(): Promise<void> {
    if (this.scan?.active) {
      this.scan.stop();
    }
    this.scan = null;
  }

  async connect(options: ConnectOptions): Promise<void> {
    const device = await this.getDevice(options.deviceId);
    device.removeEventListener('gattserverdisconnected', this.onDisconnected);
    device.addEventListener('gattserverdisconnected', this.onDisconnected);
    const timeoutError = Symbol();
    if (device.gatt === undefined) {
      throw new Error('No gatt server available.');
    }
    try {
      await runWithTimeout(
        device.gatt.connect(),
        this.CONNECTION_TIMEOUT,
        timeoutError,
      );
    } catch (error) {
      // cancel pending connect call, does not work yet in chromium because of a bug:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=684073
      await device.gatt?.disconnect();
      if (error === timeoutError) {
        throw new Error('Connection timeout');
      } else {
        throw error;
      }
    }
  }

  private onDisconnected(event: Event) {
    // do not use `this` in event listener
    const deviceId = (event.target as BluetoothDevice).id;
    const key = `disconnected|${deviceId}`;
    BluetoothLe.notifyListeners(key, null);
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

  async writeWithoutResponse(options: WriteOptions): Promise<void> {
    const characteristic = await this.getCharacteristic(options);
    let dataView: DataView;
    if (typeof options.value === 'string') {
      dataView = hexStringToDataView(options.value);
    } else {
      dataView = options.value;
    }
    await characteristic?.writeValueWithoutResponse(dataView);
  }

  async startNotifications(options: ReadOptions): Promise<void> {
    const characteristic = await this.getCharacteristic(options);
    characteristic?.removeEventListener(
      'characteristicvaluechanged',
      this.onCharacteristicValueChanged,
    );
    characteristic?.addEventListener(
      'characteristicvaluechanged',
      this.onCharacteristicValueChanged,
    );
    await characteristic?.startNotifications();
  }

  private onCharacteristicValueChanged(event: Event) {
    // do not use `this` in event listener
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const key = `notification|${characteristic.service?.device.id}|${characteristic.service?.uuid}|${characteristic.uuid}`;
    BluetoothLe.notifyListeners(key, {
      value: characteristic.value,
    });
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

  private getBleDevice(device: BluetoothDevice): BleDevice {
    const bleDevice: BleDevice = {
      deviceId: device.id,
      // use undefined instead of null if name is not available
      name: device.name ?? undefined,
      uuids: device.uuids,
    };
    return bleDevice;
  }
}

export const BluetoothLe = new BluetoothLeWeb();

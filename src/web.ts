import { WebPlugin } from '@capacitor/core';

import type { BleCharacteristic, BleCharacteristicProperties, BleService } from '.';
import { hexStringToDataView, mapToObject, webUUIDToString } from './conversion';
import type {
  BleDevice,
  BleServices,
  BluetoothLePlugin,
  BooleanResult,
  DeviceIdOptions,
  GetConnectedDevicesOptions,
  GetDevicesOptions,
  GetDevicesResult,
  ReadOptions,
  ReadResult,
  ReadRssiResult,
  RequestBleDeviceOptions,
  ScanResultInternal,
  WriteOptions,
} from './definitions';
import { runWithTimeout } from './timeout';

export class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
  private deviceMap = new Map<string, BluetoothDevice>();
  private discoveredDevices = new Map<string, boolean>();
  private scan: BluetoothLEScan | null = null;
  private requestBleDeviceOptions: RequestBleDeviceOptions | undefined;
  private CONNECTION_TIMEOUT = 10000;

  async initialize(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw this.unavailable('Web Bluetooth API not available in this browser.');
    }
    const isAvailable = await navigator.bluetooth.getAvailability();
    if (!isAvailable) {
      throw this.unavailable('No Bluetooth radio available.');
    }
  }

  async isEnabled(): Promise<BooleanResult> {
    // not available on web
    return { value: true };
  }

  async startEnabledNotifications(): Promise<void> {
    // not available on web
  }

  async stopEnabledNotifications(): Promise<void> {
    // not available on web
  }

  async setDisplayStrings(): Promise<void> {
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
    this.discoveredDevices = new Map<string, boolean>();
    navigator.bluetooth.removeEventListener('advertisementreceived', this.onAdvertisementReceived as EventListener);
    navigator.bluetooth.addEventListener('advertisementreceived', this.onAdvertisementReceived);
    this.scan = await navigator.bluetooth.requestLEScan({
      filters: filters.length ? filters : undefined,
      acceptAllAdvertisements: filters.length === 0,
      keepRepeatedDevices: options?.allowDuplicates,
    });
  }

  private onAdvertisementReceived(event: BluetoothAdvertisingEvent): void {
    // do not use `this` in event listener
    const deviceId = event.device.id;
    BluetoothLe.deviceMap.set(deviceId, event.device);
    const isNew = !BluetoothLe.discoveredDevices.has(deviceId);
    if (isNew || BluetoothLe.requestBleDeviceOptions?.allowDuplicates) {
      BluetoothLe.discoveredDevices.set(deviceId, true);
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

  async getDevices(_options: GetDevicesOptions): Promise<GetDevicesResult> {
    const devices = await navigator.bluetooth.getDevices();
    const bleDevices = devices.map((device) => {
      this.deviceMap.set(device.id, device);
      const bleDevice = this.getBleDevice(device);
      return bleDevice;
    });
    return { devices: bleDevices };
  }

  async getConnectedDevices(_options: GetConnectedDevicesOptions): Promise<GetDevicesResult> {
    const devices = await navigator.bluetooth.getDevices();
    const bleDevices = devices
      .filter((device) => {
        return device.gatt?.connected;
      })
      .map((device) => {
        this.deviceMap.set(device.id, device);
        const bleDevice = this.getBleDevice(device);
        return bleDevice;
      });
    return { devices: bleDevices };
  }

  async connect(options: DeviceIdOptions): Promise<void> {
    const device = this.getDeviceFromMap(options.deviceId);
    device.removeEventListener('gattserverdisconnected', this.onDisconnected);
    device.addEventListener('gattserverdisconnected', this.onDisconnected);
    const timeoutError = Symbol();
    if (device.gatt === undefined) {
      throw new Error('No gatt server available.');
    }
    try {
      await runWithTimeout(device.gatt.connect(), this.CONNECTION_TIMEOUT, timeoutError);
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

  private onDisconnected(event: Event): void {
    // do not use `this` in event listener
    const deviceId = (event.target as BluetoothDevice).id;
    const key = `disconnected|${deviceId}`;
    BluetoothLe.notifyListeners(key, null);
  }

  async createBond(_options: DeviceIdOptions): Promise<void> {
    throw this.unavailable('createBond is not available on web.');
  }

  async isBonded(_options: DeviceIdOptions): Promise<BooleanResult> {
    throw this.unavailable('isBonded is not available on web.');
  }

  async disconnect(options: DeviceIdOptions): Promise<void> {
    this.getDeviceFromMap(options.deviceId).gatt?.disconnect();
  }

  async getServices(options: DeviceIdOptions): Promise<BleServices> {
    const services = (await this.getDeviceFromMap(options.deviceId).gatt?.getPrimaryServices()) ?? [];
    const bleServices: BleService[] = [];
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      const bleCharacteristics: BleCharacteristic[] = characteristics.map((characteristic) => {
        return {
          uuid: characteristic.uuid,
          properties: this.getProperties(characteristic),
        };
      });
      bleServices.push({ uuid: service.uuid, characteristics: bleCharacteristics });
    }
    return { services: bleServices };
  }

  private getProperties(characteristic: BluetoothRemoteGATTCharacteristic): BleCharacteristicProperties {
    return {
      broadcast: characteristic.properties.broadcast,
      read: characteristic.properties.read,
      writeWithoutResponse: characteristic.properties.writeWithoutResponse,
      write: characteristic.properties.write,
      notify: characteristic.properties.notify,
      indicate: characteristic.properties.indicate,
      authenticatedSignedWrites: characteristic.properties.authenticatedSignedWrites,
      reliableWrite: characteristic.properties.reliableWrite,
      writableAuxiliaries: characteristic.properties.writableAuxiliaries,
    };
  }

  private async getCharacteristic(
    options: ReadOptions | WriteOptions
  ): Promise<BluetoothRemoteGATTCharacteristic | undefined> {
    const service = await this.getDeviceFromMap(options.deviceId).gatt?.getPrimaryService(options?.service);
    return service?.getCharacteristic(options?.characteristic);
  }

  async readRssi(_options: DeviceIdOptions): Promise<ReadRssiResult> {
    throw this.unavailable('readRssi is not available on web.');
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
    await characteristic?.writeValueWithResponse(dataView);
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
    characteristic?.removeEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
    characteristic?.addEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
    await characteristic?.startNotifications();
  }

  private onCharacteristicValueChanged(event: Event): void {
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

  private getFilters(options?: RequestBleDeviceOptions): BluetoothLEScanFilter[] {
    const filters: BluetoothLEScanFilter[] = [];
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

  private getDeviceFromMap(deviceId: string): BluetoothDevice {
    const device = this.deviceMap.get(deviceId);
    if (device === undefined) {
      throw new Error('Device not found. Call "requestDevice", "requestLEScan" or "getDevices" first.');
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

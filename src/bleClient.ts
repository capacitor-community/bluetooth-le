import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor, Plugins } from '@capacitor/core';

import { dataViewToHexString, hexStringToDataView } from './conversion';
import type {
  BleDevice,
  Data,
  ReadResult,
  RequestBleDeviceOptions,
  ScanResult,
  ScanResultInternal,
} from './definitions';
import { getQueue } from './queue';

const { BluetoothLe } = Plugins;

export interface BleClientInterface {
  /**
   * Initialize Bluetooth Low Energy (BLE). If it fails, BLE might be unavailable on this device.
   * On **Android** it will ask for the location permission. On **iOS** it will ask for the Bluetooth permission.
   * For an example, see [usage](#usage).
   */
  initialize(): Promise<void>;

  /**
   * Reports whether BLE is enabled on this device.
   * Always returns `true` on **web**.
   */
  getEnabled(): Promise<boolean>;

  /**
   * Register a callback function that will be invoked when BLE is enabled (true) or disabled (false) on this device.
   * Not available on **web** (the callback will never be invoked).
   * @param callback Callback function to use when the BLE state changes.
   */
  startEnabledNotifications(callback: (value: boolean) => void): Promise<void>;

  /**
   * Stop the enabled notifications registered with `startEnabledNotifications`.
   */
  stopEnabledNotifications(): Promise<void>;

  /**
   * Request a peripheral BLE device to interact with. This will scan for available devices according to the filters in the options and show a dialog to pick a device.
   * For an example, see [usage](#usage).
   * @param options Device filters, see [RequestBleDeviceOptions](#RequestBleDeviceOptions)
   */
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;

  /**
   * Start scanning for BLE devices to interact with according to the filters in the options. The callback will be invoked on each device that is found.
   * Scanning will continue until `stopLEScan` is called. For an example, see [usage](#usage).
   * **NOTE**: Use with care on **web** platform, the required API is still behind a flag in most browsers.
   * @param options
   * @param callback
   */
  requestLEScan(
    options: RequestBleDeviceOptions,
    callback: (result: ScanResult) => void,
  ): Promise<void>;

  /**
   * Stop scanning for BLE devices. For an example, see [usage](#usage).
   */
  stopLEScan(): Promise<void>;

  /**
   * Connect to a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param onDisconnect Optional disconnect callback function that will be used when the device disconnects
   */
  connect(
    deviceId: string,
    onDisconnect?: (deviceId: string) => void,
  ): Promise<void>;

  /**
   * Create a bond with a peripheral BLE device.
   * Only available on Android.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  createBond(deviceId: string): Promise<void>;

  /**
   * Report whether a peripheral BLE device is bonded.
   * Only available on Android.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  isBonded(deviceId: string): Promise<boolean>;

  /**
   * Disconnect from a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  disconnect(deviceId: string): Promise<void>;

  /**
   * Read the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   */
  read(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<DataView>;

  /**
   * Write a value to a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   */
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void>;

  /**
   * Write a value to a characteristic without waiting for a response.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   */
  writeWithoutResponse(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void>;

  /**
   * Start listening to changes of the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param callback Callback function to use when the value of the characteristic changes
   */
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void>;

  /**
   * Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   */
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void>;
}

class BleClientClass implements BleClientInterface {
  private scanListener: PluginListenerHandle | null = null;
  private eventListeners = new Map<string, PluginListenerHandle>();
  private queue = getQueue(true);

  enableQueue() {
    this.queue = getQueue(true);
  }

  disableQueue() {
    this.queue = getQueue(false);
  }

  async initialize(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.initialize();
    });
  }

  async getEnabled(): Promise<boolean> {
    const enabled = await this.queue(async () => {
      const result = await BluetoothLe.getEnabled();
      return result.value;
    });
    return enabled;
  }

  async startEnabledNotifications(
    callback: (value: boolean) => void,
  ): Promise<void> {
    await this.queue(async () => {
      const key = `onEnabledChanged`;
      await this.eventListeners.get(key)?.remove();
      const listener = await BluetoothLe.addListener(key, result => {
        callback(result.value);
      });
      this.eventListeners.set(key, listener);
      await BluetoothLe.startEnabledNotifications();
    });
  }

  async stopEnabledNotifications(): Promise<void> {
    await this.queue(async () => {
      const key = `onEnabledChanged`;
      await this.eventListeners.get(key)?.remove();
      await BluetoothLe.stopEnabledNotifications();
    });
  }

  async requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
    const result = await this.queue(async () => {
      const device = await BluetoothLe.requestDevice(options);
      return device;
    });
    return result;
  }

  async requestLEScan(
    options: RequestBleDeviceOptions,
    callback: (result: ScanResult) => void,
  ): Promise<void> {
    await this.queue(async () => {
      await this.scanListener?.remove();
      this.scanListener = await BluetoothLe.addListener(
        'onScanResult',
        (result: ScanResultInternal) => {
          result.manufacturerData = this.convertObject(result.manufacturerData);
          result.serviceData = this.convertObject(result.serviceData);
          result.rawAdvertisement = result.rawAdvertisement
            ? this.convertValue(result.rawAdvertisement)
            : undefined;
          callback(result as ScanResult);
        },
      );
      await BluetoothLe.requestLEScan(options);
    });
  }

  async stopLEScan(): Promise<void> {
    await this.queue(async () => {
      await this.scanListener?.remove();
      this.scanListener = null;
      await BluetoothLe.stopLEScan();
    });
  }

  async connect(
    deviceId: string,
    onDisconnect?: (deviceId: string) => void,
  ): Promise<void> {
    await this.queue(async () => {
      if (onDisconnect) {
        const key = `disconnected|${deviceId}`;
        await this.eventListeners.get(key)?.remove();
        const listener = await BluetoothLe.addListener(key, () => {
          onDisconnect(deviceId);
        });
        this.eventListeners.set(key, listener);
      }
      await BluetoothLe.connect({ deviceId });
    });
  }

  async createBond(deviceId: string): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.createBond({ deviceId });
    });
  }

  async isBonded(deviceId: string): Promise<boolean> {
    const isBonded = await this.queue(async () => {
      const result = await BluetoothLe.isBonded({ deviceId });
      return result.value;
    });
    return isBonded;
  }

  async disconnect(deviceId: string): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.disconnect({ deviceId });
    });
  }

  async read(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<DataView> {
    const value = await this.queue(async () => {
      const result = await BluetoothLe.read({
        deviceId,
        service,
        characteristic,
      });
      return this.convertValue(result.value);
    });
    return value;
  }

  async write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void> {
    return this.queue(async () => {
      let writeValue: DataView | string = value;
      if (Capacitor.getPlatform() !== 'web') {
        // on native we can only write strings
        writeValue = dataViewToHexString(value);
      }
      await BluetoothLe.write({
        deviceId,
        service,
        characteristic,
        value: writeValue,
      });
    });
  }

  async writeWithoutResponse(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void> {
    await this.queue(async () => {
      let writeValue: DataView | string = value;
      if (Capacitor.getPlatform() !== 'web') {
        // on native we can only write strings
        writeValue = dataViewToHexString(value);
      }
      await BluetoothLe.writeWithoutResponse({
        deviceId,
        service,
        characteristic,
        value: writeValue,
      });
    });
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void> {
    await this.queue(async () => {
      const key = `notification|${deviceId}|${service}|${characteristic}`;
      await this.eventListeners.get(key)?.remove();
      const listener = await BluetoothLe.addListener(
        key,
        (event: ReadResult) => {
          callback(this.convertValue(event?.value));
        },
      );
      this.eventListeners.set(key, listener);
      await BluetoothLe.startNotifications({
        deviceId,
        service,
        characteristic,
      });
    });
  }

  async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void> {
    await this.queue(async () => {
      const key = `notification|${service}|${characteristic}`;
      await this.eventListeners.get(key)?.remove();
      this.eventListeners.delete(key);
      await BluetoothLe.stopNotifications({
        deviceId,
        service,
        characteristic,
      });
    });
  }

  private convertValue(value?: Data): DataView {
    if (typeof value === 'string') {
      return hexStringToDataView(value);
    } else if (value === undefined) {
      return new DataView(new ArrayBuffer(0));
    }
    return value;
  }

  private convertObject(obj?: {
    [key: string]: Data;
  }): { [key: string]: DataView } | undefined {
    if (obj === undefined) {
      return undefined;
    }
    const result: { [key: string]: DataView } = {};
    for (const key of Object.keys(obj)) {
      result[key] = this.convertValue(obj[key]);
    }
    return result;
  }
}

export const BleClient = new BleClientClass();

import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

import type { DisplayStrings } from './config';
import { dataViewToHexString, hexStringToDataView } from './conversion';
import type {
  BleDevice,
  BleService,
  ConnectionPriority,
  Data,
  InitializeOptions,
  ReadResult,
  RequestBleDeviceOptions,
  ScanResult,
  ScanResultInternal,
  TimeoutOptions,
} from './definitions';
import { BluetoothLe } from './plugin';
import { getQueue } from './queue';
import { parseUUID } from './validators';

export interface BleClientInterface {
  /**
   * Initialize Bluetooth Low Energy (BLE). If it fails, BLE might be unavailable on this device.
   * On **Android** it will ask for the location permission. On **iOS** it will ask for the Bluetooth permission.
   * For an example, see [usage](#usage).
   */
  initialize(options?: InitializeOptions): Promise<void>;

  /**
   * Reports whether Bluetooth is enabled on this device.
   * Always returns `true` on **web**.
   */
  isEnabled(): Promise<boolean>;

  /**
   * Request enabling Bluetooth. Show a system activity that allows the user to turn on Bluetooth. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#ACTION_REQUEST_ENABLE
   * Only available on **Android**.*/
  requestEnable(): Promise<void>;

  /**
   * Enable Bluetooth.
   * Only available on **Android**.
   * **Deprecated** Will fail on Android SDK >= 33. Use `requestEnable` instead. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#enable()
   * @deprecated Will fail on Android SDK >= 33. Use `requestEnable` instead. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#enable()
   */
  enable(): Promise<void>;

  /**
   * Disable Bluetooth.
   * Only available on **Android**.
   * **Deprecated** Will fail on Android SDK >= 33. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#disable()
   * @deprecated Will fail on Android SDK >= 33. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#disable()
   */
  disable(): Promise<void>;

  /**
   * Register a callback function that will be invoked when Bluetooth is enabled (true) or disabled (false) on this device.
   * Not available on **web** (the callback will never be invoked).
   * @param callback Callback function to use when the Bluetooth state changes.
   */
  startEnabledNotifications(callback: (value: boolean) => void): Promise<void>;

  /**
   * Stop the enabled notifications registered with `startEnabledNotifications`.
   */
  stopEnabledNotifications(): Promise<void>;

  /**
   * Reports whether Location Services are enabled on this device.
   * Only available on **Android**.
   */
  isLocationEnabled(): Promise<boolean>;

  /**
   * Open Location settings.
   * Only available on **Android**.
   */
  openLocationSettings(): Promise<void>;

  /**
   * Open Bluetooth settings.
   * Only available on **Android**.
   */
  openBluetoothSettings(): Promise<void>;

  /**
   * Open App settings.
   * Not available on **web**.
   * On **iOS** when a user declines the request to use Bluetooth on the first call of `initialize`, it is not possible
   * to request for Bluetooth again from within the app. In this case Bluetooth has to be enabled in the app settings
   * for the app to be able use it.
   */
  openAppSettings(): Promise<void>;

  /**
   * Set the strings that are displayed in the `requestDevice` dialog.
   * @param displayStrings
   */
  setDisplayStrings(displayStrings: DisplayStrings): Promise<void>;

  /**
   * Request a peripheral BLE device to interact with. This will scan for available devices according to the filters in the options and show a dialog to pick a device.
   * For an example, see [usage](#usage).
   * @param options Device filters, see [RequestBleDeviceOptions](#RequestBleDeviceOptions)
   */
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;

  /**
   * Start scanning for BLE devices to interact with according to the filters in the options. The callback will be invoked on each device that is found.
   * Scanning will continue until `stopLEScan` is called. For an example, see [usage](#usage).
   * **Note**: Use with care on **web** platform, the required API is still behind a flag in most browsers.
   * @param options
   * @param callback
   */
  requestLEScan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void>;

  /**
   * Stop scanning for BLE devices. For an example, see [usage](#usage).
   */
  stopLEScan(): Promise<void>;

  /**
   * On iOS and web, if you want to connect to a previously connected device without scanning first, you can use `getDevice`.
   * Uses [retrievePeripherals](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager/1519127-retrieveperipherals) on iOS and
   * [getDevices](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getDevices) on web.
   * On Android, you can directly connect to the device with the deviceId.
   * @param deviceIds List of device IDs, e.g. saved from a previous app run.
   */
  getDevices(deviceIds: string[]): Promise<BleDevice[]>;

  /**
   * Get a list of currently bonded devices.
   * Only available on **Android**.
   * Uses [getBondedDevices](https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#getBondedDevices()) on Android
   */
  getBondedDevices(): Promise<BleDevice[]>;

  /**
   * Get a list of currently connected devices.
   * Uses [retrieveConnectedPeripherals](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager/1518924-retrieveconnectedperipherals) on iOS,
   * [getConnectedDevices](https://developer.android.com/reference/android/bluetooth/BluetoothManager#getConnectedDevices(int)) on Android
   * and [getDevices](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getDevices) on web.
   * @param services List of services to filter the devices by. If no service is specified, no devices will be returned. Only applies to iOS.
   */
  getConnectedDevices(services: string[]): Promise<BleDevice[]>;

  /**
   * Connect to a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param onDisconnect Optional disconnect callback function that will be used when the device disconnects
   * @param options Options for plugin call
   */
  connect(deviceId: string, onDisconnect?: (deviceId: string) => void, options?: TimeoutOptions): Promise<void>;

  /**
   * Create a bond with a peripheral BLE device.
   * Only available on **Android**. On iOS bonding is handled by the OS.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param options Options for plugin call
   */
  createBond(deviceId: string, options?: TimeoutOptions): Promise<void>;

  /**
   * Report whether a peripheral BLE device is bonded.
   * Only available on **Android**. On iOS bonding is handled by the OS.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  isBonded(deviceId: string): Promise<boolean>;

  /**
   * Disconnect from a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  disconnect(deviceId: string): Promise<void>;

  /**
   * Get services, characteristics and descriptors of a device.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  getServices(deviceId: string): Promise<BleService[]>;

  /**
   * Discover services, characteristics and descriptors of a device.
   * You only need this method if your peripheral device changes its services and characteristics at runtime.
   * If the discovery was successful, the remote services can be retrieved using the getServices function.
   * Not available on **web**.
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  discoverServices(deviceId: string): Promise<void>;

  /**
   * Get the MTU of a connected device. Note that the maximum write value length is 3 bytes less than the MTU.
   * Not available on **web**.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  getMtu(deviceId: string): Promise<number>;

  /**
   * Request a connection parameter update.
   * Only available on **Android**. https://developer.android.com/reference/android/bluetooth/BluetoothGatt#requestConnectionPriority(int)
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param connectionPriority Request a specific connection priority. See [ConnectionPriority](#connectionpriority)
   */
  requestConnectionPriority(deviceId: string, connectionPriority: ConnectionPriority): Promise<void>;

  /**
   * Read the RSSI value of a connected device.
   * Not available on **web**.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  readRssi(deviceId: string): Promise<number>;

  /**
   * Read the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param options Options for plugin call
   */
  read(deviceId: string, service: string, characteristic: string, options?: TimeoutOptions): Promise<DataView>;

  /**
   * Write a value to a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   * @param options Options for plugin call
   */
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
    options?: TimeoutOptions
  ): Promise<void>;

  /**
   * Write a value to a characteristic without waiting for a response.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   * @param options Options for plugin call
   */
  writeWithoutResponse(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
    options?: TimeoutOptions
  ): Promise<void>;

  /**
   * Read the value of a descriptor.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param descriptor UUID of the descriptor (see [UUID format](#uuid-format))
   * @param options Options for plugin call
   */
  readDescriptor(
    deviceId: string,
    service: string,
    characteristic: string,
    descriptor: string,
    options?: TimeoutOptions
  ): Promise<DataView>;

  /**
   * Write a value to a descriptor.
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param descriptor UUID of the descriptor (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   * @param options Options for plugin call
   */
  writeDescriptor(
    deviceId: string,
    service: string,
    characteristic: string,
    descriptor: string,
    value: DataView,
    options?: TimeoutOptions
  ): Promise<void>;

  /**
   * Start listening to changes of the value of a characteristic.
   * Note that you should only start the notifications once per characteristic in your app and share the data and
   * not call `startNotifications` in every component that needs the data.
   * For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param callback Callback function to use when the value of the characteristic changes
   */
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void
  ): Promise<void>;

  /**
   * Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   */
  stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void>;
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

  async initialize(options?: InitializeOptions): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.initialize(options);
    });
  }

  async isEnabled(): Promise<boolean> {
    const enabled = await this.queue(async () => {
      const result = await BluetoothLe.isEnabled();
      return result.value;
    });
    return enabled;
  }

  async requestEnable(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.requestEnable();
    });
  }

  async enable(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.enable();
    });
  }

  async disable(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.disable();
    });
  }

  async startEnabledNotifications(callback: (value: boolean) => void): Promise<void> {
    await this.queue(async () => {
      const key = `onEnabledChanged`;
      await this.eventListeners.get(key)?.remove();
      const listener = await BluetoothLe.addListener(key, (result) => {
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
      this.eventListeners.delete(key);
      await BluetoothLe.stopEnabledNotifications();
    });
  }

  async isLocationEnabled(): Promise<boolean> {
    const enabled = await this.queue(async () => {
      const result = await BluetoothLe.isLocationEnabled();
      return result.value;
    });
    return enabled;
  }

  async openLocationSettings(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.openLocationSettings();
    });
  }

  async openBluetoothSettings(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.openBluetoothSettings();
    });
  }

  async openAppSettings(): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.openAppSettings();
    });
  }

  async setDisplayStrings(displayStrings: DisplayStrings): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.setDisplayStrings(displayStrings);
    });
  }

  async requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
    options = options ? this.validateRequestBleDeviceOptions(options) : undefined;
    const result = await this.queue(async () => {
      const device = await BluetoothLe.requestDevice(options);
      return device;
    });
    return result;
  }

  async requestLEScan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void> {
    options = this.validateRequestBleDeviceOptions(options);
    await this.queue(async () => {
      await this.scanListener?.remove();
      this.scanListener = await BluetoothLe.addListener('onScanResult', (resultInternal: ScanResultInternal) => {
        const result: ScanResult = {
          ...resultInternal,
          manufacturerData: this.convertObject(resultInternal.manufacturerData),
          serviceData: this.convertObject(resultInternal.serviceData),
          rawAdvertisement: resultInternal.rawAdvertisement
            ? this.convertValue(resultInternal.rawAdvertisement)
            : undefined,
        };
        callback(result);
      });
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

  async getDevices(deviceIds: string[]): Promise<BleDevice[]> {
    if (!Array.isArray(deviceIds)) {
      throw new Error('deviceIds must be an array');
    }
    return this.queue(async () => {
      const result = await BluetoothLe.getDevices({ deviceIds });
      return result.devices;
    });
  }

  async getConnectedDevices(services: string[]): Promise<BleDevice[]> {
    if (!Array.isArray(services)) {
      throw new Error('services must be an array');
    }
    services = services.map(parseUUID);
    return this.queue(async () => {
      const result = await BluetoothLe.getConnectedDevices({ services });
      return result.devices;
    });
  }

  async getBondedDevices(): Promise<BleDevice[]> {
    return this.queue(async () => {
      const result = await BluetoothLe.getBondedDevices();
      return result.devices;
    });
  }

  async connect(deviceId: string, onDisconnect?: (deviceId: string) => void, options?: TimeoutOptions): Promise<void> {
    await this.queue(async () => {
      if (onDisconnect) {
        const key = `disconnected|${deviceId}`;
        await this.eventListeners.get(key)?.remove();
        const listener = await BluetoothLe.addListener(key, () => {
          onDisconnect(deviceId);
        });
        this.eventListeners.set(key, listener);
      }
      await BluetoothLe.connect({ deviceId, ...options });
    });
  }

  async createBond(deviceId: string, options?: TimeoutOptions): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.createBond({ deviceId, ...options });
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

  async getServices(deviceId: string): Promise<BleService[]> {
    const services = await this.queue(async () => {
      const result = await BluetoothLe.getServices({ deviceId });
      return result.services;
    });
    return services;
  }

  async discoverServices(deviceId: string): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.discoverServices({ deviceId });
    });
  }

  async getMtu(deviceId: string): Promise<number> {
    const value = await this.queue(async () => {
      const result = await BluetoothLe.getMtu({ deviceId });
      return result.value;
    });
    return value;
  }

  async requestConnectionPriority(deviceId: string, connectionPriority: ConnectionPriority): Promise<void> {
    await this.queue(async () => {
      await BluetoothLe.requestConnectionPriority({ deviceId, connectionPriority });
    });
  }

  async readRssi(deviceId: string): Promise<number> {
    const value = await this.queue(async () => {
      const result = await BluetoothLe.readRssi({ deviceId });
      return parseFloat(result.value);
    });
    return value;
  }

  async read(deviceId: string, service: string, characteristic: string, options?: TimeoutOptions): Promise<DataView> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    const value = await this.queue(async () => {
      const result = await BluetoothLe.read({
        deviceId,
        service,
        characteristic,
        ...options,
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
    options?: TimeoutOptions
  ): Promise<void> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    return this.queue(async () => {
      if (!value?.buffer) {
        throw new Error('Invalid data.');
      }
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
        ...options,
      });
    });
  }

  async writeWithoutResponse(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
    options?: TimeoutOptions
  ): Promise<void> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    await this.queue(async () => {
      if (!value?.buffer) {
        throw new Error('Invalid data.');
      }
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
        ...options,
      });
    });
  }

  async readDescriptor(
    deviceId: string,
    service: string,
    characteristic: string,
    descriptor: string,
    options?: TimeoutOptions
  ): Promise<DataView> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    descriptor = parseUUID(descriptor);
    const value = await this.queue(async () => {
      const result = await BluetoothLe.readDescriptor({
        deviceId,
        service,
        characteristic,
        descriptor,
        ...options,
      });
      return this.convertValue(result.value);
    });
    return value;
  }

  async writeDescriptor(
    deviceId: string,
    service: string,
    characteristic: string,
    descriptor: string,
    value: DataView,
    options?: TimeoutOptions
  ): Promise<void> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    descriptor = parseUUID(descriptor);
    return this.queue(async () => {
      if (!value?.buffer) {
        throw new Error('Invalid data.');
      }
      let writeValue: DataView | string = value;
      if (Capacitor.getPlatform() !== 'web') {
        // on native we can only write strings
        writeValue = dataViewToHexString(value);
      }
      await BluetoothLe.writeDescriptor({
        deviceId,
        service,
        characteristic,
        descriptor,
        value: writeValue,
        ...options,
      });
    });
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void
  ): Promise<void> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    await this.queue(async () => {
      const key = `notification|${deviceId}|${service}|${characteristic}`;
      await this.eventListeners.get(key)?.remove();
      const listener = await BluetoothLe.addListener(key, (event: ReadResult) => {
        callback(this.convertValue(event?.value));
      });
      this.eventListeners.set(key, listener);
      await BluetoothLe.startNotifications({
        deviceId,
        service,
        characteristic,
      });
    });
  }

  async stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void> {
    service = parseUUID(service);
    characteristic = parseUUID(characteristic);
    await this.queue(async () => {
      const key = `notification|${deviceId}|${service}|${characteristic}`;
      await this.eventListeners.get(key)?.remove();
      this.eventListeners.delete(key);
      await BluetoothLe.stopNotifications({
        deviceId,
        service,
        characteristic,
      });
    });
  }

  private validateRequestBleDeviceOptions(options: RequestBleDeviceOptions): RequestBleDeviceOptions {
    if (options.services) {
      options.services = options.services.map(parseUUID);
    }
    if (options.optionalServices) {
      options.optionalServices = options.optionalServices.map(parseUUID);
    }
    return options;
  }

  private convertValue(value?: Data): DataView {
    if (typeof value === 'string') {
      return hexStringToDataView(value);
    } else if (value === undefined) {
      return new DataView(new ArrayBuffer(0));
    }
    return value;
  }

  private convertObject(obj?: { [key: string]: Data }): { [key: string]: DataView } | undefined {
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

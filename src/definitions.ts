import type { PluginListenerHandle } from '@capacitor/core';

import type { DisplayStrings } from './config';

export interface InitializeOptions {
  /**
   * If your app doesn't use Bluetooth scan results to derive physical
   * location information, you can strongly assert that your app
   * doesn't derive physical location. (Android only)
   * Requires adding 'neverForLocation' to AndroidManifest.xml
   * https://developer.android.com/guide/topics/connectivity/bluetooth/permissions#assert-never-for-location
   * @default false
   */
  androidNeverForLocation?: boolean;
}

export interface RequestBleDeviceOptions {
  /**
   * Filter devices by service UUIDs.
   * UUIDs have to be specified as 128 bit UUID strings,
   * e.g. ['0000180d-0000-1000-8000-00805f9b34fb']
   * There is a helper function to convert numbers to UUIDs.
   * e.g. [numberToUUID(0x180f)]. (see [UUID format](#uuid-format))
   */
  services?: string[];
  /**
   * Filter devices by name
   */
  name?: string;
  /**
   * Filter devices by name prefix
   */
  namePrefix?: string;
  /**
   * For **web**, all services that will be used have to be listed under services or optionalServices,
   * e.g. [numberToUUID(0x180f)] (see [UUID format](#uuid-format))
   */
  optionalServices?: string[];
  /**
   * Normally scans will discard the second and subsequent advertisements from a single device.
   * If you need to receive them, set allowDuplicates to true (only applicable in `requestLEScan`).
   * (default: false)
   */
  allowDuplicates?: boolean;
  /**
   * Android scan mode (default: ScanMode.SCAN_MODE_BALANCED)
   */
  scanMode?: ScanMode;
}

/**
 * Android scan mode
 */
export enum ScanMode {
  /**
   * Perform Bluetooth LE scan in low power mode. This mode is enforced if the scanning application is not in foreground.
   * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_POWER
   */
  SCAN_MODE_LOW_POWER = 0,
  /**
   * Perform Bluetooth LE scan in balanced power mode. (default) Scan results are returned at a rate that provides a good trade-off between scan frequency and power consumption.
   * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_BALANCED
   */
  SCAN_MODE_BALANCED = 1,
  /**
   * Scan using highest duty cycle. It's recommended to only use this mode when the application is running in the foreground.
   * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_LATENCY
   */
  SCAN_MODE_LOW_LATENCY = 2,
}

/**
 * Android connection priority used in `requestConnectionPriority`
 */
export enum ConnectionPriority {
  /**
   * Use the connection parameters recommended by the Bluetooth SIG. This is the default value if no connection parameter update is requested.
   * https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_BALANCED
   */
  CONNECTION_PRIORITY_BALANCED = 0,
  /**
   * Request a high priority, low latency connection. An application should only request high priority connection parameters to transfer large amounts of data over LE quickly. Once the transfer is complete, the application should request CONNECTION_PRIORITY_BALANCED connection parameters to reduce energy use.
   * https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_HIGH
   */
  CONNECTION_PRIORITY_HIGH = 1,
  /**
   * Request low power, reduced data rate connection parameters.
   * https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_LOW_POWER
   */
  CONNECTION_PRIORITY_LOW_POWER = 2,
}

export interface BleDevice {
  /**
   * ID of the device, which will be needed for further calls.
   * On **Android** this is the BLE MAC address.
   * On **iOS** and **web** it is an identifier.
   */
  deviceId: string;
  /**
   * Name of the peripheral device.
   */
  name?: string;
  uuids?: string[];
}

export interface DeviceIdOptions {
  deviceId: string;
}
export interface TimeoutOptions {
  /**
   * Timeout in milliseconds for plugin call.
   * Default is 10000 for `connect` and 5000 for other plugin methods.
   */
  timeout?: number;
}

export interface RequestConnectionPriorityOptions extends DeviceIdOptions {
  connectionPriority: ConnectionPriority;
}

export interface GetDevicesOptions {
  deviceIds: string[];
}

export interface GetConnectedDevicesOptions {
  services: string[];
}

export interface BleService {
  readonly uuid: string;
  readonly characteristics: BleCharacteristic[];
}

export interface BleDescriptor {
  readonly uuid: string;
}

export interface BleCharacteristic {
  readonly uuid: string;
  readonly properties: BleCharacteristicProperties;
  readonly descriptors: BleDescriptor[];
}

export interface BleCharacteristicProperties {
  readonly broadcast: boolean;
  readonly read: boolean;
  readonly writeWithoutResponse: boolean;
  readonly write: boolean;
  readonly notify: boolean;
  readonly indicate: boolean;
  readonly authenticatedSignedWrites: boolean;
  readonly reliableWrite?: boolean;
  readonly writableAuxiliaries?: boolean;
  readonly extendedProperties?: boolean;
  readonly notifyEncryptionRequired?: boolean;
  readonly indicateEncryptionRequired?: boolean;
}

export interface BleServices {
  services: BleService[];
}

export interface ReadOptions {
  deviceId: string;
  service: string;
  characteristic: string;
}

export interface ReadDescriptorOptions {
  deviceId: string;
  service: string;
  characteristic: string;
  descriptor: string;
}

export type Data = DataView | string;

export interface WriteOptions {
  deviceId: string;
  service: string;
  characteristic: string;
  /**
   * android, ios: string
   * web: DataView
   */
  value: Data;
}

export interface WriteDescriptorOptions {
  deviceId: string;
  service: string;
  characteristic: string;
  descriptor: string;
  /**
   * android, ios: string
   * web: DataView
   */
  value: Data;
}

export interface BooleanResult {
  value: boolean;
}

export interface GetDevicesResult {
  devices: BleDevice[];
}

export interface GetMtuResult {
  value: number;
}

export interface ReadRssiResult {
  value: string;
}

export interface ReadResult {
  /**
   * android, ios: string
   * web: DataView
   */
  value?: Data;
}

export interface ScanResultInternal<T = Data> {
  device: BleDevice;
  localName?: string;
  rssi?: number;
  txPower?: number;
  manufacturerData?: { [key: string]: T };
  serviceData?: { [key: string]: T };
  uuids?: string[];
  rawAdvertisement?: T;
}

export interface ScanResult {
  /**
   * The peripheral device that was found in the scan.
   * **Android** and **web**: `device.name` is always identical to `localName`.
   * **iOS**: `device.name` is identical to `localName` the first time a device is discovered, but after connecting `device.name` is the cached GAP name in subsequent scans.
   */
  device: BleDevice;
  /**
   * The name of the peripheral device from the advertisement data.
   */
  localName?: string;
  /**
   * Received Signal Strength Indication.
   */
  rssi?: number;
  /**
   * Transmit power in dBm. A value of 127 indicates that it is not available.
   */
  txPower?: number;
  /**
   * Manufacturer data, key is a company identifier and value is the data.
   */
  manufacturerData?: { [key: string]: DataView };
  /**
   * Service data, key is a service UUID and value is the data.
   */
  serviceData?: { [key: string]: DataView };
  /**
   * Advertised services.
   */
  uuids?: string[];
  /**
   * Raw advertisement data (**Android** only).
   */
  rawAdvertisement?: DataView;
}

export interface BluetoothLePlugin {
  initialize(options?: InitializeOptions): Promise<void>;
  isEnabled(): Promise<BooleanResult>;
  requestEnable(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  startEnabledNotifications(): Promise<void>;
  stopEnabledNotifications(): Promise<void>;
  isLocationEnabled(): Promise<BooleanResult>;
  openLocationSettings(): Promise<void>;
  openBluetoothSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  setDisplayStrings(displayStrings: DisplayStrings): Promise<void>;
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;
  requestLEScan(options?: RequestBleDeviceOptions): Promise<void>;
  stopLEScan(): Promise<void>;
  getDevices(options: GetDevicesOptions): Promise<GetDevicesResult>;
  getConnectedDevices(options: GetConnectedDevicesOptions): Promise<GetDevicesResult>;
  getBondedDevices(): Promise<GetDevicesResult>;
  addListener(
    eventName: 'onEnabledChanged',
    listenerFunc: (result: BooleanResult) => void,
  ): Promise<PluginListenerHandle>;
  addListener(eventName: string, listenerFunc: (event: ReadResult) => void): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'onScanResult',
    listenerFunc: (result: ScanResultInternal) => void,
  ): Promise<PluginListenerHandle>;
  connect(options: DeviceIdOptions & TimeoutOptions): Promise<void>;
  createBond(options: DeviceIdOptions & TimeoutOptions): Promise<void>;
  isBonded(options: DeviceIdOptions): Promise<BooleanResult>;
  disconnect(options: DeviceIdOptions): Promise<void>;
  getServices(options: DeviceIdOptions): Promise<BleServices>;
  discoverServices(options: DeviceIdOptions): Promise<void>;
  getMtu(options: DeviceIdOptions): Promise<GetMtuResult>;
  requestConnectionPriority(options: RequestConnectionPriorityOptions): Promise<void>;
  readRssi(options: DeviceIdOptions): Promise<ReadRssiResult>;
  read(options: ReadOptions & TimeoutOptions): Promise<ReadResult>;
  write(options: WriteOptions & TimeoutOptions): Promise<void>;
  writeWithoutResponse(options: WriteOptions & TimeoutOptions): Promise<void>;
  readDescriptor(options: ReadDescriptorOptions & TimeoutOptions): Promise<ReadResult>;
  writeDescriptor(options: WriteDescriptorOptions & TimeoutOptions): Promise<void>;
  startNotifications(options: ReadOptions): Promise<void>;
  stopNotifications(options: ReadOptions): Promise<void>;
}

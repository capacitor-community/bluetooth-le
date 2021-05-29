import type { PluginListenerHandle } from '@capacitor/core';

import type { DisplayStrings } from './config';

export interface RequestBleDeviceOptions {
  /**
   * Filter devices by service UUIDs.
   * UUIDs have to be specified as 128 bit UUID strings in lowercase,
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

export interface ReadOptions {
  deviceId: string;
  service: string;
  characteristic: string;
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

export interface BooleanResult {
  value: boolean;
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
  rssi: number;
  txPower: number;
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
  rssi: number;
  /**
   * Transmit power in dBm. A value of 127 indicates that it is not available.
   */
  txPower: number;
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
  initialize(): Promise<void>;
  getEnabled(): Promise<BooleanResult>;
  startEnabledNotifications(): Promise<void>;
  stopEnabledNotifications(): Promise<void>;
  setDisplayStrings(displayStrings: DisplayStrings): Promise<void>;
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;
  requestLEScan(options?: RequestBleDeviceOptions): Promise<void>;
  stopLEScan(): Promise<void>;
  addListener(
    eventName: 'onEnabledChanged',
    listenerFunc: (result: BooleanResult) => void,
  ): PluginListenerHandle;
  addListener(
    eventName: string,
    listenerFunc: (event: ReadResult) => void,
  ): PluginListenerHandle;
  addListener(
    eventName: 'onScanResult',
    listenerFunc: (result: ScanResultInternal) => void,
  ): PluginListenerHandle;
  connect(options: DeviceIdOptions): Promise<void>;
  createBond(options: DeviceIdOptions): Promise<void>;
  isBonded(options: DeviceIdOptions): Promise<BooleanResult>;
  disconnect(options: DeviceIdOptions): Promise<void>;
  read(options: ReadOptions): Promise<ReadResult>;
  write(options: WriteOptions): Promise<void>;
  writeWithoutResponse(options: WriteOptions): Promise<void>;
  startNotifications(options: ReadOptions): Promise<void>;
  stopNotifications(options: ReadOptions): Promise<void>;
}

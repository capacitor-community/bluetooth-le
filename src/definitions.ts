import { PluginListenerHandle } from '@capacitor/core';

declare module '@capacitor/core' {
  interface PluginRegistry {
    BluetoothLe: BluetoothLePlugin;
  }
}

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
   * For web, all services that will be used have to be listed under services or optionalServices,
   * e.g. [numberToUUID(0x180f)] (see [UUID format](#uuid-format))
   */
  optionalServices?: string[];
}

export interface BleDevice {
  /**
   * ID of the device, which will be needed for further calls.
   * On Android this is the BLE MAC address.
   * On iOS and web it is an identifier.
   */
  deviceId: string;
  /**
   * Name of the device.
   */
  name?: string;
  uuids?: string[];
}

export interface ConnectOptions {
  deviceId: string;
}

export interface ReadOptions {
  deviceId: string;
  service: string;
  characteristic: string;
}

export interface WriteOptions {
  deviceId: string;
  service: string;
  characteristic: string;
  /**
   * android, ios: string
   * web: DataView
   */
  value: DataView | string;
}

export interface ReadResult {
  /**
   * android, ios: string
   * web: DataView
   */
  value?: DataView | string;
}

export interface BluetoothLePlugin {
  initialize(): Promise<void>;
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;
  addListener(
    eventName: string,
    listenerFunc: (event: ReadResult) => void,
  ): PluginListenerHandle;
  connect(options: ConnectOptions): Promise<void>;
  disconnect(options: ConnectOptions): Promise<void>;
  read(options: ReadOptions): Promise<ReadResult>;
  write(otpions: WriteOptions): Promise<void>;
  startNotifications(options: ReadOptions): Promise<void>;
  stopNotifications(options: ReadOptions): Promise<void>;
}

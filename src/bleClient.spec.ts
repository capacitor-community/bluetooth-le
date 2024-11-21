/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

import type { BleClientInterface } from './bleClient';
import { BleClient } from './bleClient';
import { hexStringToDataView, numbersToDataView } from './conversion';
import type { BleDevice } from './definitions';
import { BluetoothLe } from './plugin';

interface BleClientWithPrivate extends BleClientInterface {
  eventListeners: Map<string, PluginListenerHandle>;
  scanListener: PluginListenerHandle | null;
}

jest.mock('@capacitor/core', () => {
  return {
    __esModule: true,
    Capacitor: {
      getPlatform: jest.fn(),
    },
  };
});

jest.mock('./plugin', () => {
  const mockBluetoothLe = {
    initialize: jest.fn(),
    isEnabled: jest.fn(),
    addListener: jest.fn(),
    startEnabledNotifications: jest.fn(),
    stopEnabledNotifications: jest.fn(),
    requestDevice: jest.fn(),
    requestLEScan: jest.fn(),
    stopLEScan: jest.fn(),
    getConnectedDevices: jest.fn(() => {
      return Promise.resolve({ devices: [] });
    }),
    getBondeddDevices: jest.fn(() => {
      return Promise.resolve({ devices: [] });
    }),
    connect: jest.fn(),
    createBond: jest.fn(),
    isBonded: jest.fn(),
    disconnect: jest.fn(),
    read: jest.fn(),
    write: jest.fn(),
    writeWithoutResponse: jest.fn(),
    startNotifications: jest.fn(),
    stopNotifications: jest.fn(),
    readDescriptor: jest.fn(),
    writeDescriptor: jest.fn(),
  };
  return {
    __esModule: true,
    BluetoothLe: mockBluetoothLe,
  };
});

describe('BleClient', () => {
  let mockDevice: BleDevice;
  const service = '00001234-0000-1000-8000-00805f9b34fb';
  const characteristic = '00001235-0000-1000-8000-00805f9b34fb';
  const descriptor = '00001236-0000-1000-8000-00805f9b34fb';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDevice = { deviceId: '123' };
  });

  it('should run initialize', async () => {
    await BleClient.initialize();
    expect(BluetoothLe.initialize).toHaveBeenCalledTimes(1);
  });

  it('should run initialize with options', async () => {
    await BleClient.initialize({ androidNeverForLocation: true });
    expect(BluetoothLe.initialize).toHaveBeenCalledTimes(1);
  });

  it('should run isEnabled', async () => {
    (BluetoothLe.isEnabled as jest.Mock).mockReturnValue({ value: true });
    const result = await BleClient.isEnabled();
    expect(result).toBe(true);
    expect(BluetoothLe.isEnabled).toHaveBeenCalledTimes(1);
  });

  it('should run startEnabledNotifications', async () => {
    const mockCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);

    await BleClient.startEnabledNotifications(mockCallback);
    expect(BluetoothLe.addListener).toHaveBeenCalledWith('onEnabledChanged', expect.any(Function));
    expect(BluetoothLe.startEnabledNotifications).toHaveBeenCalledTimes(1);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get('onEnabledChanged')).toBe(
      mockPluginListenerHandle
    );
  });

  it('should remove previous event listener when running startEnabledNotifications twice', async () => {
    const mockCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);

    await BleClient.startEnabledNotifications(mockCallback);
    await BleClient.startEnabledNotifications(mockCallback);
    expect(mockPluginListenerHandle.remove).toHaveBeenCalledTimes(1);
  });

  it('should run stopEnabledNotifications', async () => {
    const mockCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);

    await BleClient.startEnabledNotifications(mockCallback);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get('onEnabledChanged')).toBe(
      mockPluginListenerHandle
    );
    await BleClient.stopEnabledNotifications();
    expect(mockPluginListenerHandle.remove).toHaveBeenCalledTimes(1);
    expect(BluetoothLe.stopEnabledNotifications).toHaveBeenCalledTimes(1);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get('onEnabledChanged')).toBeUndefined();
  });

  it('should run requestDevice', async () => {
    (BluetoothLe.requestDevice as jest.Mock).mockReturnValue(mockDevice);
    const result = await BleClient.requestDevice();
    expect(BluetoothLe.requestDevice).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockDevice);
  });

  it('should validate serviceUUIDs', async () => {
    expect.assertions(1);
    try {
      // @ts-expect-error testing invalid input
      await BleClient.requestDevice({ services: [0x180] });
    } catch (e) {
      // @ts-ignore
      expect(e.message).toContain('Expected string');
    }
  });

  it('should validate services in getConnectedDevices', async () => {
    expect.assertions(4);
    try {
      // @ts-expect-error testing invalid input
      await BleClient.getConnectedDevices('');
    } catch (e) {
      // @ts-ignore
      expect(e.message).toContain('services must be an array');
    }
    try {
      await BleClient.getConnectedDevices(['']);
    } catch (e) {
      // @ts-ignore
      expect(e.message).toContain('Invalid UUID format');
    }
    await BleClient.getConnectedDevices([service]);
    expect(BluetoothLe.getConnectedDevices).toHaveBeenCalledTimes(1);
    expect(BluetoothLe.getConnectedDevices).toHaveBeenCalledWith({ services: [service] });
  });

  it('should run requestLEScan', async () => {
    const mockCallback = jest.fn();
    const mockScanListener = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockScanListener);
    await BleClient.requestLEScan({}, mockCallback);
    expect(BluetoothLe.addListener).toHaveBeenCalledWith('onScanResult', expect.any(Function));
    expect((BleClient as unknown as BleClientWithPrivate).scanListener).toBe(mockScanListener);
    expect(BluetoothLe.requestLEScan).toHaveBeenCalledTimes(1);
  });

  it('should run stopLEScan', async () => {
    const mockCallback = jest.fn();
    const mockScanListener = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockScanListener);
    await BleClient.requestLEScan({}, mockCallback);
    expect((BleClient as unknown as BleClientWithPrivate).scanListener).toBe(mockScanListener);
    await BleClient.stopLEScan();
    expect(mockScanListener.remove).toHaveBeenCalledTimes(1);
    expect((BleClient as unknown as BleClientWithPrivate).scanListener).toBe(null);
    expect(BluetoothLe.stopLEScan).toHaveBeenCalledTimes(1);
  });

  it('should run connect without disconnect callback', async () => {
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);
    await BleClient.connect(mockDevice.deviceId);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get('disconnected|123')).toBeUndefined();
    expect(BluetoothLe.connect).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId });
  });

  it('should register disconnect callback', async () => {
    const mockDisconnectCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);
    await BleClient.connect(mockDevice.deviceId, mockDisconnectCallback);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get('disconnected|123')).toBe(
      mockPluginListenerHandle
    );
    expect(BluetoothLe.connect).toHaveBeenCalledTimes(1);
  });

  it('should run connect with timeout', async () => {
    await BleClient.connect(mockDevice.deviceId, () => undefined, { timeout: 20000 });
    expect(BluetoothLe.connect).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId, timeout: 20000 });
  });

  it('should run createBond', async () => {
    await BleClient.createBond(mockDevice.deviceId);
    expect(BluetoothLe.createBond).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId });
  });

  it('should run isBonded', async () => {
    (BluetoothLe.isBonded as jest.Mock).mockReturnValue({ value: true });
    const result = await BleClient.isBonded(mockDevice.deviceId);
    expect(result).toBe(true);
    expect(BluetoothLe.isBonded).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId });
  });

  it('should run disconnect', async () => {
    await BleClient.disconnect(mockDevice.deviceId);
    expect(BluetoothLe.disconnect).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId });
  });

  it('should run read', async () => {
    (BluetoothLe.read as jest.Mock).mockReturnValue({ value: '00 05 c8 ' });
    const result = await BleClient.read(mockDevice.deviceId, service, characteristic);
    expect(result).toEqual(hexStringToDataView('00 05 c8'));
    expect(BluetoothLe.read).toHaveBeenCalledWith({ deviceId: mockDevice.deviceId, service, characteristic });
  });

  it('should run read with timeout', async () => {
    (BluetoothLe.read as jest.Mock).mockReturnValue({ value: '00 05 c8 ' });
    await BleClient.read(mockDevice.deviceId, service, characteristic, { timeout: 6000 });
    expect(BluetoothLe.read).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      timeout: 6000,
    });
  });

  it('should run write data view on web', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('web');
    expect(Capacitor.getPlatform()).toBe('web');
    await BleClient.write(mockDevice.deviceId, service, characteristic, numbersToDataView([0, 1]));
    expect(BluetoothLe.write).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: numbersToDataView([0, 1]),
    });
  });

  it('should run write string on native platform', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    expect(Capacitor.getPlatform()).toBe('android');

    await BleClient.write(mockDevice.deviceId, service, characteristic, numbersToDataView([0, 1]));
    expect(BluetoothLe.write).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: '00 01',
    });
  });

  it('should respect offset and length of DataView when writing', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    expect(Capacitor.getPlatform()).toBe('android');
    const dataView = new DataView(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).buffer, 2, 5);
    await BleClient.write(mockDevice.deviceId, service, characteristic, dataView);
    expect(BluetoothLe.write).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: '03 04 05 06 07',
    });
  });

  it('should run write with timeout', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    await BleClient.write(mockDevice.deviceId, service, characteristic, numbersToDataView([0, 1]), { timeout: 6000 });
    expect(BluetoothLe.write).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: '00 01',
      timeout: 6000,
    });
  });

  it('should run writeWithoutResponse', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('web');
    await BleClient.writeWithoutResponse(mockDevice.deviceId, service, characteristic, numbersToDataView([0, 1]));
    expect(BluetoothLe.writeWithoutResponse).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: numbersToDataView([0, 1]),
    });
  });

  it('should run writeWithoutResponse with timeout', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    await BleClient.writeWithoutResponse(mockDevice.deviceId, service, characteristic, numbersToDataView([0, 1]), {
      timeout: 6000,
    });
    expect(BluetoothLe.writeWithoutResponse).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      value: '00 01',
      timeout: 6000,
    });
  });

  it('should run startNotifications', async () => {
    const mockCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);

    await BleClient.startNotifications(mockDevice.deviceId, service, characteristic, mockCallback);
    const key = 'notification|123|00001234-0000-1000-8000-00805f9b34fb|00001235-0000-1000-8000-00805f9b34fb';
    expect(BluetoothLe.addListener).toHaveBeenCalledWith(key, expect.any(Function));
    expect(BluetoothLe.startNotifications).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
    });
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get(key)).toBe(mockPluginListenerHandle);
  });

  it('should run stopNotifications', async () => {
    const mockCallback = jest.fn();
    const mockPluginListenerHandle = {
      remove: jest.fn(),
    };
    (BluetoothLe.addListener as jest.Mock).mockReturnValue(mockPluginListenerHandle);

    const key = 'notification|123|00001234-0000-1000-8000-00805f9b34fb|00001235-0000-1000-8000-00805f9b34fb';
    await BleClient.startNotifications(mockDevice.deviceId, service, characteristic, mockCallback);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get(key)).toBe(mockPluginListenerHandle);
    await BleClient.stopNotifications(mockDevice.deviceId, service, characteristic);
    expect(BluetoothLe.stopNotifications).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
    });
    expect(mockPluginListenerHandle.remove).toHaveBeenCalledTimes(1);
    expect((BleClient as unknown as BleClientWithPrivate).eventListeners.get(key)).toBeUndefined();
  });

  it('should run readDescriptor with timeout', async () => {
    (BluetoothLe.readDescriptor as jest.Mock).mockReturnValue({ value: '00 05 c8 ' });
    const result = await BleClient.readDescriptor(mockDevice.deviceId, service, characteristic, descriptor, {
      timeout: 6000,
    });
    expect(BluetoothLe.readDescriptor).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      descriptor,
      timeout: 6000,
    });
    expect(result).toEqual(hexStringToDataView('00 05 c8'));
  });

  it('should run writeDescriptor with timeout', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    await BleClient.writeDescriptor(
      mockDevice.deviceId,
      service,
      characteristic,
      descriptor,
      numbersToDataView([0, 1]),
      {
        timeout: 6000,
      }
    );
    expect(BluetoothLe.writeDescriptor).toHaveBeenCalledWith({
      deviceId: mockDevice.deviceId,
      service,
      characteristic,
      descriptor,
      value: '00 01',
      timeout: 6000,
    });
  });
});

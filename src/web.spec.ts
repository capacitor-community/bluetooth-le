/**
 * @jest-environment jsdom
 */

import { numberToUUID } from './conversion';
import type { BluetoothLePlugin } from './definitions';
import { BluetoothLeWeb } from './web';

interface BluetoothLeWithPrivate extends BluetoothLePlugin {
  deviceMap: Map<string, BluetoothDevice>;
  discoveredDevices: Map<string, boolean>;
  scan: BluetoothLEScan | null;
  onAdvertisementReceivedCallback: (event: BluetoothAdvertisingEvent) => void;
  onDisconnectedCallback: (event: Event) => void;
}

describe('BluetoothLe web', () => {
  const events: Record<string, (payload: any) => void> = {
    advertisementreceived: () => undefined,
  };

  const mockBluetooth = {
    getAvailability: jest.fn(),
    requestDevice: jest.fn(),
    getDevices: jest.fn(),
    requestLEScan: jest.fn(),
    addEventListener: jest.fn((event, callback) => {
      events[event] = callback;
    }),
    removeEventListener: jest.fn((event) => {
      delete events[event];
    }),
  };

  let BluetoothLe: BluetoothLeWeb;

  Object.defineProperty(window, 'navigator', {
    value: { bluetooth: mockBluetooth },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    BluetoothLe = new BluetoothLeWeb();
  });

  it('should initialize', async () => {
    mockBluetooth.getAvailability.mockReturnValue(Promise.resolve(true));
    await BluetoothLe.initialize();
    expect(BluetoothLe).toBeTruthy();
  });

  it('should throw an error if BLE is not available', async () => {
    mockBluetooth.getAvailability.mockReturnValue(false);
    await expect(BluetoothLe.initialize()).rejects.toEqual(new Error('No Bluetooth radio available.'));
  });

  it('should run requestDevice', async () => {
    const mockDevice: Partial<BluetoothDevice> = { id: '123', name: 'test device' };
    mockBluetooth.requestDevice.mockReturnValue(mockDevice);
    const result = await BluetoothLe.requestDevice();
    expect(mockBluetooth.requestDevice).toHaveBeenCalledWith({ filters: undefined, acceptAllDevices: true });
    expect(result).toStrictEqual({
      deviceId: '123',
      name: 'test device',
    });
    expect((BluetoothLe as unknown as BluetoothLeWithPrivate).deviceMap.get('123')).toBe(mockDevice);
  });

  it('should run requestDevice with filters', async () => {
    const mockDevice: Partial<BluetoothDevice> = { id: '123', name: 'test device' };
    mockBluetooth.requestDevice.mockReturnValue(mockDevice);
    const result = await BluetoothLe.requestDevice({
      services: ['0000180d-0000-1000-8000-00805f9b34fb'],
      optionalServices: [numberToUUID(0x180f)],
      name: 'test device',
      namePrefix: 'test',
    });
    expect(mockBluetooth.requestDevice).toHaveBeenCalledWith({
      filters: [
        {
          name: 'test device',
          namePrefix: 'test',
          services: ['0000180d-0000-1000-8000-00805f9b34fb'],
        },
      ],
      optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb'],
      acceptAllDevices: false,
    });
    expect(result).toStrictEqual({
      deviceId: '123',
      name: 'test device',
    });
  });

  it('should run requestLEScan', async () => {
    await BluetoothLe.requestLEScan();
    expect(mockBluetooth.removeEventListener).toHaveBeenCalledWith(
      'advertisementreceived',
      (BluetoothLe as unknown as BluetoothLeWithPrivate).onAdvertisementReceivedCallback
    );
    expect(mockBluetooth.addEventListener).toHaveBeenCalledWith(
      'advertisementreceived',
      (BluetoothLe as unknown as BluetoothLeWithPrivate).onAdvertisementReceivedCallback
    );
    expect(mockBluetooth.requestLEScan).toHaveBeenCalledWith({ filters: undefined, acceptAllAdvertisements: true });
  });

  it('should notify listeners on advertisementreceived', async () => {
    const listener = jest.fn();
    await BluetoothLe.addListener('onScanResult', listener);
    await BluetoothLe.requestLEScan();
    expect(mockBluetooth.addEventListener).toBeCalledTimes(1);

    const advertisement = {
      device: {
        id: '1',
        name: 'test device 1',
      },
    };
    events['advertisementreceived'](advertisement);
    expect((BluetoothLe as unknown as BluetoothLeWithPrivate).discoveredDevices.size).toBe(1);
    expect((BluetoothLe as unknown as BluetoothLeWithPrivate).discoveredDevices.has('1')).toBe(true);
    expect(listener).toBeCalledTimes(1);

    // notify again on new device
    const advertisement2 = {
      device: {
        id: '2',
        name: 'test device 2',
      },
    };
    events['advertisementreceived'](advertisement2);
    expect(listener).toBeCalledTimes(2);

    // do not notify again on same device
    events['advertisementreceived'](advertisement2);
    expect(listener).toBeCalledTimes(2);
  });

  it('should run requestLEScan with filters', async () => {
    await BluetoothLe.requestLEScan({
      services: ['0000180d-0000-1000-8000-00805f9b34fb'],
      optionalServices: [numberToUUID(0x180f)],
      name: 'test device',
      namePrefix: 'test',
      allowDuplicates: true,
    });
    expect(mockBluetooth.requestLEScan).toHaveBeenCalledWith({
      filters: [
        {
          name: 'test device',
          namePrefix: 'test',
          services: ['0000180d-0000-1000-8000-00805f9b34fb'],
        },
      ],
      acceptAllAdvertisements: false,
      keepRepeatedDevices: true,
    });
  });

  it('should run connect', async () => {
    const mockDevice: Partial<BluetoothDevice> = {
      id: '123',
      name: 'test device',
      removeEventListener: jest.fn(),
      addEventListener: jest.fn(),
      gatt: {
        connect: jest.fn(),
      } as unknown as BluetoothRemoteGATTServer,
    };
    mockBluetooth.requestDevice.mockReturnValue(mockDevice);
    await BluetoothLe.requestDevice();
    await BluetoothLe.connect({ deviceId: mockDevice.id! });
    expect(mockDevice.removeEventListener).toHaveBeenCalledWith(
      'gattserverdisconnected',
      (BluetoothLe as unknown as BluetoothLeWithPrivate).onDisconnectedCallback
    );
    expect(mockDevice.addEventListener).toHaveBeenCalledWith(
      'gattserverdisconnected',
      (BluetoothLe as unknown as BluetoothLeWithPrivate).onDisconnectedCallback
    );
    expect(mockDevice.gatt!.connect).toHaveBeenCalledTimes(1);
  });
});

# Service Data Filtering - Complete Usage Guide

## Overview

The Bluetooth LE plugin now supports **service data filtering** for both Android and iOS. Service data is data associated with a specific service UUID in BLE advertisement packets, commonly used by protocols like OpenDroneID.

## TypeScript Definitions

### `ServiceDataFilter` Interface

```typescript
export interface ServiceDataFilter {
  /**
   * Service UUID to filter by. The service data must be associated with this UUID.
   * UUIDs have to be specified as 128 bit UUID strings,
   * e.g. '0000fffa-0000-1000-8000-00805f9b34fb'
   */
  serviceUuid: string;

  /**
   * Prefix to match in the service data field.
   * For example, OpenDroneID uses [0x0D] as the advertisement code.
   */
  dataPrefix?: Uint8Array;

  /**
   * Set filter on partial service data. For any bit in the mask, set it to 1 
   * if it needs to match the one in service data, otherwise set it to 0.
   * The `mask` must have the same length as dataPrefix.
   */
  mask?: Uint8Array;
}
```

### Updated `RequestBleDeviceOptions`

```typescript
export interface RequestBleDeviceOptions {
  services?: string[];
  name?: string;
  namePrefix?: string;
  optionalServices?: string[];
  allowDuplicates?: boolean;
  scanMode?: ScanMode;
  manufacturerData?: ManufacturerDataFilter[];
  
  /**
   * Allow scanning for devices with specific service data.
   * Service data is data associated with a specific service UUID in the advertisement packet.
   * Useful for protocols like OpenDroneID.
   */
  serviceData?: ServiceDataFilter[];
}
```

## Usage Examples

### 1. Basic OpenDroneID Scanning

Scan for OpenDroneID devices with service UUID and AD code `0x0D`:

```typescript
import { BleClient } from '@capacitor-community/bluetooth-le';

await BleClient.initialize();

await BleClient.requestLEScan(
  {
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x0D])
      }
    ],
    allowDuplicates: true
  },
  (result) => {
    console.log('Found OpenDroneID device:', result);
    console.log('Device ID:', result.device.deviceId);
    console.log('RSSI:', result.rssi);
    console.log('Service Data:', result.serviceData);
  }
);
```

### 2. Filter by Service UUID Only

Match any device advertising the specified service UUID:

```typescript
await BleClient.requestLEScan(
  {
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb'
        // No dataPrefix = match any data for this service
      }
    ]
  },
  (result) => {
    console.log('Device found:', result);
  }
);
```

### 3. Using Bit Mask for Pattern Matching

Match specific bits in service data using a mask:

```typescript
await BleClient.requestLEScan(
  {
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x0D, 0x00]),
        mask: new Uint8Array([0xFF, 0xF0])  // Match first byte fully, upper 4 bits of second
      }
    ],
    allowDuplicates: true
  },
  (result) => {
    console.log('Matched with mask:', result);
  }
);
```

### 4. Multiple Service Data Filters

Scan for devices matching ANY of the specified filters (OR logic):

```typescript
await BleClient.requestLEScan(
  {
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x0D])
      },
      {
        serviceUuid: '0000fff0-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x10])
      }
    ]
  },
  (result) => {
    console.log('Device matches one of the filters:', result);
  }
);
```

### 5. Combine All Filter Types

Use service data filtering along with other filters:

```typescript
await BleClient.requestLEScan(
  {
    // Standard service UUID filter
    services: ['0000180a-0000-1000-8000-00805f9b34fb'],
    
    // Service data filter
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x0D])
      }
    ],
    
    // Manufacturer data filter
    manufacturerData: [
      {
        companyIdentifier: 0x004C,  // Apple
        dataPrefix: new Uint8Array([0x02, 0x15])
      }
    ],
    
    // Name filters
    name: 'MyDevice',
    namePrefix: 'Drone',
    
    // Scan settings
    allowDuplicates: true,
    scanMode: ScanMode.SCAN_MODE_LOW_LATENCY
  },
  (result) => {
    console.log('Device matches all filters:', result);
  }
);
```

### 6. Stop Scanning

```typescript
await BleClient.stopLEScan();
```

## OpenDroneID Specific Example

Complete example for scanning OpenDroneID drones:

```typescript
import { BleClient, ScanMode } from '@capacitor-community/bluetooth-le';

// OpenDroneID constants
const OPENDRONEID_SERVICE_UUID = '0000fffa-0000-1000-8000-00805f9b34fb';
const OPENDRONEID_AD_CODE = 0x0D;

async function scanForDrones() {
  try {
    await BleClient.initialize();
    
    console.log('Starting OpenDroneID scan...');
    
    await BleClient.requestLEScan(
      {
        serviceData: [
          {
            serviceUuid: OPENDRONEID_SERVICE_UUID,
            dataPrefix: new Uint8Array([OPENDRONEID_AD_CODE])
          }
        ],
        allowDuplicates: true,
        scanMode: ScanMode.SCAN_MODE_LOW_LATENCY
      },
      (result) => {
        console.log('Drone detected!');
        console.log('Device ID:', result.device.deviceId);
        console.log('Device Name:', result.device.name);
        console.log('RSSI:', result.rssi);
        
        // Parse OpenDroneID service data
        if (result.serviceData) {
          const serviceData = result.serviceData[OPENDRONEID_SERVICE_UUID];
          if (serviceData) {
            console.log('OpenDroneID Data:', serviceData);
            // Process OpenDroneID message...
          }
        }
      }
    );
    
    // Stop after 30 seconds
    setTimeout(async () => {
      await BleClient.stopLEScan();
      console.log('Scan stopped');
    }, 30000);
    
  } catch (error) {
    console.error('Error scanning:', error);
  }
}
```

## Platform Support

| Feature | Android | iOS | Web |
|---------|---------|-----|-----|
| Service UUID filtering | ✅ Hardware | ✅ Software | ✅ Client-side |
| Service data prefix | ✅ Hardware | ✅ Software | ✅ Client-side |
| Service data mask | ✅ Hardware | ✅ Software | ✅ Client-side |

### Android
- Uses `ScanFilter.Builder().setServiceData()`
- Hardware-level filtering for efficiency
- Supports all filter combinations

### iOS
- Uses `CBAdvertisementDataServiceDataKey` for filtering
- Software filtering in scan callback
- Supports all filter combinations

### Web
- **Note:** Web Bluetooth API does not support service data in native scan filters
- Service data filtering is done **client-side** in JavaScript
- Filters are applied after receiving advertisement events
- All devices are scanned, then filtered in the `onAdvertisementReceived` callback
- Less efficient than native filtering, but functionally equivalent
- Supports all filter combinations (serviceUuid, dataPrefix, mask)

## Key Differences from Manufacturer Data

| Feature | Service Data | Manufacturer Data |
|---------|-------------|------------------|
| **Associated with** | Service UUID | Company Identifier |
| **Use case** | Protocol-specific data (OpenDroneID) | Vendor-specific data (iBeacon) |
| **Filter key** | `serviceUuid` (string) | `companyIdentifier` (number) |
| **Data location** | Service data field in adv. packet | Manufacturer data field |

## Migration Guide

If you were using the old `requestLEScanOpendroneId` method:

### Before:
```typescript
// Old hardcoded method (removed)
await BluetoothLe.requestLEScanOpendroneId({ allowDuplicates: true });
```

### After:
```typescript
// New unified method with service data filter
await BleClient.requestLEScan(
  {
    serviceData: [
      {
        serviceUuid: '0000fffa-0000-1000-8000-00805f9b34fb',
        dataPrefix: new Uint8Array([0x0D])
      }
    ],
    allowDuplicates: true
  },
  (result) => {
    // Handle scan result
  }
);
```

## Troubleshooting

### No devices found

1. Verify the service UUID is correct
2. Check that the device is advertising service data (not just the service UUID)
3. Try removing `dataPrefix` to match any service data
4. Enable `allowDuplicates` to see repeated advertisements

### TypeScript errors

Make sure to import the types:

```typescript
import { 
  BleClient, 
  ServiceDataFilter, 
  RequestBleDeviceOptions 
} from '@capacitor-community/bluetooth-le';
```

### Platform-specific issues

**Android:**
- Requires location permissions for BLE scanning
- Check that Bluetooth and location are enabled

**iOS:**
- Check that Bluetooth permission is granted
- Service data filtering is done in software (may be less efficient than Android)

## Related Documentation

- [Manufacturer Data Filtering](./README.md#manufacturer-data-filtering)
- [Service UUID Filtering](./README.md#service-uuid-filtering)
- [OpenDroneID Specification](https://github.com/opendroneid/opendroneid-core-c)
- [BLE Advertisement Packet Structure](https://www.bluetooth.com/specifications/assigned-numbers/)

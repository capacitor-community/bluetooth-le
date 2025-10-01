# Service Data Filtering Support

This document explains how to use the new **Service Data Filtering** feature added to the Bluetooth LE plugin.

## Overview

The plugin now supports filtering BLE devices by **Service Data** in addition to the existing filters (service UUIDs, manufacturer data, device name, etc.).

This is particularly useful for protocols like **OpenDroneID** that use service data for advertising specific information.

## Usage

### Basic Example: OpenDroneID

To scan for OpenDroneID devices that advertise with service UUID `0000fffa-0000-1000-8000-00805f9b34fb` and service data prefix `0x0D`:

```javascript
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D]
    }
  ],
  allowDuplicates: true
});

// Listen for scan results
BluetoothLe.addListener('onScanResult', (result) => {
  console.log('Found device:', result);
});
```

### Service Data Filter Parameters

The `serviceData` parameter accepts an array of filter objects with the following properties:

```typescript
interface ServiceDataFilter {
  serviceUuid: string;        // Required: The service UUID (e.g., "0000fffa-0000-1000-8000-00805f9b34fb")
  dataPrefix?: number[];      // Optional: Array of bytes that the service data must start with
  mask?: number[];            // Optional: Bit mask to apply when matching dataPrefix
}
```

### Examples

#### 1. Filter by Service UUID Only

Match any device advertising the specified service UUID:

```javascript
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb"
    }
  ]
});
```

#### 2. Filter by Service UUID + Data Prefix

Match devices with specific service data content:

```javascript
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D]
    }
  ]
});
```

#### 3. Filter with Bit Mask

Use a mask to match specific bits in the service data:

```javascript
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D, 0x00],
      mask: [0xFF, 0xF0]  // Only compare first byte fully, and upper 4 bits of second byte
    }
  ]
});
```

#### 4. Multiple Service Data Filters

Scan for devices matching any of the specified service data filters:

```javascript
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D]
    },
    {
      serviceUuid: "0000fff0-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x10]
    }
  ]
});
```

#### 5. Combine with Other Filters

You can combine service data filters with other filter types:

```javascript
await BluetoothLe.requestLEScan({
  services: ["0000180a-0000-1000-8000-00805f9b34fb"],  // Service UUID filter
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D]
    }
  ],
  namePrefix: "Drone",  // Device name prefix filter
  allowDuplicates: true
});
```

## Platform Support

### Android
- ✅ Full support via `ScanFilter.Builder().setServiceData()`
- Uses `CBAdvertisementDataServiceDataKey` for filtering
- Supports service UUID, data prefix, and bit mask

### iOS
- ✅ Full support via custom filtering logic
- Uses `CBAdvertisementDataServiceDataKey` for filtering
- Supports service UUID, data prefix, and bit mask

## How It Works

### Android Implementation

The Android implementation adds service data filters to the scan filter list:

```kotlin
val filterBuilder = ScanFilter.Builder()

if (dataPrefix != null && mask != null) {
    filterBuilder.setServiceData(servicePuuid, dataPrefix, mask)
} else if (dataPrefix != null) {
    filterBuilder.setServiceData(servicePuuid, dataPrefix)
} else {
    filterBuilder.setServiceData(servicePuuid, byteArrayOf())
}
```

### iOS Implementation

The iOS implementation filters discovered devices by checking service data in advertisement data:

```swift
guard let serviceDataDict = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data] else {
    return false
}

for filter in filters {
    guard let serviceData = serviceDataDict[filter.serviceUuid] else {
        continue
    }
    
    // Match dataPrefix with optional mask
    if let dataPrefix = filter.dataPrefix {
        if let mask = filter.mask {
            // Apply mask and compare
        } else if serviceData.starts(with: dataPrefix) {
            return true
        }
    }
}
```

## Migration from Old Implementation

### Before (OpenDroneID-specific method):

```javascript
// Had to use a separate method or hardcoded values
await BluetoothLe.requestLEScanOpendroneId({
  allowDuplicates: true
});
```

### After (Unified method with service data):

```javascript
// Use the standard method with service data filter
await BluetoothLe.requestLEScan({
  serviceData: [
    {
      serviceUuid: "0000fffa-0000-1000-8000-00805f9b34fb",
      dataPrefix: [0x0D]
    }
  ],
  allowDuplicates: true
});
```

## Benefits

1. **Flexibility**: Filter by any service UUID and data pattern, not just hardcoded values
2. **Unified API**: One method works for all scanning scenarios
3. **Cross-platform**: Consistent behavior on both Android and iOS
4. **Efficient**: Hardware-level filtering on Android, optimized filtering on iOS
5. **Composable**: Combine with other filter types for precise device discovery

## Notes

- On Android, service data filtering is done at the hardware/OS level for efficiency
- On iOS, service data filtering is done in software during the scan callback
- The `dataPrefix` and `mask` arrays use the same format as `manufacturerData` filters
- If no filters are specified, all devices are discovered (existing behavior)
- Service data filters are combined with OR logic (any match passes)

## See Also

- [Manufacturer Data Filtering](README.md#manufacturer-data-filtering)
- [Service UUID Filtering](README.md#service-uuid-filtering)
- [OpenDroneID Protocol](https://github.com/opendroneid)

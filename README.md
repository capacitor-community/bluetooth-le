# Capacitor Bluetooth Low Energy Plugin

This is a Capacitor plugin for Bluetooth Low Energy. It supports the web, Android and iOS.

The goal is to support the same features on all platforms. Therefore the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) is taken as a guidline for what features to implement.

Below is an index of all the methods available.

<docgen-index>

- [`initialize()`](#initialize)
- [`requestDevice(...)`](#requestdevice)
- [`connect(...)`](#connect)
- [`disconnect(...)`](#disconnect)
- [`read(...)`](#read)
- [`write(...)`](#write)
- [`startNotifications(...)`](#startnotifications)
- [`stopNotifications(...)`](#stopnotifications)
- [Interfaces](#interfaces)

</docgen-index>

## Installation

```
// TODO (plugin is not yet published on npm)
npm install capacitor-bluetooth-le
npx cap sync
```

### iOS

On iOS, add the `NSBluetoothAlwaysUsageDescription` to `Info.plist`, otherwise the app will crash when trying to use Bluetooth (see [here](https://developer.apple.com/documentation/corebluetooth)).

If the app needs to use Bluetooth while it is in the background, you also have to add `bluetooth-central` to `UIBackgroundModes` (for details see [here](https://developer.apple.com/documentation/bundleresources/information_property_list/uibackgroundmodes)).

`./ios/App/App/Info.plist`:

```diff
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
  ...
+	<key>NSBluetoothAlwaysUsageDescription</key>
+	<string>Uses Bluetooth to connect and interact with peripheral BLE devices.</string>
+	<key>UIBackgroundModes</key>
+	<array>
+		<string>bluetooth-central</string>
+	</array>
</dict>
</plist>

```

### Android

On Android, register the plugin in your main activity:

`./android/app/src/main/java/<PATH>/MainActivity.java`:

```diff
+ import com.wespiapps.plugins.capacitorbluetoothle.BluetoothLe;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(
        savedInstanceState,
        new ArrayList<Class<? extends Plugin>>() {
          {
            // Additional plugins you've installed go here
            // Ex: add(TotallyAwesomePlugin.class);
+           add(BluetoothLe.class);
          }
        }
      );
  }
}

```

## Configuration

You can configure the strings that are displayed in the device selection dialog on iOS and Android:

`./capacitor.config.json`:

```JSON
{
  "...": "other configuration",
  "plugins": {
    "BluetoothLe": {
      "displayStrings": {
        "scanning": "Am Scannen...",
        "cancel": "Abbrechen",
        "availableDevices": "Verfügbare Geräte",
        "noDeviceFound": "Kein Gerät gefunden"
      }
    }
  }
}
```

The default values are:

```JSON
{
  "plugins": {
    "BluetoothLe": {
      "displayStrings": {
        "scanning": "Scanning...",
        "cancel": "Cancel",
        "availableDevices": "Available devices",
        "noDeviceFound": "No device found"
      }
    }
  }
}
```

## Usage

It is recommended to not use the plugin class directly. There is a wrapper class `BleClient` which makes events and method arguments easier to work with.

```typescript
// Import the wrapper class directly
import { BleClient } from 'capacitor-bluetooth-le';

// DO NOT use this
import { Plugins } from '@capacitor/core';
const { BluetoothLe } = Plugins;
```

Here is an example of how to use the plugin. It shows how to read the heart rate from a BLE heart rate monitor such as the Polar H10.

```typescript
import {
  BleClient,
  numbersToDataView,
  numberToUUID,
} from 'capacitor-bluetooth-le';

const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_CHARACTERISTIC =
  '00002a37-0000-1000-8000-00805f9b34fb';
const BODY_SENSOR_LOCATION_CHARACTERISTIC =
  '00002a38-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
const POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
const POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';

export async function main() {
  try {
    await BleClient.initialize();

    const device = await BleClient.requestDevice({
      services: [HEART_RATE_SERVICE],
      optionalServices: [BATTERY_SERVICE],
    });

    await BleClient.connect(device.deviceId);
    console.log('connected to device', device);

    const result = await BleClient.read(
      device.deviceId,
      HEART_RATE_SERVICE,
      BODY_SENSOR_LOCATION_CHARACTERISTIC,
    );
    console.log('body sensor location', result.getUint8(0));

    const battery = await BleClient.read(
      device.deviceId,
      BATTERY_SERVICE,
      BATTERY_CHARACTERISTIC,
    );
    console.log('battery level', battery.getUint8(0));

    await BleClient.write(
      device.deviceId,
      POLAR_PMD_SERVICE,
      POLAR_PMD_CONTROL_POINT,
      numbersToDataView([1, 0]),
    );
    console.log('written [1, 0] to control point');

    await BleClient.startNotifications(
      device.deviceId,
      HEART_RATE_SERVICE,
      HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      value => {
        console.log('current heart rate', parseHeartRate(value));
      },
    );

    setTimeout(async () => {
      await BleClient.stopNotifications(
        device.deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      );
      await BleClient.disconnect(device.deviceId);
      console.log('disconnected from device', device);
    }, 10000);
  } catch (error) {
    console.error(error);
  }
}

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  let heartRate: number;
  if (rate16Bits) {
    heartRate = value.getUint16(1, true);
  } else {
    heartRate = value.getUint8(1);
  }
  return heartRate;
}
```

For a full app example, see the `./example` folder of this repository.

## API

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize()

```typescript
initialize() => Promise<void>
```

Initialize Bluetooth Low Energy (BLE). If it fails, BLE might be unavailable or disabled on this device.
On Android it will ask for the location permission. On iOS it will ask for the Bluetooth permission.
For an example, see [usage](#usage).

---

### requestDevice(...)

```typescript
requestDevice(options?: RequestBleDeviceOptions | undefined) => Promise<BleDevice>
```

Request a peripheral BLE device to interact with. This will scan for available devices according to the filters provided in the options and show a dialog to pick a device.
For an example, see [usage](#usage).

| Param         | Type                                                                        | Description                                                             |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#requestbledeviceoptions">RequestBleDeviceOptions</a></code> | Device filters, see [RequestBleDeviceOptions](#RequestBleDeviceOptions) |

**Returns:** <code>Promise&lt;<a href="#bledevice">BleDevice</a>&gt;</code>

---

### connect(...)

```typescript
connect(deviceId: string) => Promise<void>
```

Connect to a peripheral BLE device. For an example, see [usage](#usage).

| Param          | Type                | Description                                                                 |
| -------------- | ------------------- | --------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice)) |

---

### disconnect(...)

```typescript
disconnect(deviceId: string) => Promise<void>
```

Disconnect from a peripheral BLE device. For an example, see [usage](#usage).

| Param          | Type                | Description                                                                 |
| -------------- | ------------------- | --------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice)) |

---

### read(...)

```typescript
read(deviceId: string, service: string, characteristic: string) => Promise<DataView>
```

Read the value of a characteristic. For an example, see [usage](#usage).

| Param                | Type                | Description                                                                 |
| -------------------- | ------------------- | --------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice)) |
| **`service`**        | <code>string</code> | UUID of the service (see [UUID format](#uuid-format))                       |
| **`characteristic`** | <code>string</code> | UUID of the characteristic (see [UUID format](#uuid-format))                |

**Returns:** <code>Promise&lt;<a href="#dataview">DataView</a>&gt;</code>

---

### write(...)

```typescript
write(deviceId: string, service: string, characteristic: string, value: DataView) => Promise<void>
```

Write a value to a characteristic. For an example, see [usage](#usage).

| Param                | Type                                          | Description                                                                                                                                                                                 |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                           | The ID of the device to use (obtained from [requestDevice](#requestDevice))                                                                                                                 |
| **`service`**        | <code>string</code>                           | UUID of the service (see [UUID format](#uuid-format))                                                                                                                                       |
| **`characteristic`** | <code>string</code>                           | UUID of the characteristic (see [UUID format](#uuid-format))                                                                                                                                |
| **`value`**          | <code><a href="#dataview">DataView</a></code> | The value to write as a <a href="#dataview">DataView</a>. To create a <a href="#dataview">DataView</a> from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0]) |

---

### startNotifications(...)

```typescript
startNotifications(deviceId: string, service: string, characteristic: string, callback: (value: DataView) => void) => Promise<void>
```

Start listening to changes of the value of a characteristic. For an example, see [usage](#usage).

| Param                | Type                                                              | Description                                                                 |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                               | The ID of the device to use (obtained from [requestDevice](#requestDevice)) |
| **`service`**        | <code>string</code>                                               | UUID of the service (see [UUID format](#uuid-format))                       |
| **`characteristic`** | <code>string</code>                                               | UUID of the characteristic (see [UUID format](#uuid-format))                |
| **`callback`**       | <code>(value: <a href="#dataview">DataView</a>) =&gt; void</code> | Callback function to use when the value of the characteristic changes       |

---

### stopNotifications(...)

```typescript
stopNotifications(deviceId: string, service: string, characteristic: string) => Promise<void>
```

Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).

| Param                | Type                | Description                                                                 |
| -------------------- | ------------------- | --------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice)) |
| **`service`**        | <code>string</code> | UUID of the service (see [UUID format](#uuid-format))                       |
| **`characteristic`** | <code>string</code> | UUID of the characteristic (see [UUID format](#uuid-format))                |

---

### Interfaces

#### BleDevice

| Prop           | Type                  | Description                                                                                                                           |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code>   | ID of the device, which will be needed for further calls. On Android this is the BLE MAC address. On iOS and web it is an identifier. |
| **`name`**     | <code>string</code>   | Name of the device.                                                                                                                   |
| **`uuids`**    | <code>string[]</code> |                                                                                                                                       |

#### RequestBleDeviceOptions

| Prop                   | Type                  | Description                                                                                                                                                                                                                                                            |
| ---------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`services`**         | <code>string[]</code> | Filter devices by service UUIDs. UUIDs have to be specified as 128 bit UUID strings in lowercase, e.g. ['0000180d-0000-1000-8000-00805f9b34fb'] There is a helper function to convert numbers to UUIDs. e.g. [numberToUUID(0x180f)]. (see [UUID format](#uuid-format)) |
| **`name`**             | <code>string</code>   | Filter devices by name                                                                                                                                                                                                                                                 |
| **`optionalServices`** | <code>string[]</code> | For web, all services that will be used have to be listed under services or optionalServices, e.g. [numberToUUID(0x180f)] (see [UUID format](#uuid-format))                                                                                                            |

#### DataView

| Prop             | Type                                                |
| ---------------- | --------------------------------------------------- |
| **`buffer`**     | <code><a href="#arraybuffer">ArrayBuffer</a></code> |
| **`byteLength`** | <code>number</code>                                 |
| **`byteOffset`** | <code>number</code>                                 |

| Method         | Signature                                                                           | Description                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **getFloat32** | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Float32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset. |
| **getFloat64** | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Float64 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset. |
| **getInt8**    | (byteOffset: number) =&gt; number                                                   | Gets the Int8 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.    |
| **getInt16**   | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Int16 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.   |
| **getInt32**   | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Int32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.   |
| **getUint8**   | (byteOffset: number) =&gt; number                                                   | Gets the Uint8 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.   |
| **getUint16**  | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Uint16 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.  |
| **getUint32**  | (byteOffset: number, littleEndian?: boolean \| undefined) =&gt; number              | Gets the Uint32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.  |
| **setFloat32** | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Float32 value at the specified byte offset from the start of the view.                                                                                    |
| **setFloat64** | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Float64 value at the specified byte offset from the start of the view.                                                                                    |
| **setInt8**    | (byteOffset: number, value: number) =&gt; void                                      | Stores an Int8 value at the specified byte offset from the start of the view.                                                                                       |
| **setInt16**   | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Int16 value at the specified byte offset from the start of the view.                                                                                      |
| **setInt32**   | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Int32 value at the specified byte offset from the start of the view.                                                                                      |
| **setUint8**   | (byteOffset: number, value: number) =&gt; void                                      | Stores an Uint8 value at the specified byte offset from the start of the view.                                                                                      |
| **setUint16**  | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Uint16 value at the specified byte offset from the start of the view.                                                                                     |
| **setUint32**  | (byteOffset: number, value: number, littleEndian?: boolean \| undefined) =&gt; void | Stores an Uint32 value at the specified byte offset from the start of the view.                                                                                     |

#### ArrayBuffer

Represents a raw buffer of binary data, which is used to store data for the
different typed arrays. ArrayBuffers cannot be read from or written to directly,
but can be passed to a typed array or <a href="#dataview">DataView</a> Object to interpret the raw
buffer as needed.

| Prop             | Type                | Description                                                                     |
| ---------------- | ------------------- | ------------------------------------------------------------------------------- |
| **`byteLength`** | <code>number</code> | Read-only. The length of the <a href="#arraybuffer">ArrayBuffer</a> (in bytes). |

| Method    | Signature                                                                               | Description                                                     |
| --------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **slice** | (begin: number, end?: number \| undefined) =&gt; <a href="#arraybuffer">ArrayBuffer</a> | Returns a section of an <a href="#arraybuffer">ArrayBuffer</a>. |

</docgen-api>

### UUID format

All UUIDs have to be provided in 128 bit format as string (lowercase), e.g. `'0000180d-0000-1000-8000-00805f9b34fb'`. There is a helper function to convert 16 bit UUID numbers to string:

```typescript
import { numberToUUID } from 'capacitor-bluetooth-le';

const HEART_RATE_SERVICE = numberToUUID(0x180d);
// '0000180d-0000-1000-8000-00805f9b34fb'
```

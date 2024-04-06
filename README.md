<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Bluetooth Low Energy</h3>
<p align="center"><strong><code>@capacitor-community/bluetooth-le</code></strong></p>
<p align="center">
  Capacitor plugin for Bluetooth Low Energy 
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2024?style=flat-square" />
  <a href="https://github.com/capacitor-community/bluetooth-le/actions?query=workflow%3A%22CI%22"><img src="https://img.shields.io/github/actions/workflow/status/capacitor-community/bluetooth-le/main.yml?branch=main&style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/bluetooth-le"><img src="https://img.shields.io/npm/l/@capacitor-community/bluetooth-le?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/bluetooth-le"><img src="https://img.shields.io/npm/dw/@capacitor-community/bluetooth-le?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/bluetooth-le"><img src="https://img.shields.io/npm/v/@capacitor-community/bluetooth-le?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-17-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer    | GitHub                              | Social |
| ------------- | ----------------------------------- | ------ |
| Patrick Wespi | [pwespi](https://github.com/pwespi) |        |

## Versions

| Plugin | Capacitor | Documentation                                                                     |
| ------ | --------- | --------------------------------------------------------------------------------- |
| 3.x    | 5.x       | [README](https://github.com/capacitor-community/bluetooth-le/blob/main/README.md) |
| 2.x    | 4.x       | [README](https://github.com/capacitor-community/bluetooth-le/blob/2.x/README.md)  |
| 1.x    | 3.x       | [README](https://github.com/capacitor-community/bluetooth-le/blob/1.x/README.md)  |
| 0.x    | 2.x       | [README](https://github.com/capacitor-community/bluetooth-le/blob/0.x/README.md)  |

## Introduction

This is a Capacitor plugin for Bluetooth Low Energy. It supports the web, Android and iOS.

The goal is to support the same features on all platforms. Therefore the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) is taken as a guidline for what features to implement.

This plugin only supports Bluetooth **Low Energy**, not Bluetooth serial / classic.

Furthermore the plugin only supports the central role of the Bluetooth Low Energy protocol. If you need the peripheral role, take a look a these plugins:

- https://github.com/randdusing/cordova-plugin-bluetoothle
- https://github.com/don/cordova-plugin-ble-peripheral

For support of Web Bluetooth in various browsers, see [implementation status](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md).

Below is an index of all the methods available.

<docgen-index>

- [`initialize(...)`](#initialize)
- [`isEnabled()`](#isenabled)
- [`requestEnable()`](#requestenable)
- [`enable()`](#enable)
- [`disable()`](#disable)
- [`startEnabledNotifications(...)`](#startenablednotifications)
- [`stopEnabledNotifications()`](#stopenablednotifications)
- [`isLocationEnabled()`](#islocationenabled)
- [`openLocationSettings()`](#openlocationsettings)
- [`openBluetoothSettings()`](#openbluetoothsettings)
- [`openAppSettings()`](#openappsettings)
- [`setDisplayStrings(...)`](#setdisplaystrings)
- [`requestDevice(...)`](#requestdevice)
- [`requestLEScan(...)`](#requestlescan)
- [`stopLEScan()`](#stoplescan)
- [`getDevices(...)`](#getdevices)
- [`getConnectedDevices(...)`](#getconnecteddevices)
- [`connect(...)`](#connect)
- [`createBond(...)`](#createbond)
- [`isBonded(...)`](#isbonded)
- [`disconnect(...)`](#disconnect)
- [`getServices(...)`](#getservices)
- [`discoverServices(...)`](#discoverservices)
- [`getMtu(...)`](#getmtu)
- [`requestConnectionPriority(...)`](#requestconnectionpriority)
- [`readRssi(...)`](#readrssi)
- [`read(...)`](#read)
- [`write(...)`](#write)
- [`writeWithoutResponse(...)`](#writewithoutresponse)
- [`readDescriptor(...)`](#readdescriptor)
- [`writeDescriptor(...)`](#writedescriptor)
- [`startNotifications(...)`](#startnotifications)
- [`stopNotifications(...)`](#stopnotifications)
- [Interfaces](#interfaces)
- [Enums](#enums)

</docgen-index>

See [Platform Support](#platform-support) for an overview of supported methods on Android, iOS and web.

## Installation

```
npm install @capacitor-community/bluetooth-le
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

**Note**: Bluetooth is **not** available in the iOS simulator. The `initialize` call will be rejected with an error "BLE unsupported". You have to test your app on a real device.

### Android

On Android, no further steps are required to use the plugin.

#### (Optional) Android 12 Bluetooth permissions

If your app targets Android 12 (API level 31) or higher and your app doesn't use Bluetooth scan results to derive physical location information, you can strongly assert that your app doesn't derive physical location. This allows the app to scan for Bluetooth devices without asking for location permissions. See the [Android documentation](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions#declare-android12-or-higher).

The following steps are required to scan for Bluetooth devices without location permission on Android 12 devices:

- In `android/variables.gradle`, make sure `compileSdkVersion` and `targetSdkVersion` are at least 31 (changing those values can have other consequences on your app, so make sure you know what you're doing).
- In `android/app/src/main/AndroidManifest.xml`, update the permissions:
  ```diff
      <!-- Permissions -->
  +   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" android:maxSdkVersion="30" />
  +   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
  +   <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
  +     android:usesPermissionFlags="neverForLocation"
  +     tools:targetApi="s" />
  ```
- Set the `androidNeverForLocation` flag to `true` when initializing the `BleClient`.
  ```ts
  import { BleClient } from '@capacitor-community/bluetooth-le';
  await BleClient.initialize({ androidNeverForLocation: true });
  ```

> [_Note_: If you include neverForLocation in your android:usesPermissionFlags, some BLE beacons are filtered from the scan results.](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions#assert-never-for-location)

## Configuration

You can configure the strings that are displayed in the device selection dialog on iOS and Android when using `requestDevice()`:

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

The display strings can also be set at run-time using [`setDisplayStrings(...)`](#setdisplaystrings).

## Usage

There is a plugin wrapper class `BleClient` which makes events and method arguments easier to work with.

```typescript
// Import the wrapper class
import { BleClient } from '@capacitor-community/bluetooth-le';
```

**Note**: It is not recommended to use the `BluetoothLe` plugin class directly.

### Heart rate monitor

Here is an example of how to use the plugin. It shows how to read the heart rate from a BLE heart rate monitor such as the Polar H10.

```typescript
import { BleClient, numbersToDataView, numberToUUID } from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';
const BODY_SENSOR_LOCATION_CHARACTERISTIC = '00002a38-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
const POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
const POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';

export async function main(): Promise<void> {
  try {
    await BleClient.initialize();

    const device = await BleClient.requestDevice({
      services: [HEART_RATE_SERVICE],
      optionalServices: [BATTERY_SERVICE, POLAR_PMD_SERVICE],
    });

    // connect to device, the onDisconnect callback is optional
    await BleClient.connect(device.deviceId, (deviceId) => onDisconnect(deviceId));
    console.log('connected to device', device);

    const result = await BleClient.read(device.deviceId, HEART_RATE_SERVICE, BODY_SENSOR_LOCATION_CHARACTERISTIC);
    console.log('body sensor location', result.getUint8(0));

    const battery = await BleClient.read(device.deviceId, BATTERY_SERVICE, BATTERY_CHARACTERISTIC);
    console.log('battery level', battery.getUint8(0));

    await BleClient.write(device.deviceId, POLAR_PMD_SERVICE, POLAR_PMD_CONTROL_POINT, numbersToDataView([1, 0]));
    console.log('written [1, 0] to control point');

    await BleClient.startNotifications(
      device.deviceId,
      HEART_RATE_SERVICE,
      HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      (value) => {
        console.log('current heart rate', parseHeartRate(value));
      }
    );

    // disconnect after 10 sec
    setTimeout(async () => {
      await BleClient.stopNotifications(device.deviceId, HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT_CHARACTERISTIC);
      await BleClient.disconnect(device.deviceId);
      console.log('disconnected from device', device);
    }, 10000);
  } catch (error) {
    console.error(error);
  }
}

function onDisconnect(deviceId: string): void {
  console.log(`device ${deviceId} disconnected`);
}

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  let heartRate: number;
  if (rate16Bits > 0) {
    heartRate = value.getUint16(1, true);
  } else {
    heartRate = value.getUint8(1);
  }
  return heartRate;
}
```

### Scanning API

Here is an example of using the scanning API.

```typescript
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = numberToUUID(0x180d);

export async function scan(): Promise<void> {
  try {
    await BleClient.initialize();

    await BleClient.requestLEScan(
      {
        services: [HEART_RATE_SERVICE],
      },
      (result) => {
        console.log('received new scan result', result);
      }
    );

    setTimeout(async () => {
      await BleClient.stopLEScan();
      console.log('stopped scanning');
    }, 5000);
  } catch (error) {
    console.error(error);
  }
}
```

## Example Applications

- [BLE Tester](https://github.com/sourcya/ble-tester) (Ionic/React)
- [OpenGoPro](https://github.com/gopro/OpenGoPro/tree/main/demos/ionic/file_transfer) (Ionic/Angular)
- [Quasar BLE](https://github.com/nunogois/quasar-ble) (Quasar/Vue)

## Platform Support

_Note_: web support depends on the browser, see [implementation status](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md).

| method                                                         | Android | iOS | web |
| -------------------------------------------------------------- | :-----: | :-: | :-: |
| [`initialize()`](#initialize)                                  |   ✅    | ✅  | ✅  |
| [`isEnabled()`](#isenabled)                                    |   ✅    | ✅  | --  |
| [`requestEnable()`](#requestEnable)                            |   ✅    | ❌  | ❌  |
| [`enable()`](#enable)                                          |   ✅    | ❌  | ❌  |
| [`disable()`](#disable)                                        |   ✅    | ❌  | ❌  |
| [`startEnabledNotifications(...)`](#startenablednotifications) |   ✅    | ✅  | --  |
| [`stopEnabledNotifications()`](#stopenablednotifications)      |   ✅    | ✅  | --  |
| [`isLocationEnabled()`](#islocationenabled)                    |   ✅    | ❌  | ❌  |
| [`openLocationSettings()`](#openlocationsettings)              |   ✅    | ❌  | ❌  |
| [`openBluetoothSettings()`](#openbluetoothsettings)            |   ✅    | ❌  | ❌  |
| [`openAppSettings()`](#openappsettings)                        |   ✅    | ✅  | ❌  |
| [`setDisplayStrings(...)`](#setdisplaystrings)                 |   ✅    | ✅  | --  |
| [`requestDevice(...)`](#requestdevice)                         |   ✅    | ✅  | ✅  |
| [`requestLEScan(...)`](#requestlescan)                         |   ✅    | ✅  | 🚩  |
| [`stopLEScan()`](#stoplescan)                                  |   ✅    | ✅  | 🚩  |
| [`getDevices(...)`](#getdevices)                               |   ✅    | ✅  | 🚩  |
| [`getConnectedDevices(...)`](#getconnecteddevices)             |   ✅    | ✅  | 🚩  |
| [`connect(...)`](#connect)                                     |   ✅    | ✅  | ✅  |
| [`createBond(...)`](#createbond)                               |   ✅    | ❌  | ❌  |
| [`isBonded(...)`](#isbonded)                                   |   ✅    | ❌  | ❌  |
| [`disconnect(...)`](#disconnect)                               |   ✅    | ✅  | ✅  |
| [`getServices(...)`](#getservices)                             |   ✅    | ✅  | ✅  |
| [`discoverServices(...)`](#discoverservices)                   |   ✅    | ✅  | ❌  |
| [`getMtu(...)`](#getmtu)                                       |   ✅    | ✅  | ❌  |
| [`requestConnectionPriority(...)`](#requestconnectionpriority) |   ✅    | ❌  | ❌  |
| [`readRssi(...)`](#readrssi)                                   |   ✅    | ✅  | ❌  |
| [`read(...)`](#read)                                           |   ✅    | ✅  | ✅  |
| [`write(...)`](#write)                                         |   ✅    | ✅  | ✅  |
| [`readDescriptor(...)`](#readdescriptor)                       |   ✅    | ✅  | ✅  |
| [`writeDescriptor(...)`](#writedescriptor)                     |   ✅    | ✅  | ✅  |
| [`writeWithoutResponse(...)`](#writewithoutresponse)           |   ✅    | ✅  | ✅  |
| [`startNotifications(...)`](#startnotifications)               |   ✅    | ✅  | ✅  |
| [`stopNotifications(...)`](#stopnotifications)                 |   ✅    | ✅  | ✅  |

#### Legend

- ✅ supported
- ❌ not supported (throws an `unavailable` error)
- 🚩 behind a flag in Chrome (see [implementation status](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md))
- -- not supported, but does not throw an error

## API

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options?: InitializeOptions | undefined) => Promise<void>
```

Initialize Bluetooth Low Energy (BLE). If it fails, BLE might be unavailable on this device.
On **Android** it will ask for the location permission. On **iOS** it will ask for the Bluetooth permission.
For an example, see [usage](#usage).

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#initializeoptions">InitializeOptions</a></code> |

---

### isEnabled()

```typescript
isEnabled() => Promise<boolean>
```

Reports whether Bluetooth is enabled on this device.
Always returns `true` on **web**.

**Returns:** <code>Promise&lt;boolean&gt;</code>

---

### requestEnable()

```typescript
requestEnable() => Promise<void>
```

Request enabling Bluetooth. Show a system activity that allows the user to turn on Bluetooth. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#ACTION_REQUEST_ENABLE
Only available on **Android**.

---

### enable()

```typescript
enable() => Promise<void>
```

Enable Bluetooth.
Only available on **Android**.
**Deprecated** Will fail on Android SDK &gt;= 33. Use `requestEnable` instead. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#enable()

---

### disable()

```typescript
disable() => Promise<void>
```

Disable Bluetooth.
Only available on **Android**.
**Deprecated** Will fail on Android SDK &gt;= 33. See https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#disable()

---

### startEnabledNotifications(...)

```typescript
startEnabledNotifications(callback: (value: boolean) => void) => Promise<void>
```

Register a callback function that will be invoked when Bluetooth is enabled (true) or disabled (false) on this device.
Not available on **web** (the callback will never be invoked).

| Param          | Type                                     | Description                                                |
| -------------- | ---------------------------------------- | ---------------------------------------------------------- |
| **`callback`** | <code>(value: boolean) =&gt; void</code> | Callback function to use when the Bluetooth state changes. |

---

### stopEnabledNotifications()

```typescript
stopEnabledNotifications() => Promise<void>
```

Stop the enabled notifications registered with `startEnabledNotifications`.

---

### isLocationEnabled()

```typescript
isLocationEnabled() => Promise<boolean>
```

Reports whether Location Services are enabled on this device.
Only available on **Android**.

**Returns:** <code>Promise&lt;boolean&gt;</code>

---

### openLocationSettings()

```typescript
openLocationSettings() => Promise<void>
```

Open Location settings.
Only available on **Android**.

---

### openBluetoothSettings()

```typescript
openBluetoothSettings() => Promise<void>
```

Open Bluetooth settings.
Only available on **Android**.

---

### openAppSettings()

```typescript
openAppSettings() => Promise<void>
```

Open App settings.
Not available on **web**.
On **iOS** when a user declines the request to use Bluetooth on the first call of `initialize`, it is not possible
to request for Bluetooth again from within the app. In this case Bluetooth has to be enabled in the app settings
for the app to be able use it.

---

### setDisplayStrings(...)

```typescript
setDisplayStrings(displayStrings: DisplayStrings) => Promise<void>
```

Set the strings that are displayed in the `requestDevice` dialog.

| Param                | Type                                                      |
| -------------------- | --------------------------------------------------------- |
| **`displayStrings`** | <code><a href="#displaystrings">DisplayStrings</a></code> |

---

### requestDevice(...)

```typescript
requestDevice(options?: RequestBleDeviceOptions | undefined) => Promise<BleDevice>
```

Request a peripheral BLE device to interact with. This will scan for available devices according to the filters in the options and show a dialog to pick a device.
For an example, see [usage](#usage).

| Param         | Type                                                                        | Description                                                             |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#requestbledeviceoptions">RequestBleDeviceOptions</a></code> | Device filters, see [RequestBleDeviceOptions](#RequestBleDeviceOptions) |

**Returns:** <code>Promise&lt;<a href="#bledevice">BleDevice</a>&gt;</code>

---

### requestLEScan(...)

```typescript
requestLEScan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void) => Promise<void>
```

Start scanning for BLE devices to interact with according to the filters in the options. The callback will be invoked on each device that is found.
Scanning will continue until `stopLEScan` is called. For an example, see [usage](#usage).
**Note**: Use with care on **web** platform, the required API is still behind a flag in most browsers.

| Param          | Type                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| **`options`**  | <code><a href="#requestbledeviceoptions">RequestBleDeviceOptions</a></code> |
| **`callback`** | <code>(result: <a href="#scanresult">ScanResult</a>) =&gt; void</code>      |

---

### stopLEScan()

```typescript
stopLEScan() => Promise<void>
```

Stop scanning for BLE devices. For an example, see [usage](#usage).

---

### getDevices(...)

```typescript
getDevices(deviceIds: string[]) => Promise<BleDevice[]>
```

On iOS and web, if you want to connect to a previously connected device without scanning first, you can use `getDevice`.
Uses [retrievePeripherals](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager/1519127-retrieveperipherals) on iOS and
[getDevices](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getDevices) on web.
On Android, you can directly connect to the device with the deviceId.

| Param           | Type                  | Description                                             |
| --------------- | --------------------- | ------------------------------------------------------- |
| **`deviceIds`** | <code>string[]</code> | List of device IDs, e.g. saved from a previous app run. |

**Returns:** <code>Promise&lt;BleDevice[]&gt;</code>

---

### getConnectedDevices(...)

```typescript
getConnectedDevices(services: string[]) => Promise<BleDevice[]>
```

Get a list of currently connected devices.
Uses [retrieveConnectedPeripherals](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager/1518924-retrieveconnectedperipherals) on iOS,
[getConnectedDevices](<https://developer.android.com/reference/android/bluetooth/BluetoothManager#getConnectedDevices(int)>) on Android
and [getDevices](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getDevices) on web.

| Param          | Type                  | Description                                                                                                              |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`services`** | <code>string[]</code> | List of services to filter the devices by. If no service is specified, no devices will be returned. Only applies to iOS. |

**Returns:** <code>Promise&lt;BleDevice[]&gt;</code>

---

### connect(...)

```typescript
connect(deviceId: string, onDisconnect?: ((deviceId: string) => void) | undefined, options?: TimeoutOptions | undefined) => Promise<void>
```

Connect to a peripheral BLE device. For an example, see [usage](#usage).

| Param              | Type                                                      | Description                                                                                                    |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**     | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`onDisconnect`** | <code>((deviceId: string) =&gt; void)</code>              | Optional disconnect callback function that will be used when the device disconnects                            |
| **`options`**      | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                        |

---

### createBond(...)

```typescript
createBond(deviceId: string, options?: TimeoutOptions | undefined) => Promise<void>
```

Create a bond with a peripheral BLE device.
Only available on **Android**. On iOS bonding is handled by the OS.

| Param          | Type                                                      | Description                                                                                                    |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`options`**  | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                        |

---

### isBonded(...)

```typescript
isBonded(deviceId: string) => Promise<boolean>
```

Report whether a peripheral BLE device is bonded.
Only available on **Android**. On iOS bonding is handled by the OS.

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

**Returns:** <code>Promise&lt;boolean&gt;</code>

---

### disconnect(...)

```typescript
disconnect(deviceId: string) => Promise<void>
```

Disconnect from a peripheral BLE device. For an example, see [usage](#usage).

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

---

### getServices(...)

```typescript
getServices(deviceId: string) => Promise<BleService[]>
```

Get services, characteristics and descriptors of a device.

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

**Returns:** <code>Promise&lt;BleService[]&gt;</code>

---

### discoverServices(...)

```typescript
discoverServices(deviceId: string) => Promise<void>
```

Discover services, characteristics and descriptors of a device.
You only need this method if your peripheral device changes its services and characteristics at runtime.
If the discovery was successful, the remote services can be retrieved using the getServices function.
Not available on **web**.

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

---

### getMtu(...)

```typescript
getMtu(deviceId: string) => Promise<number>
```

Get the MTU of a connected device. Note that the maximum write value length is 3 bytes less than the MTU.
Not available on **web**.

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

**Returns:** <code>Promise&lt;number&gt;</code>

---

### requestConnectionPriority(...)

```typescript
requestConnectionPriority(deviceId: string, connectionPriority: ConnectionPriority) => Promise<void>
```

Request a connection parameter update.
Only available on **Android**. https://developer.android.com/reference/android/bluetooth/BluetoothGatt#requestConnectionPriority(int)

| Param                    | Type                                                              | Description                                                                                                    |
| ------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**           | <code>string</code>                                               | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`connectionPriority`** | <code><a href="#connectionpriority">ConnectionPriority</a></code> | Request a specific connection priority. See [ConnectionPriority](#connectionpriority)                          |

---

### readRssi(...)

```typescript
readRssi(deviceId: string) => Promise<number>
```

Read the RSSI value of a connected device.
Not available on **web**.

| Param          | Type                | Description                                                                                                    |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |

**Returns:** <code>Promise&lt;number&gt;</code>

---

### read(...)

```typescript
read(deviceId: string, service: string, characteristic: string, options?: TimeoutOptions | undefined) => Promise<DataView>
```

Read the value of a characteristic. For an example, see [usage](#usage).

| Param                | Type                                                      | Description                                                                                                    |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`service`**        | <code>string</code>                                       | UUID of the service (see [UUID format](#uuid-format))                                                          |
| **`characteristic`** | <code>string</code>                                       | UUID of the characteristic (see [UUID format](#uuid-format))                                                   |
| **`options`**        | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                        |

**Returns:** <code>Promise&lt;<a href="#dataview">DataView</a>&gt;</code>

---

### write(...)

```typescript
write(deviceId: string, service: string, characteristic: string, value: DataView, options?: TimeoutOptions | undefined) => Promise<void>
```

Write a value to a characteristic. For an example, see [usage](#usage).

| Param                | Type                                                      | Description                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))                                                                              |
| **`service`**        | <code>string</code>                                       | UUID of the service (see [UUID format](#uuid-format))                                                                                                                                       |
| **`characteristic`** | <code>string</code>                                       | UUID of the characteristic (see [UUID format](#uuid-format))                                                                                                                                |
| **`value`**          | <code><a href="#dataview">DataView</a></code>             | The value to write as a <a href="#dataview">DataView</a>. To create a <a href="#dataview">DataView</a> from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0]) |
| **`options`**        | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                                                                                                     |

---

### writeWithoutResponse(...)

```typescript
writeWithoutResponse(deviceId: string, service: string, characteristic: string, value: DataView, options?: TimeoutOptions | undefined) => Promise<void>
```

Write a value to a characteristic without waiting for a response.

| Param                | Type                                                      | Description                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))                                                                              |
| **`service`**        | <code>string</code>                                       | UUID of the service (see [UUID format](#uuid-format))                                                                                                                                       |
| **`characteristic`** | <code>string</code>                                       | UUID of the characteristic (see [UUID format](#uuid-format))                                                                                                                                |
| **`value`**          | <code><a href="#dataview">DataView</a></code>             | The value to write as a <a href="#dataview">DataView</a>. To create a <a href="#dataview">DataView</a> from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0]) |
| **`options`**        | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                                                                                                     |

---

### readDescriptor(...)

```typescript
readDescriptor(deviceId: string, service: string, characteristic: string, descriptor: string, options?: TimeoutOptions | undefined) => Promise<DataView>
```

Read the value of a descriptor.

| Param                | Type                                                      | Description                                                                                                    |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`service`**        | <code>string</code>                                       | UUID of the service (see [UUID format](#uuid-format))                                                          |
| **`characteristic`** | <code>string</code>                                       | UUID of the characteristic (see [UUID format](#uuid-format))                                                   |
| **`descriptor`**     | <code>string</code>                                       | UUID of the descriptor (see [UUID format](#uuid-format))                                                       |
| **`options`**        | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                        |

**Returns:** <code>Promise&lt;<a href="#dataview">DataView</a>&gt;</code>

---

### writeDescriptor(...)

```typescript
writeDescriptor(deviceId: string, service: string, characteristic: string, descriptor: string, value: DataView, options?: TimeoutOptions | undefined) => Promise<void>
```

Write a value to a descriptor.

| Param                | Type                                                      | Description                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                       | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))                                                                              |
| **`service`**        | <code>string</code>                                       | UUID of the service (see [UUID format](#uuid-format))                                                                                                                                       |
| **`characteristic`** | <code>string</code>                                       | UUID of the characteristic (see [UUID format](#uuid-format))                                                                                                                                |
| **`descriptor`**     | <code>string</code>                                       | UUID of the descriptor (see [UUID format](#uuid-format))                                                                                                                                    |
| **`value`**          | <code><a href="#dataview">DataView</a></code>             | The value to write as a <a href="#dataview">DataView</a>. To create a <a href="#dataview">DataView</a> from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0]) |
| **`options`**        | <code><a href="#timeoutoptions">TimeoutOptions</a></code> | Options for plugin call                                                                                                                                                                     |

---

### startNotifications(...)

```typescript
startNotifications(deviceId: string, service: string, characteristic: string, callback: (value: DataView) => void) => Promise<void>
```

Start listening to changes of the value of a characteristic.
Note that you should only start the notifications once per characteristic in your app and share the data and
not call `startNotifications` in every component that needs the data.
For an example, see [usage](#usage).

| Param                | Type                                                              | Description                                                                                                    |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code>                                               | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`service`**        | <code>string</code>                                               | UUID of the service (see [UUID format](#uuid-format))                                                          |
| **`characteristic`** | <code>string</code>                                               | UUID of the characteristic (see [UUID format](#uuid-format))                                                   |
| **`callback`**       | <code>(value: <a href="#dataview">DataView</a>) =&gt; void</code> | Callback function to use when the value of the characteristic changes                                          |

---

### stopNotifications(...)

```typescript
stopNotifications(deviceId: string, service: string, characteristic: string) => Promise<void>
```

Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).

| Param                | Type                | Description                                                                                                    |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`deviceId`**       | <code>string</code> | The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan)) |
| **`service`**        | <code>string</code> | UUID of the service (see [UUID format](#uuid-format))                                                          |
| **`characteristic`** | <code>string</code> | UUID of the characteristic (see [UUID format](#uuid-format))                                                   |

---

### Interfaces

#### InitializeOptions

| Prop                          | Type                 | Description                                                                                                                                                                                                                                                                                                                                      | Default            |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **`androidNeverForLocation`** | <code>boolean</code> | If your app doesn't use Bluetooth scan results to derive physical location information, you can strongly assert that your app doesn't derive physical location. (Android only) Requires adding 'neverForLocation' to AndroidManifest.xml https://developer.android.com/guide/topics/connectivity/bluetooth/permissions#assert-never-for-location | <code>false</code> |

#### DisplayStrings

| Prop                   | Type                | Default                          | Since |
| ---------------------- | ------------------- | -------------------------------- | ----- |
| **`scanning`**         | <code>string</code> | <code>"Scanning..."</code>       | 0.0.1 |
| **`cancel`**           | <code>string</code> | <code>"Cancel"</code>            | 0.0.1 |
| **`availableDevices`** | <code>string</code> | <code>"Available devices"</code> | 0.0.1 |
| **`noDeviceFound`**    | <code>string</code> | <code>"No device found"</code>   | 0.0.1 |

#### BleDevice

| Prop           | Type                  | Description                                                                                                                                       |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`deviceId`** | <code>string</code>   | ID of the device, which will be needed for further calls. On **Android** this is the BLE MAC address. On **iOS** and **web** it is an identifier. |
| **`name`**     | <code>string</code>   | Name of the peripheral device.                                                                                                                    |
| **`uuids`**    | <code>string[]</code> |                                                                                                                                                   |

#### RequestBleDeviceOptions

| Prop                   | Type                                          | Description                                                                                                                                                                                                                                               |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`services`**         | <code>string[]</code>                         | Filter devices by service UUIDs. UUIDs have to be specified as 128 bit UUID strings, e.g. ['0000180d-0000-1000-8000-00805f9b34fb'] There is a helper function to convert numbers to UUIDs. e.g. [numberToUUID(0x180f)]. (see [UUID format](#uuid-format)) |
| **`name`**             | <code>string</code>                           | Filter devices by name                                                                                                                                                                                                                                    |
| **`namePrefix`**       | <code>string</code>                           | Filter devices by name prefix                                                                                                                                                                                                                             |
| **`optionalServices`** | <code>string[]</code>                         | For **web**, all services that will be used have to be listed under services or optionalServices, e.g. [numberToUUID(0x180f)] (see [UUID format](#uuid-format))                                                                                           |
| **`allowDuplicates`**  | <code>boolean</code>                          | Normally scans will discard the second and subsequent advertisements from a single device. If you need to receive them, set allowDuplicates to true (only applicable in `requestLEScan`). (default: false)                                                |
| **`scanMode`**         | <code><a href="#scanmode">ScanMode</a></code> | Android scan mode (default: <a href="#scanmode">ScanMode.SCAN_MODE_BALANCED</a>)                                                                                                                                                                          |

#### ScanResult

| Prop                   | Type                                                              | Description                                                                                                                                                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`device`**           | <code><a href="#bledevice">BleDevice</a></code>                   | The peripheral device that was found in the scan. **Android** and **web**: `device.name` is always identical to `localName`. **iOS**: `device.name` is identical to `localName` the first time a device is discovered, but after connecting `device.name` is the cached GAP name in subsequent scans. |
| **`localName`**        | <code>string</code>                                               | The name of the peripheral device from the advertisement data.                                                                                                                                                                                                                                        |
| **`rssi`**             | <code>number</code>                                               | Received Signal Strength Indication.                                                                                                                                                                                                                                                                  |
| **`txPower`**          | <code>number</code>                                               | Transmit power in dBm. A value of 127 indicates that it is not available.                                                                                                                                                                                                                             |
| **`manufacturerData`** | <code>{ [key: string]: <a href="#dataview">DataView</a>; }</code> | Manufacturer data, key is a company identifier and value is the data.                                                                                                                                                                                                                                 |
| **`serviceData`**      | <code>{ [key: string]: <a href="#dataview">DataView</a>; }</code> | Service data, key is a service UUID and value is the data.                                                                                                                                                                                                                                            |
| **`uuids`**            | <code>string[]</code>                                             | Advertised services.                                                                                                                                                                                                                                                                                  |
| **`rawAdvertisement`** | <code><a href="#dataview">DataView</a></code>                     | Raw advertisement data (**Android** only).                                                                                                                                                                                                                                                            |

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

#### TimeoutOptions

| Prop          | Type                | Description                                                                                                |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **`timeout`** | <code>number</code> | Timeout in milliseconds for plugin call. Default is 10000 for `connect` and 5000 for other plugin methods. |

#### BleService

| Prop                  | Type                             |
| --------------------- | -------------------------------- |
| **`uuid`**            | <code>string</code>              |
| **`characteristics`** | <code>BleCharacteristic[]</code> |

#### BleCharacteristic

| Prop              | Type                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| **`uuid`**        | <code>string</code>                                                                 |
| **`properties`**  | <code><a href="#blecharacteristicproperties">BleCharacteristicProperties</a></code> |
| **`descriptors`** | <code>BleDescriptor[]</code>                                                        |

#### BleCharacteristicProperties

| Prop                             | Type                 |
| -------------------------------- | -------------------- |
| **`broadcast`**                  | <code>boolean</code> |
| **`read`**                       | <code>boolean</code> |
| **`writeWithoutResponse`**       | <code>boolean</code> |
| **`write`**                      | <code>boolean</code> |
| **`notify`**                     | <code>boolean</code> |
| **`indicate`**                   | <code>boolean</code> |
| **`authenticatedSignedWrites`**  | <code>boolean</code> |
| **`reliableWrite`**              | <code>boolean</code> |
| **`writableAuxiliaries`**        | <code>boolean</code> |
| **`extendedProperties`**         | <code>boolean</code> |
| **`notifyEncryptionRequired`**   | <code>boolean</code> |
| **`indicateEncryptionRequired`** | <code>boolean</code> |

#### BleDescriptor

| Prop       | Type                |
| ---------- | ------------------- |
| **`uuid`** | <code>string</code> |

### Enums

#### ScanMode

| Members                     | Value          | Description                                                                                                                                                                                                                                                               |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`SCAN_MODE_LOW_POWER`**   | <code>0</code> | Perform Bluetooth LE scan in low power mode. This mode is enforced if the scanning application is not in foreground. https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_POWER                                                        |
| **`SCAN_MODE_BALANCED`**    | <code>1</code> | Perform Bluetooth LE scan in balanced power mode. (default) Scan results are returned at a rate that provides a good trade-off between scan frequency and power consumption. https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_BALANCED |
| **`SCAN_MODE_LOW_LATENCY`** | <code>2</code> | Scan using highest duty cycle. It's recommended to only use this mode when the application is running in the foreground. https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_LATENCY                                                  |

#### ConnectionPriority

| Members                             | Value          | Description                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`CONNECTION_PRIORITY_BALANCED`**  | <code>0</code> | Use the connection parameters recommended by the Bluetooth SIG. This is the default value if no connection parameter update is requested. https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_BALANCED                                                                                                                                                                     |
| **`CONNECTION_PRIORITY_HIGH`**      | <code>1</code> | Request a high priority, low latency connection. An application should only request high priority connection parameters to transfer large amounts of data over LE quickly. Once the transfer is complete, the application should request CONNECTION_PRIORITY_BALANCED connection parameters to reduce energy use. https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_HIGH |
| **`CONNECTION_PRIORITY_LOW_POWER`** | <code>2</code> | Request low power, reduced data rate connection parameters. https://developer.android.com/reference/android/bluetooth/BluetoothGatt#CONNECTION_PRIORITY_LOW_POWER                                                                                                                                                                                                                                                  |

</docgen-api>

### UUID format

All UUIDs have to be provided in 128 bit format as string, e.g. `'0000180d-0000-1000-8000-00805f9b34fb'`. There is a helper function to convert 16 bit UUID numbers to string:

```typescript
import { numberToUUID } from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = numberToUUID(0x180d);
// '0000180d-0000-1000-8000-00805f9b34fb'
```

## Troubleshooting

#### Connection fails on Android

On some Android devices `connect()` may fail when the device was connected before, even if the device is not actually connected.
In that case you should first call `disconnect()`, e.g.:

```typesceript
const device = await BleClient.requestDevice({
   // ...
});
// ...
await BleClient.disconnect(device.deviceId);
await BleClient.connect(device.deviceId);
```

#### No devices found on Android

On Android, the `initialize` call requests the location permission. However, if location services are disable on the OS level, the app will not find any devices. You can check if the location is enabled and open the settings when not.

```typescript
async function initialize() {
  // Check if location is enabled
  if (this.platform.is('android')) {
    const isLocationEnabled = await BleClient.isLocationEnabled();
    if (!isLocationEnabled) {
      await BleClient.openLocationSettings();
    }
  }
  await BleClient.initialize();
}
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pwespi"><img src="https://avatars2.githubusercontent.com/u/24232962?v=4?s=100" width="100px;" alt="pwespi"/><br /><sub><b>pwespi</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=pwespi" title="Code">💻</a> <a href="https://github.com/capacitor-community/bluetooth-le/commits?author=pwespi" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/dennisameling"><img src="https://avatars.githubusercontent.com/u/17739158?v=4?s=100" width="100px;" alt="Dennis Ameling"/><br /><sub><b>Dennis Ameling</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=dennisameling" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://squio.nl"><img src="https://avatars.githubusercontent.com/u/169410?v=4?s=100" width="100px;" alt="Johannes la Poutre"/><br /><sub><b>Johannes la Poutre</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=squio" title="Documentation">📖</a> <a href="https://github.com/capacitor-community/bluetooth-le/commits?author=squio" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sultanmyrza"><img src="https://avatars.githubusercontent.com/u/12681781?v=4?s=100" width="100px;" alt="Kasymbekov Sultanmyrza"/><br /><sub><b>Kasymbekov Sultanmyrza</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=sultanmyrza" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://sourcya.com"><img src="https://avatars.githubusercontent.com/u/9040320?v=4?s=100" width="100px;" alt="Mutasim Issa"/><br /><sub><b>Mutasim Issa</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=mutasimissa" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.gnucoop.com"><img src="https://avatars.githubusercontent.com/u/1615301?v=4?s=100" width="100px;" alt="Marco Marche"/><br /><sub><b>Marco Marche</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=trik" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JFKakaJFK"><img src="https://avatars.githubusercontent.com/u/13108477?v=4?s=100" width="100px;" alt="Johannes Koch"/><br /><sub><b>Johannes Koch</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=JFKakaJFK" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jrobeson"><img src="https://avatars.githubusercontent.com/u/56908?v=4?s=100" width="100px;" alt="Johnny Robeson"/><br /><sub><b>Johnny Robeson</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=jrobeson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aadito123"><img src="https://avatars.githubusercontent.com/u/63646058?v=4?s=100" width="100px;" alt="Aadit Olkar"/><br /><sub><b>Aadit Olkar</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=aadito123" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/y3nd"><img src="https://avatars.githubusercontent.com/u/18102153?v=4?s=100" width="100px;" alt="Yoann N."/><br /><sub><b>Yoann N.</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=y3nd" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Andy3189"><img src="https://avatars.githubusercontent.com/u/2084016?v=4?s=100" width="100px;" alt="Andy3189"/><br /><sub><b>Andy3189</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=Andy3189" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RFM69CW"><img src="https://avatars.githubusercontent.com/u/20404734?v=4?s=100" width="100px;" alt="Sammy"/><br /><sub><b>Sammy</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=RFM69CW" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/td-tomasz-joniec"><img src="https://avatars.githubusercontent.com/u/109506928?v=4?s=100" width="100px;" alt="td-tomasz-joniec"/><br /><sub><b>td-tomasz-joniec</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=td-tomasz-joniec" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://fanxj.com"><img src="https://avatars.githubusercontent.com/u/10436013?v=4?s=100" width="100px;" alt="Michele Ferrari"/><br /><sub><b>Michele Ferrari</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=micheleypf" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mchl18"><img src="https://avatars.githubusercontent.com/u/6136970?v=4?s=100" width="100px;" alt="mchl18"/><br /><sub><b>mchl18</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=mchl18" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/OpenSrcerer"><img src="https://avatars.githubusercontent.com/u/46500918?v=4?s=100" width="100px;" alt="Daniel Stefani"/><br /><sub><b>Daniel Stefani</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=OpenSrcerer" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lhd-biosency"><img src="https://avatars.githubusercontent.com/u/71714070?v=4?s=100" width="100px;" alt="Laurent"/><br /><sub><b>Laurent</b></sub></a><br /><a href="https://github.com/capacitor-community/bluetooth-le/commits?author=lhd-biosency" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

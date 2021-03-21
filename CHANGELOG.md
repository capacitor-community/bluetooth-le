# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.1](https://github.com/capacitor-community/bluetooth-le/compare/v0.5.0...v0.5.1) (2021-03-21)


### Bug Fixes

* **deps:** fix throat dependency ([833761d](https://github.com/capacitor-community/bluetooth-le/commit/833761dd8b5bd2c02fac98e8822fe6a418e76a8a))

## [0.5.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.4.0...v0.5.0) (2021-03-20)


### Features

* add queue to BleClient ([90c1258](https://github.com/capacitor-community/bluetooth-le/commit/90c12589cee7edc87f6ba496ac0df4ab0f1f2097))


### Bug Fixes

* do not connect after connection timeout ([#80](https://github.com/capacitor-community/bluetooth-le/issues/80)) ([5d5cb42](https://github.com/capacitor-community/bluetooth-le/commit/5d5cb42640af51cb373d3255217c5c8e7dd35fb7))
* **android:** close bluetoothGatt on every disconnection ([b290a06](https://github.com/capacitor-community/bluetooth-le/commit/b290a06ca2a4c87a79418f98e59a605b7f2eb6b0))
* **android:** wait for onDescriptorWrite when setting notifications ([9ee5592](https://github.com/capacitor-community/bluetooth-le/commit/9ee55927d1439215b7b941e78675e08146a27531))

## [0.4.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.3.0...v0.4.0) (2021-03-14)


### Features

* add localName to scanResult ([483ee0e](https://github.com/capacitor-community/bluetooth-le/commit/483ee0e9ad5edd0c7f36f40662af5b8262030c80))


### Bug Fixes

* **android:** always add txPower to scanResult ([7943cc8](https://github.com/capacitor-community/bluetooth-le/commit/7943cc8f4f877edcdf31d63cab1250490cad7542))
* **ios:** reject initialize call when Bluetooth permission is denied ([b5bb292](https://github.com/capacitor-community/bluetooth-le/commit/b5bb2927ee77182b7605fe7e19c533d4e53dd4de))

## [0.3.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.2.0...v0.3.0) (2021-02-27)


### Features

* add writeWithoutResponse ([#53](https://github.com/capacitor-community/bluetooth-le/issues/53)) ([6784a42](https://github.com/capacitor-community/bluetooth-le/commit/6784a42029db753a3d90dbc7d5602b9525b78e02))

## [0.2.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.1.2...v0.2.0) (2021-02-13)


### Features

* add optional onDisconnect callback to connect method ([1eefe64](https://github.com/capacitor-community/bluetooth-le/commit/1eefe64512020ce133e3bda927a5c0249c9cd001))
* implement getEnabled and enabled notifications ([319098f](https://github.com/capacitor-community/bluetooth-le/commit/319098fc17afc047485f075b705c4946ed5c5052))
  * `initialize` will no longer reject when BLE is disabled, use `getEnabled` to check whether BLE is enabled or not


### Bug Fixes

* **ios:** fix allowDuplicates in requestLEScan ([b17b69a](https://github.com/capacitor-community/bluetooth-le/commit/b17b69a9913ec921707ad1d1a4a55b0f87c443fd))
* **web:** avoid duplicate events ([9a0edbf](https://github.com/capacitor-community/bluetooth-le/commit/9a0edbfac39892b4075596d22398533eebf70b39))

### [0.1.2](https://github.com/capacitor-community/bluetooth-le/compare/v0.1.1...v0.1.2) (2021-01-23)


### Bug Fixes

* **definitions:** fix typo in definitions ([#26](https://github.com/capacitor-community/bluetooth-le/issues/26)) ([1cd93f6](https://github.com/capacitor-community/bluetooth-le/commit/1cd93f6fcf1d0e38eb40c71b61fb6b4670939695))
* **web:** use getPlatform instead of platform ([dac82e4](https://github.com/capacitor-community/bluetooth-le/commit/dac82e4fa56f2d1c96a8d2f5d3830def5d037b08))

### 0.1.1 (2021-01-09)

- use commonjs output as main entry point (#14)

### 0.1.0 (2020-12-28)

- add requestLEScan
- add stopLEScan
- add Android scan mode
- add namePrefix filter
- fix getting some events twice
- fix invalid deviceId on Android
- fix device initialization on iOS

### 0.0.3 (2020-12-14)

- fix dependencies

### 0.0.2 (2020-12-14)

- update readme and add code of conduct and contributing

### 0.0.1 (2020-12-14)

- initial release

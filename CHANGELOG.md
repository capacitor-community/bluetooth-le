# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

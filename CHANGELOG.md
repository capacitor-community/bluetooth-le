# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.7.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.6.1...v1.7.0) (2022-01-22)


### Features

* make timeouts configurable ([#279](https://github.com/capacitor-community/bluetooth-le/issues/279)) ([a095fb3](https://github.com/capacitor-community/bluetooth-le/commit/a095fb3d3df5b04d79e3fd53e918d9f76f30396b))


### Bug Fixes

* inline source code in esm map files of plugin ([8ffb1ff](https://github.com/capacitor-community/bluetooth-le/commit/8ffb1ffeefabae3606a624435a870158570f6a43))

### [1.6.1](https://github.com/capacitor-community/bluetooth-le/compare/v1.6.0...v1.6.1) (2022-01-02)


### Bug Fixes

* fix `numberToUUID` for values with leading zeroes ([#261](https://github.com/capacitor-community/bluetooth-le/issues/261)) ([b335dcc](https://github.com/capacitor-community/bluetooth-le/commit/b335dccb37f03667c00366a177050060f3a6ecf8))

## [1.6.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.5.0...v1.6.0) (2021-11-14)


### Features

* **all:** add methods to read/write descriptors ([#236](https://github.com/capacitor-community/bluetooth-le/issues/236)) ([ea9dae3](https://github.com/capacitor-community/bluetooth-le/commit/ea9dae32e23a24900a0e5cd0f52d5994fb27a3fb))
* **all:** make connect timeout configurable ([#242](https://github.com/capacitor-community/bluetooth-le/issues/242)) ([2364c39](https://github.com/capacitor-community/bluetooth-le/commit/2364c39580c864fab17211b16289726f214360eb))
* **android:** implement openAppSettings for android ([#241](https://github.com/capacitor-community/bluetooth-le/issues/241)) ([29abb16](https://github.com/capacitor-community/bluetooth-le/commit/29abb1618b71ae52dca92fd6d87a9d1f8f7b7af8))


### Bug Fixes

* **ios:** fix conversion of CBUUID of length 8 ([c02e3f7](https://github.com/capacitor-community/bluetooth-le/commit/c02e3f75945c41c90a90addbb8c83c191aa2504b))

## [1.5.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.4.0...v1.5.0) (2021-10-02)


### Features

* **android:** add enable and disable methods ([53f1b3d](https://github.com/capacitor-community/bluetooth-le/commit/53f1b3db51a4cc00547307b46e6dbde50c895d28))
* **android:** add new methods isLocationEnabled, openLocationSettings and openBluetoothSettings ([4c1cc60](https://github.com/capacitor-community/bluetooth-le/commit/4c1cc60b76736c0693d7c7bfab1e093710289c68))
* **ios:** add openAppSettings method ([f57fac7](https://github.com/capacitor-community/bluetooth-le/commit/f57fac7fa7689b472b27d7c16dbfc594d9ef3a2c))

## [1.4.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.3.1...v1.4.0) (2021-09-24)


### Features

* **all:** add getServices method ([#200](https://github.com/capacitor-community/bluetooth-le/issues/200)) ([557ef12](https://github.com/capacitor-community/bluetooth-le/commit/557ef12ee960f0e78d10dbf0b0045a4be8eccb0c))


### Bug Fixes

* **android:** make core-ktx version configurable and set default to 1.6.0 ([#199](https://github.com/capacitor-community/bluetooth-le/issues/199)) ([f1357d9](https://github.com/capacitor-community/bluetooth-le/commit/f1357d939e4528dd316e4a89683b81e300af5d0c))

### [1.3.1](https://github.com/capacitor-community/bluetooth-le/compare/v1.3.0...v1.3.1) (2021-09-22)


### Bug Fixes

* **ios:** fix service being nullable in new CBCharacteristic (xcode 13) ([#197](https://github.com/capacitor-community/bluetooth-le/issues/197)) ([469c6eb](https://github.com/capacitor-community/bluetooth-le/commit/469c6eb75f7bb1bebb32a60fe094a1f3bb93a56e)), closes [#196](https://github.com/capacitor-community/bluetooth-le/issues/196) [#196](https://github.com/capacitor-community/bluetooth-le/issues/196)

## [1.3.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.2.0...v1.3.0) (2021-08-27)


### Features

* **android, ios:** add readRssi method to read RSSI value of a connected device ([4b3fc05](https://github.com/capacitor-community/bluetooth-le/commit/4b3fc051d9c32fd7a37c43e6f65f1a322b64c3ef))


### Bug Fixes

* **ios:** fix callback key in case of optional CBUUID ([d8b54ac](https://github.com/capacitor-community/bluetooth-le/commit/d8b54acca1dd3e46543010e8c4c3d41740d452a0))

## [1.2.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.1.3...v1.2.0) (2021-08-21)


### Features

* **all:** add getDevices and getConnectedDevices ([768745c](https://github.com/capacitor-community/bluetooth-le/commit/768745cf38c61a88f356fee5a443e927b50636ef))


### Bug Fixes

* fix type of ScanResult ([0b1ccfe](https://github.com/capacitor-community/bluetooth-le/commit/0b1ccfec98164252a5fe85f9fae0d33317d5d257))
* properly remove event listeners when stopping notifications ([145ec13](https://github.com/capacitor-community/bluetooth-le/commit/145ec13d254a07dbf64224c915c6155668a10d91))
* **web:** fix availability check ([965ff3d](https://github.com/capacitor-community/bluetooth-le/commit/965ff3d52c66232271854338f072bcaf3f19e34c))

### [1.1.3](https://github.com/capacitor-community/bluetooth-le/compare/v1.1.2...v1.1.3) (2021-08-05)


### Bug Fixes

* allow uppercase UUIDs and validate format ([14f654e](https://github.com/capacitor-community/bluetooth-le/commit/14f654e0397b2d5f73d27385e3cd03f00c8fefc0))

### [1.1.2](https://github.com/capacitor-community/bluetooth-le/compare/v1.1.1...v1.1.2) (2021-07-03)


### Bug Fixes

* **android:** set transport for GATT connections to remote dual-mode devices to BLE, closes [#138](https://github.com/capacitor-community/bluetooth-le/issues/138) ([a321aab](https://github.com/capacitor-community/bluetooth-le/commit/a321aabd75fda38205477eec972dfc4ac425d4ad))
* **web:** use writeValueWithResponse instead of deprecated writeValue ([85f1afe](https://github.com/capacitor-community/bluetooth-le/commit/85f1afea39e1e9eef7050a93e65cf31be8f6a9b6))

### [1.1.1](https://github.com/capacitor-community/bluetooth-le/compare/v1.1.0...v1.1.1) (2021-06-11)


### Bug Fixes

* reject write call when value contains invalid data ([24e0c7a](https://github.com/capacitor-community/bluetooth-le/commit/24e0c7a24d3040faf1c088c90dd10fc946c6e4c5))

## [1.1.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0...v1.1.0) (2021-06-05)


### Features

* add setDisplayStrings method ([f3f7e96](https://github.com/capacitor-community/bluetooth-le/commit/f3f7e965f2fe9014bb85e97cc13ec2378bf627b8))
* add isEnabled and deprecate getEnabled ([e47017b](https://github.com/capacitor-community/bluetooth-le/commit/e47017ba97c96e249da11ee77c02765d060a7084))


### Bug Fixes

* **android:** handle ConcurrentModificationException in notifyListeners ([12925e0](https://github.com/capacitor-community/bluetooth-le/commit/12925e08444e8f741a35bc8547626427fce8a82b))

## [1.0.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0-4...v1.0.0) (2021-05-23)

* release for Capacitor 3.0

### Bug Fixes

* **android:** explicitly set looper for handlers ([4ebe4fe](https://github.com/capacitor-community/bluetooth-le/commit/4ebe4fea1cdada6a2a5a9e8e308755285513007f))
* **android:** use AlertDialog from android.app instead of androidx.appcompat.app ([9c4bbeb](https://github.com/capacitor-community/bluetooth-le/commit/9c4bbeb941dc9f2815c4fa2cc3e23e9476a0c035))

## [1.0.0-4](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0-3...v1.0.0-4) (2021-04-10)


### Features

* **android:** add createBond and isBonded ([40e8d3f](https://github.com/capacitor-community/bluetooth-le/commit/40e8d3f8ea1343c634462697038173fcda62453c))


### Bug Fixes

* **android:** do not crash when using startNotifications on characteristic that does not support notifications ([fd4c7f8](https://github.com/capacitor-community/bluetooth-le/commit/fd4c7f833c6c50e2caf415dc4847cc10fc58dd07))
* **android:** do not reject disconnect call when already disconnected ([63808ef](https://github.com/capacitor-community/bluetooth-le/commit/63808ef5a5028b4a88b56975f61e0f0486af27f9))
* **ios:** do not reject disconnect call when already disconnected ([f488140](https://github.com/capacitor-community/bluetooth-le/commit/f4881400601702f87d146defe85d8b24c0492ce4))

## [0.6.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.5.1...v0.6.0) (2021-04-10)


### Features

* **android:** add createBond and isBonded ([c9e8688](https://github.com/capacitor-community/bluetooth-le/commit/c9e868896cf452e426a204878293a630880a4922))


### Bug Fixes

* **android:** do not crash when using startNotifications on characteristic that does not support notifications ([44bc318](https://github.com/capacitor-community/bluetooth-le/commit/44bc31825921dbb5f9d581519d789171c4161df1))
* **android:** do not reject disconnect call when already disconnected ([82c3e6e](https://github.com/capacitor-community/bluetooth-le/commit/82c3e6e5e861223d974944f9198c429e125887ed))
* **ios:** do not reject disconnect call when already disconnected ([e6873e6](https://github.com/capacitor-community/bluetooth-le/commit/e6873e6eff64d7df99b9409762fc924986fe90fb))

## [1.0.0-3](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0-2...v1.0.0-3) (2021-03-21)


### Bug Fixes

* **deps:** fix throat dependency ([e60a17d](https://github.com/capacitor-community/bluetooth-le/commit/e60a17d61f7c159a9a334a6bb402b0be6ae60049))

### [0.5.1](https://github.com/capacitor-community/bluetooth-le/compare/v0.5.0...v0.5.1) (2021-03-21)


### Bug Fixes

* **deps:** fix throat dependency ([833761d](https://github.com/capacitor-community/bluetooth-le/commit/833761dd8b5bd2c02fac98e8822fe6a418e76a8a))

## [1.0.0-2](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0-1...v1.0.0-2) (2021-03-20)


### Features

* add queue to BleClient ([b763247](https://github.com/capacitor-community/bluetooth-le/commit/b7632477fe9ebd359a65dc3cbb1209f652b8119e))


### Bug Fixes

* do not connect after connection timeout ([#80](https://github.com/capacitor-community/bluetooth-le/issues/80)) ([5b9e021](https://github.com/capacitor-community/bluetooth-le/commit/5b9e021746cc23aab0e8ae61d4a32b8ec22bd21d))
* **android:** close bluetoothGatt on every disconnection ([a0aaeef](https://github.com/capacitor-community/bluetooth-le/commit/a0aaeef072a8e85c65fe43e2e6186f2f693e54a5))
* **android:** wait for onDescriptorWrite when setting notifications ([06d05bc](https://github.com/capacitor-community/bluetooth-le/commit/06d05bc0a9862591ee201b4560c7e5c039f6d9f4))

## [0.5.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.4.0...v0.5.0) (2021-03-20)


### Features

* add queue to BleClient ([90c1258](https://github.com/capacitor-community/bluetooth-le/commit/90c12589cee7edc87f6ba496ac0df4ab0f1f2097))


### Bug Fixes

* do not connect after connection timeout ([#80](https://github.com/capacitor-community/bluetooth-le/issues/80)) ([5d5cb42](https://github.com/capacitor-community/bluetooth-le/commit/5d5cb42640af51cb373d3255217c5c8e7dd35fb7))
* **android:** close bluetoothGatt on every disconnection ([b290a06](https://github.com/capacitor-community/bluetooth-le/commit/b290a06ca2a4c87a79418f98e59a605b7f2eb6b0))
* **android:** wait for onDescriptorWrite when setting notifications ([9ee5592](https://github.com/capacitor-community/bluetooth-le/commit/9ee55927d1439215b7b941e78675e08146a27531))

## [1.0.0-1](https://github.com/capacitor-community/bluetooth-le/compare/v1.0.0-0...v1.0.0-1) (2021-03-14)


### Features

* add localName to scanResult ([56627e3](https://github.com/capacitor-community/bluetooth-le/commit/56627e36e70b483903ab0ffb76e6f1f1ee391217))


### Bug Fixes

* **ios:** reject initialize call when Bluetooth permission is denied ([58232f5](https://github.com/capacitor-community/bluetooth-le/commit/58232f560c05456fc49418ca52a92d84fdd5b5d3))

## [0.4.0](https://github.com/capacitor-community/bluetooth-le/compare/v0.3.0...v0.4.0) (2021-03-14)


### Features

* add localName to scanResult ([483ee0e](https://github.com/capacitor-community/bluetooth-le/commit/483ee0e9ad5edd0c7f36f40662af5b8262030c80))


### Bug Fixes

* **android:** always add txPower to scanResult ([7943cc8](https://github.com/capacitor-community/bluetooth-le/commit/7943cc8f4f877edcdf31d63cab1250490cad7542))
* **ios:** reject initialize call when Bluetooth permission is denied ([b5bb292](https://github.com/capacitor-community/bluetooth-le/commit/b5bb2927ee77182b7605fe7e19c533d4e53dd4de))

## [1.0.0-0](https://github.com/capacitor-community/bluetooth-le/compare/v0.3.0...v1.0.0-0) (2021-03-07)


### Features

* upgrade plugin to capacitor v3 ([#15](https://github.com/capacitor-community/bluetooth-le/issues/15)) ([9e21e84](https://github.com/capacitor-community/bluetooth-le/commit/9e21e843f96619b8b8ccfb5de89ae8dc1eca1fb0))


### Bug Fixes

* **android:** always add txPower to scanResult ([7943cc8](https://github.com/capacitor-community/bluetooth-le/commit/7943cc8f4f877edcdf31d63cab1250490cad7542))

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

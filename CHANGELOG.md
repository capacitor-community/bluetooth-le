# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.1.0](https://github.com/capacitor-community/bluetooth-le/compare/v6.0.2...v6.1.0) (2024-11-21)


### Features

* **android:** Add getBondedDevices method to retrieve bonded devices on Android ([#716](https://github.com/capacitor-community/bluetooth-le/issues/716)) ([91a4d00](https://github.com/capacitor-community/bluetooth-le/commit/91a4d0089d4a3125987cc5d4cb0934bb7c004ffd))

### [6.0.2](https://github.com/capacitor-community/bluetooth-le/compare/v6.0.1...v6.0.2) (2024-11-03)

### Features

* improve byte to hex string conversion optimizations ([#701](https://github.com/capacitor-community/bluetooth-le/issues/701)) ([e064587](https://github.com/capacitor-community/bluetooth-le/commit/e064587a7fd55891ec2b4bf1440b9c8d792cc182))

### [6.0.1](https://github.com/capacitor-community/bluetooth-le/compare/v6.0.0...v6.0.1) (2024-07-22)


### Bug Fixes

* **android:** remove unused layout files ([#670](https://github.com/capacitor-community/bluetooth-le/issues/670)) ([72ce7ab](https://github.com/capacitor-community/bluetooth-le/commit/72ce7abd6911d29ab54610ef61398eaf7e5f8fcd))

## [6.0.0](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.4...v6.0.0) (2024-05-04)


### ⚠ BREAKING CHANGES

* update plugin to Capacitor 6

### Features

* update plugin to Capacitor 6 ([619d342](https://github.com/capacitor-community/bluetooth-le/commit/619d342f7ef21057e5b950eb21a16d9d91c69a9f))

## [6.0.0-0](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.1...v6.0.0-0) (2024-02-11)


### ⚠ BREAKING CHANGES

* update plugin to Capacitor 6

### Features

* update plugin to Capacitor 6 ([0475e85](https://github.com/capacitor-community/bluetooth-le/commit/0475e8520c5f044fe2f693a088235ce2f5a72cde))


### Bug Fixes

* fix addListener return types ([fc94069](https://github.com/capacitor-community/bluetooth-le/commit/fc94069ad72ea16a2e74a8382597d61d6e23434e))

### [3.1.4](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.3...v3.1.4) (2024-04-06)


### Bug Fixes

* **ios:** make callback map thread-safe to fix high write and notify rates [#630](https://github.com/capacitor-community/bluetooth-le/issues/630) ([#642](https://github.com/capacitor-community/bluetooth-le/issues/642)) ([da9b782](https://github.com/capacitor-community/bluetooth-le/commit/da9b7823c67d892de9f5fc8c54690e7b9323fed1))
* respect byte offset and length of data view in write call ([#641](https://github.com/capacitor-community/bluetooth-le/issues/641)) ([0f01960](https://github.com/capacitor-community/bluetooth-le/commit/0f01960495c4fa9013bf86fd7a552e9866d928c0))

### [3.1.3](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.2...v3.1.3) (2024-04-06)


### Bug Fixes

* **android:** set custom callback handler to address callbacks execution order [#635](https://github.com/capacitor-community/bluetooth-le/issues/635) ([#637](https://github.com/capacitor-community/bluetooth-le/issues/637)) ([c1af071](https://github.com/capacitor-community/bluetooth-le/commit/c1af07176a1ac3c083a8ecc25c300962e251f805))

### [3.1.2](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.1...v3.1.2) (2024-02-18)


### Bug Fixes

* **android:** pin kotlin jvmTarget version ([#622](https://github.com/capacitor-community/bluetooth-le/issues/622)) ([8597092](https://github.com/capacitor-community/bluetooth-le/commit/859709211066637f565c88d8cba2bc5ea421c29d))

### [3.1.1](https://github.com/capacitor-community/bluetooth-le/compare/v3.1.0...v3.1.1) (2023-11-05)


### Bug Fixes

* **android:** handle requestEnable result ([#595](https://github.com/capacitor-community/bluetooth-le/issues/595)) ([f9cf627](https://github.com/capacitor-community/bluetooth-le/commit/f9cf62714f76621ce8ddd794ece0432fa7e3673f))

## [3.1.0](https://github.com/capacitor-community/bluetooth-le/compare/v3.0.2...v3.1.0) (2023-11-02)


### Features

* **android:** add requestEnable method ([#591](https://github.com/capacitor-community/bluetooth-le/issues/591)) ([79c5742](https://github.com/capacitor-community/bluetooth-le/commit/79c5742d58865bdd7524a1c55cccfd97dd0c1aca))


### Bug Fixes

* **ios:** fix multiple instances of same device object during ble scan ([#589](https://github.com/capacitor-community/bluetooth-le/issues/589)) ([b5219ad](https://github.com/capacitor-community/bluetooth-le/commit/b5219adf15566c31d0b53112f5878cb0018c11e7))

### [3.0.2](https://github.com/capacitor-community/bluetooth-le/compare/v3.0.1...v3.0.2) (2023-10-03)


### Bug Fixes

* **android:** added timeout on Device#createBond ([#573](https://github.com/capacitor-community/bluetooth-le/issues/573)) ([48f664f](https://github.com/capacitor-community/bluetooth-le/commit/48f664fc42e0cbf666abc5b3fb27a0e6fea8fa72))
* **android:** use new methods from API level 33 ([9798e0f](https://github.com/capacitor-community/bluetooth-le/commit/9798e0f68b5c3c2416ebff36545c6f1d0665b31c))
* **android:** use new writeCharacteristic method for API Level >= 33 ([#562](https://github.com/capacitor-community/bluetooth-le/issues/562)) ([cb74440](https://github.com/capacitor-community/bluetooth-le/commit/cb74440fd0d9963f9a388f7c876224e9bf520595))

### [3.0.1](https://github.com/capacitor-community/bluetooth-le/compare/v3.0.0...v3.0.1) (2023-08-14)


### Bug Fixes

* **android:** fix concurrency issue in timeoutmap([#419](https://github.com/capacitor-community/bluetooth-le/issues/419)) ([#560](https://github.com/capacitor-community/bluetooth-le/issues/560)) ([31fa734](https://github.com/capacitor-community/bluetooth-le/commit/31fa734a1813812ea4ffff12e7f0054aa7faf589))

## [3.0.0](https://github.com/capacitor-community/bluetooth-le/compare/v3.0.0-1...v3.0.0) (2023-05-07)


### Features

* update plugin to Capacitor 5 final ([210f9aa](https://github.com/capacitor-community/bluetooth-le/commit/210f9aab7450dfadbf660f67f410bad945f1a314))


### Bug Fixes

* **android:** bump sourceCompatibility and targetCompatibility from java 11 to 17 ([#533](https://github.com/capacitor-community/bluetooth-le/issues/533)) ([228c231](https://github.com/capacitor-community/bluetooth-le/commit/228c2318526c004c5d5cf83190aff49aa156b2b9))

## [3.0.0-1](https://github.com/capacitor-community/bluetooth-le/compare/v3.0.0-0...v3.0.0-1) (2023-04-15)

## [3.0.0-0](https://github.com/capacitor-community/bluetooth-le/compare/v2.2.3...v3.0.0-0) (2023-04-15)


### ⚠ BREAKING CHANGES

* remove deprecated getEnabled, use isEnabled instead
* update plugin to Capacitor 5

### Features

* update plugin to Capacitor 5 ([16822ac](https://github.com/capacitor-community/bluetooth-le/commit/16822ac305416289a3423d2fe112bbcb1454339f))


### Bug Fixes

* remove deprecated getEnabled, use isEnabled instead ([8773995](https://github.com/capacitor-community/bluetooth-le/commit/8773995629ea94c9ebe45391b3bac23feab43b4d))
* validate deviceIds argument of getDevices ([8cedd65](https://github.com/capacitor-community/bluetooth-le/commit/8cedd655b243e78e522f457182aaf6335a963062))

### [2.2.3](https://github.com/capacitor-community/bluetooth-le/compare/v2.2.2...v2.2.3) (2023-04-15)


### Bug Fixes

* **android:** fix disconnecting when connect was called multiple times ([#523](https://github.com/capacitor-community/bluetooth-le/issues/523)) ([3a8595b](https://github.com/capacitor-community/bluetooth-le/commit/3a8595b7f10fc8a3866d5c7915f902c85015552d))

### [2.2.2](https://github.com/capacitor-community/bluetooth-le/compare/v2.2.1...v2.2.2) (2023-04-15)


### Bug Fixes

* **deps:** remove throat dependency ([#521](https://github.com/capacitor-community/bluetooth-le/issues/521)) ([565dc59](https://github.com/capacitor-community/bluetooth-le/commit/565dc59c5d64bdbca1cd22caf6bc0500179904db))

### [2.2.1](https://github.com/capacitor-community/bluetooth-le/compare/v2.2.0...v2.2.1) (2023-04-08)


### Bug Fixes

* **ios:** fix conversion of descriptor value ([1881b9d](https://github.com/capacitor-community/bluetooth-le/commit/1881b9defae9e15026562c005fb936d3eca9d427))
* **ios:** fix getDevices and getConnectedDevices to not stop existing notifications ([565ce8c](https://github.com/capacitor-community/bluetooth-le/commit/565ce8cd050afcd5c41ab29a6f71043401ae4408))
* **web:** filter getDevices result according to deviceIds parameter ([652f33f](https://github.com/capacitor-community/bluetooth-le/commit/652f33f00a8adeb4099ee0f9dd163dc913072af4))

## [2.2.0](https://github.com/capacitor-community/bluetooth-le/compare/v2.1.0...v2.2.0) (2023-04-02)


### Features

* **android, ios:** add getMtu ([6740561](https://github.com/capacitor-community/bluetooth-le/commit/6740561868eb14ae0a32ad15fbd2dbab0465051e))
* **android:** add requestConnectionPriority ([9e4a08e](https://github.com/capacitor-community/bluetooth-le/commit/9e4a08e80edc81c819c2b4c6b02a5594622aee80))


### Bug Fixes

* **android:** fix requestDevice and requestLEScan when BLE adaptor is off in some Android devices ([d1739f5](https://github.com/capacitor-community/bluetooth-le/commit/d1739f5b26f422530fbad71f575c6312783fa30e))
* validate services argument in getConnectedDevices function ([98f663d](https://github.com/capacitor-community/bluetooth-le/commit/98f663d702d92ba7c3625d96acb5a38289a15fb3))

## [2.1.0](https://github.com/capacitor-community/bluetooth-le/compare/v2.0.1...v2.1.0) (2023-01-02)


### Features

* add discoverServices method ([0239f3d](https://github.com/capacitor-community/bluetooth-le/commit/0239f3d82eb4fa7a375c5f02042e6417bddbbc70))


### Bug Fixes

* refactor Android logging ([321a823](https://github.com/capacitor-community/bluetooth-le/commit/321a823cc018fef4ead3845732e329d4b7202981))
* refactor iOS logging ([e215836](https://github.com/capacitor-community/bluetooth-le/commit/e2158367960fd84ed142de60ea4ae04f32f06999))
* logging now respects `loggingBehavior` from Capacitor config
* validate service UUIDs in requestDevice and requestLEScan calls ([ad10fe8](https://github.com/capacitor-community/bluetooth-le/commit/ad10fe81507b32229440bc206c38f7b227cb6efb))

### [2.0.1](https://github.com/capacitor-community/bluetooth-le/compare/v2.0.0...v2.0.1) (2022-10-09)


### Bug Fixes

* **android:** handle immediate enable/disable problems ([a48082d](https://github.com/capacitor-community/bluetooth-le/commit/a48082dd8905f9276bd6ad45e9eefbab03c8da70))

## [2.0.0](https://github.com/capacitor-community/bluetooth-le/compare/v2.0.0-0...v2.0.0) (2022-08-07)

## [2.0.0-0](https://github.com/capacitor-community/bluetooth-le/compare/v1.8.3...v2.0.0-0) (2022-07-29)


### ⚠ BREAKING CHANGES

* update plugin to Capacitor 4

### Features

* update plugin to Capacitor 4 ([88f038a](https://github.com/capacitor-community/bluetooth-le/commit/88f038aeed526c860cfb40e9a4cb9562c25d931b))

### [1.8.3](https://github.com/capacitor-community/bluetooth-le/compare/v1.8.2...v1.8.3) (2022-07-17)


### Bug Fixes

* allow reading and writing empty values ([749bb46](https://github.com/capacitor-community/bluetooth-le/commit/749bb467561455ff38c09cc3915163335498f55c))
* fix conversion of empty hex string ([28f4f69](https://github.com/capacitor-community/bluetooth-le/commit/28f4f69c602f08ff216772170b42af3d0a04aa9f))

### [1.8.2](https://github.com/capacitor-community/bluetooth-le/compare/v1.8.1...v1.8.2) (2022-05-01)


### Bug Fixes

* **android:** close bluetooth gatt in case of connection timeout ([961d8a2](https://github.com/capacitor-community/bluetooth-le/commit/961d8a28b5d59a19706b74b5117c8b107107759a))

### [1.8.1](https://github.com/capacitor-community/bluetooth-le/compare/v1.8.0...v1.8.1) (2022-04-15)


### Bug Fixes

* **android:** fix crash stopScanning with BLE adapter off [#317](https://github.com/capacitor-community/bluetooth-le/issues/317) ([#318](https://github.com/capacitor-community/bluetooth-le/issues/318)) ([07dbd45](https://github.com/capacitor-community/bluetooth-le/commit/07dbd4556d9e10bbb7375e7f7325fbb4a96edf34))

## [1.8.0](https://github.com/capacitor-community/bluetooth-le/compare/v1.7.0...v1.8.0) (2022-02-27)


### Features

* **android:** add support for Android 12 permissions ([#274](https://github.com/capacitor-community/bluetooth-le/issues/274)) ([9d38682](https://github.com/capacitor-community/bluetooth-le/commit/9d386824dde957fc983beeedad6e033bde539c49))  (see [Readme](https://github.com/capacitor-community/bluetooth-le#optional-android-12-bluetooth-permissions))

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

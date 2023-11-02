// swiftlint:disable identifier_name
// swiftlint:disable type_body_length
import Foundation
import Capacitor
import CoreBluetooth

let CONNECTION_TIMEOUT: Double = 10
let DEFAULT_TIMEOUT: Double = 5

@objc(BluetoothLe)
public class BluetoothLe: CAPPlugin {
    typealias BleDevice = [String: Any]
    typealias BleService = [String: Any]
    typealias BleCharacteristic = [String: Any]
    typealias BleDescriptor = [String: Any]
    private var deviceManager: DeviceManager?
    private var deviceMap = [String: Device]()
    private var displayStrings = [String: String]()

    override public func load() {
        self.displayStrings = self.getDisplayStrings()
    }

    @objc func initialize(_ call: CAPPluginCall) {
        self.deviceManager = DeviceManager(self.bridge?.viewController, self.displayStrings, {(success, message) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(message)
            }
        })
    }

    @objc func isEnabled(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        let enabled: Bool = deviceManager.isEnabled()
        call.resolve(["value": enabled])
    }

    @objc func requestEnable(_ call: CAPPluginCall) {
        call.unavailable("requestEnable is not available on iOS.")
    }

    @objc func enable(_ call: CAPPluginCall) {
        call.unavailable("enable is not available on iOS.")
    }

    @objc func disable(_ call: CAPPluginCall) {
        call.unavailable("disable is not available on iOS.")
    }

    @objc func startEnabledNotifications(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        deviceManager.registerStateReceiver({(enabled) -> Void in
            self.notifyListeners("onEnabledChanged", data: ["value": enabled])
        })
        call.resolve()
    }

    @objc func stopEnabledNotifications(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        deviceManager.unregisterStateReceiver()
        call.resolve()
    }

    @objc func isLocationEnabled(_ call: CAPPluginCall) {
        call.unavailable("isLocationEnabled is not available on iOS.")
    }

    @objc func openLocationSettings(_ call: CAPPluginCall) {
        call.unavailable("openLocationSettings is not available on iOS.")
    }

    @objc func openBluetoothSettings(_ call: CAPPluginCall) {
        call.unavailable("openBluetoothSettings is not available on iOS.")
    }

    @objc func openAppSettings(_ call: CAPPluginCall) {
        guard let settingsUrl = URL(string: UIApplication.openSettingsURLString) else {
            call.reject("Cannot open app settings.")
            return
        }

        DispatchQueue.main.async {
            if UIApplication.shared.canOpenURL(settingsUrl) {
                UIApplication.shared.open(settingsUrl, completionHandler: { (success) in
                    call.resolve([
                        "value": success
                    ])
                })
            } else {
                call.reject("Cannot open app settings.")
            }
        }
    }

    @objc func setDisplayStrings(_ call: CAPPluginCall) {
        for key in ["noDeviceFound", "availableDevices", "scanning", "cancel"] {
            if call.getString(key) != nil {
                self.displayStrings[key] = call.getString(key)
            }
        }
        call.resolve()
    }

    @objc func requestDevice(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        deviceManager.setDisplayStrings(self.displayStrings)

        let serviceUUIDs = self.getServiceUUIDs(call)
        let name = call.getString("name")
        let namePrefix = call.getString("namePrefix")

        deviceManager.startScanning(
            serviceUUIDs,
            name,
            namePrefix,
            false,
            true,
            30, {(success, message) -> Void in
                // selected a device
                if success {
                    guard let device = deviceManager.getDevice(message) else {
                        call.reject("Device not found.")
                        return
                    }
                    self.deviceMap[device.getId()] = device
                    let bleDevice: BleDevice = self.getBleDevice(device)
                    call.resolve(bleDevice)
                } else {
                    call.reject(message)
                }
            }, {(_, _, _) -> Void in

            }
        )
    }

    @objc func requestLEScan(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }

        let serviceUUIDs = self.getServiceUUIDs(call)
        let name = call.getString("name")
        let namePrefix = call.getString("namePrefix")
        let allowDuplicates = call.getBool("allowDuplicates", false)

        deviceManager.startScanning(
            serviceUUIDs,
            name,
            namePrefix,
            allowDuplicates,
            false,
            nil, {(success, message) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(message)
                }
            }, {(device, advertisementData, rssi) -> Void in
                self.deviceMap[device.getId()] = device
                let data = self.getScanResult(device, advertisementData, rssi)
                self.notifyListeners("onScanResult", data: data)
            }
        )
    }

    @objc func stopLEScan(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        deviceManager.stopScan()
        call.resolve()
    }

    @objc func getDevices(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        guard let deviceIds = call.getArray("deviceIds", String.self) else {
            call.reject("deviceIds must be provided")
            return
        }
        let deviceUUIDs: [UUID] = deviceIds.compactMap({ deviceId in
            return UUID(uuidString: deviceId)
        })
        let peripherals = deviceManager.getDevices(deviceUUIDs)
        let bleDevices: [BleDevice] = peripherals.map({peripheral in
            let deviceId = peripheral.identifier.uuidString
            guard let device = self.deviceMap[deviceId] else {
                let newDevice = Device(peripheral)
                self.deviceMap[newDevice.getId()] = newDevice
                return self.getBleDevice(newDevice)
            }
            return self.getBleDevice(device)
        })
        call.resolve(["devices": bleDevices])
    }

    @objc func getConnectedDevices(_ call: CAPPluginCall) {
        guard let deviceManager = self.getDeviceManager(call) else { return }
        guard let services = call.getArray("services", String.self) else {
            call.reject("services must be provided")
            return
        }
        let serviceUUIDs: [CBUUID] = services.compactMap({ service in
            return CBUUID(string: service)
        })
        let peripherals = deviceManager.getConnectedDevices(serviceUUIDs)
        let bleDevices: [BleDevice] = peripherals.map({peripheral in
            let deviceId = peripheral.identifier.uuidString
            guard let device = self.deviceMap[deviceId] else {
                let newDevice = Device(peripheral)
                self.deviceMap[newDevice.getId()] = newDevice
                return self.getBleDevice(newDevice)
            }
            return self.getBleDevice(device)
        })
        call.resolve(["devices": bleDevices])
    }

    @objc func connect(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call, checkConnection: false) else { return }
        let timeout = self.getTimeout(call, defaultTimeout: CONNECTION_TIMEOUT)
        device.setOnConnected(timeout, {(success, message) -> Void in
            if success {
                // only resolve after service discovery
                call.resolve()
            } else {
                call.reject(message)
            }
        })
        self.deviceManager?.setOnDisconnected(device, {(_, _) -> Void in
            let key = "disconnected|\(device.getId())"
            self.notifyListeners(key, data: nil)
        })
        self.deviceManager?.connect(device, timeout, {(success, message) -> Void in
            if success {
                log("Connected to peripheral. Waiting for service discovery.")
            } else {
                call.reject(message)
            }
        })

    }

    @objc func createBond(_ call: CAPPluginCall) {
        call.unavailable("createBond is not available on iOS.")
    }

    @objc func isBonded(_ call: CAPPluginCall) {
        call.unavailable("isBonded is not available on iOS.")
    }

    @objc func disconnect(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call, checkConnection: false) else { return }
        let timeout = self.getTimeout(call)
        self.deviceManager?.disconnect(device, timeout, {(success, message) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(message)
            }
        })
    }

    @objc func getServices(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        let services = device.getServices()
        var bleServices = [BleService]()
        for service in services {
            var bleCharacteristics = [BleCharacteristic]()
            for characteristic in service.characteristics ?? [] {
                var bleDescriptors = [BleDescriptor]()
                for descriptor in characteristic.descriptors ?? [] {
                    bleDescriptors.append([
                        "uuid": cbuuidToString(descriptor.uuid)
                    ])
                }
                bleCharacteristics.append([
                    "uuid": cbuuidToString(characteristic.uuid),
                    "properties": getProperties(characteristic),
                    "descriptors": bleDescriptors
                ])
            }
            bleServices.append([
                "uuid": cbuuidToString(service.uuid),
                "characteristics": bleCharacteristics
            ])
        }
        call.resolve(["services": bleServices])
    }

    private func getProperties(_ characteristic: CBCharacteristic) -> [String: Bool] {
        return [
            "broadcast": characteristic.properties.contains(CBCharacteristicProperties.broadcast),
            "read": characteristic.properties.contains(CBCharacteristicProperties.read),
            "writeWithoutResponse": characteristic.properties.contains(CBCharacteristicProperties.writeWithoutResponse),
            "write": characteristic.properties.contains(CBCharacteristicProperties.write),
            "notify": characteristic.properties.contains(CBCharacteristicProperties.notify),
            "indicate": characteristic.properties.contains(CBCharacteristicProperties.indicate),
            "authenticatedSignedWrites": characteristic.properties.contains(CBCharacteristicProperties.authenticatedSignedWrites),
            "extendedProperties": characteristic.properties.contains(CBCharacteristicProperties.extendedProperties),
            "notifyEncryptionRequired": characteristic.properties.contains(CBCharacteristicProperties.notifyEncryptionRequired),
            "indicateEncryptionRequired": characteristic.properties.contains(CBCharacteristicProperties.indicateEncryptionRequired)
        ]
    }

    @objc func discoverServices(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        let timeout = self.getTimeout(call)
        device.discoverServices(timeout, {(success, value) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(value)
            }
        })
    }

    @objc func getMtu(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        call.resolve([
            "value": device.getMtu()
        ])
    }

    @objc func requestConnectionPriority(_ call: CAPPluginCall) {
        call.unavailable("requestConnectionPriority is not available on iOS.")
    }

    @objc func readRssi(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        let timeout = self.getTimeout(call)
        device.readRssi(timeout, {(success, value) -> Void in
            if success {
                call.resolve([
                    "value": value
                ])
            } else {
                call.reject(value)
            }
        })
    }

    @objc func read(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        let timeout = self.getTimeout(call)
        device.read(characteristic.0, characteristic.1, timeout, {(success, value) -> Void in
            if success {
                call.resolve([
                    "value": value
                ])
            } else {
                call.reject(value)
            }
        })
    }

    @objc func write(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        guard let value = call.getString("value") else {
            call.reject("value must be provided")
            return
        }
        let writeType = CBCharacteristicWriteType.withResponse
        let timeout = self.getTimeout(call)
        device.write(
            characteristic.0,
            characteristic.1,
            value,
            writeType,
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(value)
                }
            })
    }

    @objc func writeWithoutResponse(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        guard let value = call.getString("value") else {
            call.reject("value must be provided")
            return
        }
        let writeType = CBCharacteristicWriteType.withoutResponse
        let timeout = self.getTimeout(call)
        device.write(
            characteristic.0,
            characteristic.1,
            value,
            writeType,
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(value)
                }
            })
    }

    @objc func readDescriptor(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let descriptor = self.getDescriptor(call) else { return }
        let timeout = self.getTimeout(call)
        device.readDescriptor(
            descriptor.0,
            descriptor.1,
            descriptor.2,
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve([
                        "value": value
                    ])
                } else {
                    call.reject(value)
                }
            })
    }

    @objc func writeDescriptor(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let descriptor = self.getDescriptor(call) else { return }
        guard let value = call.getString("value") else {
            call.reject("value must be provided")
            return
        }
        let timeout = self.getTimeout(call)
        device.writeDescriptor(
            descriptor.0,
            descriptor.1,
            descriptor.2,
            value,
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(value)
                }
            })
    }

    @objc func startNotifications(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        let timeout = self.getTimeout(call)
        device.setNotifications(
            characteristic.0,
            characteristic.1,
            true, {(_, value) -> Void in
                let key = "notification|\(device.getId())|\(characteristic.0.uuidString.lowercased())|\(characteristic.1.uuidString.lowercased())"
                self.notifyListeners(key, data: ["value": value])
            },
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(value)
                }
            })
    }

    @objc func stopNotifications(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        let timeout = self.getTimeout(call)
        device.setNotifications(
            characteristic.0,
            characteristic.1,
            false,
            nil,
            timeout, {(success, value) -> Void in
                if success {
                    call.resolve()
                } else {
                    call.reject(value)
                }
            })
    }

    private func getDisplayStrings() -> [String: String] {
        let configDisplayStrings = getConfigValue("displayStrings") as? [String: String] ?? [String: String]()
        var displayStrings = [String: String]()
        displayStrings["noDeviceFound"] = configDisplayStrings["noDeviceFound"] ?? "No device found"
        displayStrings["availableDevices"] = configDisplayStrings["availableDevices"] ?? "Available devices"
        displayStrings["scanning"] = configDisplayStrings["scanning"] ?? "Scanning..."
        displayStrings["cancel"] = configDisplayStrings["cancel"] ?? "Cancel"
        return displayStrings
    }

    private func getDeviceManager(_ call: CAPPluginCall) -> DeviceManager? {
        guard let deviceManager = self.deviceManager else {
            call.reject("Bluetooth LE not initialized.")
            return nil
        }
        return deviceManager
    }

    private func getServiceUUIDs(_ call: CAPPluginCall) -> [CBUUID] {
        let services = call.getArray("services", String.self) ?? []
        let serviceUUIDs = services.map({(service) -> CBUUID in
            return CBUUID(string: service)
        })
        return serviceUUIDs
    }

    private func getDevice(_ call: CAPPluginCall, checkConnection: Bool = true) -> Device? {
        guard let deviceId = call.getString("deviceId") else {
            call.reject("deviceId required.")
            return nil
        }
        guard let device = self.deviceMap[deviceId] else {
            call.reject("Device not found. Call 'requestDevice', 'requestLEScan' or 'getDevices' first.")
            return nil
        }
        if checkConnection {
            guard device.isConnected() else {
                call.reject("Not connected to device.")
                return nil
            }
        }
        return device
    }

    private func getTimeout(_ call: CAPPluginCall, defaultTimeout: Double = DEFAULT_TIMEOUT) -> Double {
        guard let timeout = call.getDouble("timeout") else {
            return defaultTimeout
        }
        return timeout / 1000
    }

    private func getCharacteristic(_ call: CAPPluginCall) -> (CBUUID, CBUUID)? {
        guard let service = call.getString("service") else {
            call.reject("Service UUID required.")
            return nil
        }
        let serviceUUID = CBUUID(string: service)

        guard let characteristic = call.getString("characteristic") else {
            call.reject("Characteristic UUID required.")
            return nil
        }
        let characteristicUUID = CBUUID(string: characteristic)
        return (serviceUUID, characteristicUUID)
    }

    private func getDescriptor(_ call: CAPPluginCall) -> (CBUUID, CBUUID, CBUUID)? {
        guard let characteristic = getCharacteristic(call) else {
            return nil
        }
        guard let descriptor = call.getString("descriptor") else {
            call.reject("Descriptor UUID required.")
            return nil
        }
        let descriptorUUID = CBUUID(string: descriptor)

        return (characteristic.0, characteristic.1, descriptorUUID)
    }

    private func getBleDevice(_ device: Device) -> BleDevice {
        var bleDevice = [
            "deviceId": device.getId()
        ]
        if device.getName() != nil {
            bleDevice["name"] = device.getName()
        }
        return bleDevice
    }

    private func getScanResult(_ device: Device, _ advertisementData: [String: Any], _ rssi: NSNumber) -> [String: Any] {
        var data = [
            "device": self.getBleDevice(device),
            "rssi": rssi,
            "txPower": advertisementData[CBAdvertisementDataTxPowerLevelKey] ?? 127,
            "uuids": (advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] ?? []).map({(uuid) -> String in
                return cbuuidToString(uuid)
            })
        ]

        let localName = advertisementData[CBAdvertisementDataLocalNameKey] as? String
        if localName != nil {
            data["localName"] = localName
        }

        let manufacturerData = advertisementData[CBAdvertisementDataManufacturerDataKey] as? Data
        if manufacturerData != nil {
            data["manufacturerData"] = self.getManufacturerData(data: manufacturerData!)
        }

        let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data]
        if serviceData != nil {
            data["serviceData"] = self.getServiceData(data: serviceData!)
        }
        return data
    }

    private func getManufacturerData(data: Data) -> [String: String] {
        var company = 0
        var rest = ""
        for (index, byte) in data.enumerated() {
            if index == 0 {
                company += Int(byte)
            } else if index == 1 {
                company += Int(byte) * 256
            } else {
                rest += String(format: "%02hhx ", byte)
            }
        }
        return [String(company): rest]
    }

    private func getServiceData(data: [CBUUID: Data]) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in data {
            result[cbuuidToString(key)] = dataToString(value)
        }
        return result
    }
}

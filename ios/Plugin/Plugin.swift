import Foundation
import Capacitor
import CoreBluetooth

@objc(BluetoothLe)
public class BluetoothLe: CAPPlugin {
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
    
    @objc func setDisplayStrings(_ call: CAPPluginCall) {
        for key in ["noDeviceFound", "availableDevices", "scanning", "cancel"] {
            if (call.getString(key) != nil) {
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
                    let bleDevice = self.getBleDevice(device)
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

    @objc func connect(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call, checkConnection: false) else { return }
        device.setOnConnected({(success, message) -> Void in
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
        self.deviceManager?.connect(device, {(success, message) -> Void in
            if success {
                print("Connected to peripheral. Waiting for service discovery.")
            } else {
                call.reject(message)
            }
        })

    }

    @objc func createBond(_ call: CAPPluginCall) {
        call.reject("Unavailable")
    }

    @objc func isBonded(_ call: CAPPluginCall) {
        call.reject("Unavailable")
    }

    @objc func disconnect(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call, checkConnection: false) else { return }
        self.deviceManager?.disconnect(device, {(success, message) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(message)
            }
        })
    }

    @objc func read(_ call: CAPPluginCall) {
        guard self.getDeviceManager(call) != nil else { return }
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        device.read(characteristic.0, characteristic.1, {(success, value) -> Void in
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
        device.write(characteristic.0, characteristic.1, value, writeType, {(success, value) -> Void in
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
        device.write(characteristic.0, characteristic.1, value, writeType, {(success, value) -> Void in
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
        device.setNotifications(
            characteristic.0,
            characteristic.1,
            true, {(_, value) -> Void in
                let key = "notification|\(device.getId())|\(characteristic.0.uuidString.lowercased())|\(characteristic.1.uuidString.lowercased())"
                self.notifyListeners(key, data: ["value": value])
            }, {(success, value) -> Void in
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
        device.setNotifications(
            characteristic.0,
            characteristic.1,
            false,
            nil, {(success, value) -> Void in
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
            call.reject("Device not found. Call 'requestDevice' or 'requestLEScan' first.")
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

    private func getBleDevice(_ device: Device) -> [String: Any] {
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

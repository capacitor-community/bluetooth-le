import Foundation
import Capacitor
import CoreBluetooth

@objc(BluetoothLe)
public class BluetoothLe: CAPPlugin {
    private var deviceManager: DeviceManager?
    private var deviceMap = [String: Device]()

    @objc func initialize(_ call: CAPPluginCall) {
        let displayStrings = getConfigValue("displayStrings") as? [String: String] ?? [String: String]()
        self.deviceManager = DeviceManager(self.bridge, displayStrings, {(success, message) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(message)
            }
        })
    }

    @objc func requestDevice(_ call: CAPPluginCall) {
        let services = call.getArray("services", String.self) ?? []
        let serviceUUIDs = services.map({(service) -> CBUUID in
            return CBUUID(string: service)
        })
        let name = call.getString("name", nil)

        guard let deviceManager = self.deviceManager else {
            call.reject("Bluetooth LE not initialized.")
            return
        }
        deviceManager.requestDevice(
            serviceUUIDs,
            name, {(success, message) -> Void in
                // selected a device
                if success {
                    guard let device = deviceManager.getDevice(message) else {
                        call.reject("Device not found.")
                        return
                    }
                    self.deviceMap[device.getId()] = device
                    call.resolve([
                        "deviceId": device.getId(),
                        "name": device.getName()
                    ])
                } else {
                    call.reject(message)
                }
            })
    }

    private func getDevice(_ call: CAPPluginCall, checkConnection: Bool = true) -> Device? {
        guard let deviceId = call.getString("deviceId", nil) else {
            call.reject("deviceId required.")
            return nil
        }
        guard let device = self.deviceMap[deviceId] else {
            call.reject("Device not found. Use 'requestDevice' first.")
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
        guard let service = call.getString("service", nil) else {
            call.reject("service must be provided")
            return nil
        }
        let serviceUUID = CBUUID(string: service)

        guard let characteristic = call.getString("characteristic", nil) else {
            call.reject("characteristic must be provided")
            return nil
        }
        let characteristicUUID = CBUUID(string: characteristic)
        return (serviceUUID, characteristicUUID)
    }

    @objc func connect(_ call: CAPPluginCall) {
        guard let device = self.getDevice(call, checkConnection: false) else { return }
        device.setOnConnected({(success, message) -> Void in
                if success {
                    // only resolve after service discovery
                    call.resolve()
                } else {
                    call.reject(message)
                }
        })
        self.deviceManager?.connect(device, {(success, message) -> Void in
            if success {
                print("Connected to peripheral. Waiting for service discovery.")
            } else {
                call.reject(message)
            }
        })

    }

    @objc func disconnect(_ call: CAPPluginCall) {
        guard let device = self.getDevice(call) else { return }
        self.deviceManager?.disconnect(device, {(success, message) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(message)
            }
        })
    }

    @objc func read(_ call: CAPPluginCall) {
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
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        guard let value = call.getString("value", nil) else {
            call.reject("value must be provided")
            return
        }
        device.write(characteristic.0, characteristic.1, value, {(success, value) -> Void in
            if success {
                call.resolve()
            } else {
                call.reject(value)
            }
        })
    }

    @objc func startNotifications(_ call: CAPPluginCall) {
        guard let device = self.getDevice(call) else { return }
        guard let characteristic = self.getCharacteristic(call) else { return }
        device.setNotifications(
            characteristic.0,
            characteristic.1,
            true, {(_, value) -> Void in
                let key = "notification|\(device.getId())|\(characteristic.0.uuidString.lowercased())|\(characteristic.1.uuidString.lowercased())"
                print("notifcation", key, value)
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
}
